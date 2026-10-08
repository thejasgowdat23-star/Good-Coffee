import express from 'express';
import { getCurrentMenu, publicAvailableMenu } from '../lib/aiMenu.js';

const router = express.Router();
const requestsByIp = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 25;

const SYSTEM_PROMPT = `You are Good Day AI, the friendly and knowledgeable AI Barista for Good Day Coffee.
Your goal is to warmly assist customers, answer questions about our coffee and bakery menu, and give personalized recommendations based on their taste, mood, or budget.

Rules:
1. ONLY recommend products that exist in the MENU below.
2. Keep your replies warm, helpful, and concise (1-2 sentences).
3. Do NOT invent items, prices, discounts, or opening hours that are not in the menu.
4. Output your response ONLY as a valid JSON object in this exact format (no markdown formatting, no code blocks):
{"reply":"friendly answer to customer","recommendationIds":["id1","id2"]}
5. If no specific products need to be recommended, return an empty array for recommendationIds.

MENU:
`;

function clientKey(request) {
  return request.headers['x-forwarded-for']?.split(',')[0]?.trim() || request.ip || 'unknown';
}

function isRateLimited(request) {
  const now = Date.now();
  const key = clientKey(request);
  const recent = (requestsByIp.get(key) || []).filter(timestamp => now - timestamp < WINDOW_MS);
  recent.push(now);
  requestsByIp.set(key, recent);
  if (requestsByIp.size > 1000) {
    for (const [storedKey, timestamps] of requestsByIp) {
      if (!timestamps.some(timestamp => now - timestamp < WINDOW_MS)) requestsByIp.delete(storedKey);
    }
  }
  return recent.length > MAX_REQUESTS;
}

function generateSmartFallbackReply(messageText, availableMenu = []) {
  const query = messageText.toLowerCase().trim();

  // Budget under 150
  if (query.includes('under 150') || query.includes('under ₹150') || query.includes('budget') || query.includes('cheap') || query.includes('affordable')) {
    const budgetItems = availableMenu.filter(p => p.price <= 150).slice(0, 3);
    return {
      reply: 'Here are some great handcrafted options under ₹150 from our menu!',
      recommendationIds: budgetItems.map(p => p.id)
    };
  }

  // Cold brew / Iced
  if (query.includes('cold brew') || query.includes('iced') || query.includes('cold') || query.includes('frappe') || query.includes('cooler')) {
    const coldItems = availableMenu.filter(p =>
      p.name.toLowerCase().includes('cold') ||
      p.name.toLowerCase().includes('iced') ||
      p.name.toLowerCase().includes('brew') ||
      (p.category || '').toLowerCase().includes('cold')
    ).slice(0, 3);
    const selected = coldItems.length > 0 ? coldItems : availableMenu.slice(0, 2);
    return {
      reply: 'Looking for a refreshing chill? Here are our top iced and cold brew favorites!',
      recommendationIds: selected.map(p => p.id)
    };
  }

  // Snacks & bakes
  if (query.includes('snack') || query.includes('bake') || query.includes('croissant') || query.includes('cookie') || query.includes('muffin') || query.includes('eat') || query.includes('food')) {
    const snackItems = availableMenu.filter(p =>
      (p.category || '').toLowerCase() === 'snacks' ||
      (p.category || '').toLowerCase() === 'bakery' ||
      (p.menuCategory || '').toLowerCase() === 'snacks'
    ).slice(0, 3);
    const selected = snackItems.length > 0 ? snackItems : availableMenu.slice(0, 2);
    return {
      reply: 'Here are some freshly baked treats and snacks that pair wonderfully with our drinks!',
      recommendationIds: selected.map(p => p.id)
    };
  }

  // Sweet treats
  if (query.includes('sweet') || query.includes('dessert') || query.includes('chocolate') || query.includes('caramel') || query.includes('cake')) {
    const sweetItems = availableMenu.filter(p =>
      p.name.toLowerCase().includes('sweet') ||
      p.name.toLowerCase().includes('chocolate') ||
      p.name.toLowerCase().includes('caramel') ||
      p.name.toLowerCase().includes('muffin') ||
      p.name.toLowerCase().includes('croissant') ||
      p.name.toLowerCase().includes('cookie') ||
      p.name.toLowerCase().includes('mocha')
    ).slice(0, 3);
    const selected = sweetItems.length > 0 ? sweetItems : availableMenu.slice(0, 2);
    return {
      reply: 'Craving something sweet? Indulge in these delightful sweet treats and rich flavors!',
      recommendationIds: selected.map(p => p.id)
    };
  }

  // Coffee recommendations
  if (query.includes('recommend') || query.includes('coffee') || query.includes('best') || query.includes('popular') || query.includes('special')) {
    const coffeeItems = availableMenu.filter(p =>
      (p.category || '').toLowerCase() === 'coffee' ||
      (p.menuCategory || '').toLowerCase() === 'coffee' ||
      p.name.toLowerCase().includes('coffee') ||
      p.name.toLowerCase().includes('latte') ||
      p.name.toLowerCase().includes('cappuccino') ||
      p.name.toLowerCase().includes('espresso')
    ).slice(0, 3);
    const selected = coffeeItems.length > 0 ? coffeeItems : availableMenu.slice(0, 3);
    return {
      reply: "I'd love to recommend our signature handcrafted coffees! Here are customer favorites brewed fresh for you.",
      recommendationIds: selected.map(p => p.id)
    };
  }

  // Greetings
  if (query === 'hi' || query === 'hello' || query === 'hey' || query.startsWith('hi ') || query.startsWith('hello ') || query.startsWith('hey ')) {
    const topItems = availableMenu.slice(0, 2);
    return {
      reply: 'Hello! Welcome to Good Day Coffee. What kind of coffee, iced brew, or fresh bake can I recommend for you today?',
      recommendationIds: topItems.map(p => p.id)
    };
  }

  // Keyword match across product names and descriptions
  const words = query.split(/\s+/).filter(w => w.length > 2);
  const matched = availableMenu.filter(p => {
    const name = p.name.toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();
    return words.some(word => name.includes(word) || desc.includes(word) || cat.includes(word));
  }).slice(0, 3);

  if (matched.length > 0) {
    return {
      reply: `Here are our top menu recommendations matching your request:`,
      recommendationIds: matched.map(p => p.id)
    };
  }

  return {
    reply: "I'm here to help you discover our coffees, iced drinks, and bakery treats! What flavors or drinks do you enjoy?",
    recommendationIds: availableMenu.slice(0, 2).map(p => p.id)
  };
}

function parseProviderResponse(content) {
  if (!content) return { reply: '', recommendationIds: [] };
  let raw = String(content).trim();

  // Strip markdown code fences if present
  raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const reply = String(parsed.reply || parsed.message || parsed.response || '').trim();
      return {
        reply,
        recommendationIds: Array.isArray(parsed.recommendationIds) ? parsed.recommendationIds.map(String) : []
      };
    }
  } catch (_) {
    // Try matching first valid JSON object
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (parsed && typeof parsed === 'object') {
          return {
            reply: String(parsed.reply || parsed.message || parsed.response || '').trim(),
            recommendationIds: Array.isArray(parsed.recommendationIds) ? parsed.recommendationIds.map(String) : []
          };
        }
      } catch (_) {}
    }
  }

  // Strip unwanted AI JSON intro preambles
  raw = raw.replace(/^Here is the JSON requested:?\s*/i, '').replace(/```json/gi, '').replace(/```/g, '').trim();
  return { reply: raw, recommendationIds: [] };
}

function formatMenuPrompt(availableMenu) {
  return availableMenu
    .map(p => `ID:${p.id} | ${p.name} | ₹${p.price} | ${p.category || 'Coffee'}`)
    .join('\n');
}

function providerRequest({ provider, providerUrl, model, apiKey, systemPrompt, history, message }) {
  if (provider === 'gemini') {
    return {
      url: `${providerUrl.replace(/\/$/, '')}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [
            ...history,
            { role: 'user', parts: [{ text: message }] }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 800,
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                reply: { type: 'STRING' },
                recommendationIds: {
                  type: 'ARRAY',
                  items: { type: 'STRING' }
                }
              },
              required: ['reply', 'recommendationIds']
            }
          }
        })
      }
    };
  }

  return {
    url: providerUrl,
    options: {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: message }]
      })
    }
  };
}

function providerContent(payload, provider) {
  return provider === 'gemini'
    ? payload.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('')
    : payload.choices?.[0]?.message?.content;
}

router.post('/chat', async (req, res) => {
  if (isRateLimited(req)) return res.status(429).json({ success: false, message: 'Please wait a moment and try again.' });

  const message = String(req.body?.message || '').trim().slice(0, 500);
  if (!message) return res.status(400).json({ success: false, message: 'A message is required.' });

  try {
    const menu = await getCurrentMenu(req.body?.menu);
    const availableMenu = publicAvailableMenu(menu);
    const provider = String(process.env.AI_PROVIDER || 'gemini').toLowerCase();
    const apiKey = (process.env.AI_API_KEY || '').trim();

    // If no valid Gemini/OpenAI key is set (e.g. placeholder or invalid token), seamlessly use smart Barista fallback
    const isApiKeyValid = apiKey && !apiKey.startsWith('AQ.') && !apiKey.includes('YOUR_') && apiKey.length > 20;

    if (!isApiKeyValid) {
      const fallback = generateSmartFallbackReply(message, availableMenu);
      const recommendations = availableMenu.filter(product => fallback.recommendationIds.includes(product.id));
      return res.json({ success: true, reply: fallback.reply, recommendations });
    }

    const history = Array.isArray(req.body?.history)
      ? req.body.history.filter(item => ['user', 'assistant', 'model'].includes(item?.role)).slice(-4).map(item => provider === 'gemini'
        ? { role: item.role === 'assistant' ? 'model' : 'user', parts: [{ text: String(item.content || '').slice(0, 300) }] }
        : { role: item.role, content: String(item.content || '').slice(0, 300) })
      : [];

    const model = process.env.AI_MODEL || (provider === 'gemini' ? 'gemini-2.0-flash' : 'gpt-4o-mini');
    const providerUrl = process.env.AI_API_URL || (provider === 'gemini' ? 'https://generativelanguage.googleapis.com/v1beta' : 'https://api.openai.com/v1/chat/completions');
    const compactMenu = formatMenuPrompt(availableMenu);

    const request = providerRequest({
      provider,
      providerUrl,
      model,
      apiKey,
      systemPrompt: `${SYSTEM_PROMPT}\n${compactMenu}`,
      history,
      message
    });

    const providerResponse = await fetch(request.url, request.options);
    if (!providerResponse.ok) {
      const errText = await providerResponse.text().catch(() => '');
      console.warn(`AI provider returned HTTP ${providerResponse.status}: ${errText}. Using smart Barista fallback.`);
      const fallback = generateSmartFallbackReply(message, availableMenu);
      const recommendations = availableMenu.filter(product => fallback.recommendationIds.includes(product.id));
      return res.json({ success: true, reply: fallback.reply, recommendations });
    }

    const providerPayload = await providerResponse.json();
    const content = providerContent(providerPayload, provider);
    const parsed = parseProviderResponse(content);

    let finalReply = parsed.reply;
    let recIds = parsed.recommendationIds;

    if (!finalReply) {
      const fallback = generateSmartFallbackReply(message, availableMenu);
      finalReply = fallback.reply;
      recIds = fallback.recommendationIds;
    }

    const recommendations = availableMenu.filter(product => recIds.includes(product.id));
    return res.json({ success: true, reply: finalReply, recommendations });
  } catch (error) {
    console.warn('AI chat error (falling back to smart Barista):', error.message);
    const menu = await getCurrentMenu(req.body?.menu);
    const availableMenu = publicAvailableMenu(menu);
    const fallback = generateSmartFallbackReply(message, availableMenu);
    const recommendations = availableMenu.filter(product => fallback.recommendationIds.includes(product.id));
    return res.json({ success: true, reply: fallback.reply, recommendations });
  }
});

export default router;