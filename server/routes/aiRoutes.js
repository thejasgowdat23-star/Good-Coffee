import express from 'express';
import { getCurrentMenu, publicAvailableMenu } from '../lib/aiMenu.js';

const router = express.Router();
const requestsByIp = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const SYSTEM_PROMPT = `You are Good Day AI, the friendly AI assistant for Good Day Coffee.

Help customers choose items from the current Good Day Coffee menu. Use only the available products in the MENU below. Never invent products, prices, availability, ingredients, offers, opening hours, or other facts. If the menu does not contain the requested information, say you do not have that information. Keep replies concise and friendly.

When recommending products, include the exact product name, current price in INR, and a short reason. Respect taste, category, availability, and budget constraints. For an item request, say whether it is currently available. Never recommend unavailable products.

Respond as JSON with exactly these keys:
{"reply":"short customer-facing answer","recommendationIds":["ids from MENU that you explicitly recommend"]}

Only include recommendationIds for available MENU products that you explicitly recommend. If none fit, return an empty array.

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

function parseProviderResponse(content) {
  try {
    const parsed = JSON.parse(content);
    return { reply: String(parsed.reply || '').trim(), recommendationIds: Array.isArray(parsed.recommendationIds) ? parsed.recommendationIds.map(String) : [] };
  } catch {
    return { reply: String(content || '').trim(), recommendationIds: [] };
  }
}

router.post('/chat', async (req, res) => {
  if (isRateLimited(req)) return res.status(429).json({ success: false, message: 'Please wait a moment and try again.' });

  const message = String(req.body?.message || '').trim().slice(0, 500);
  if (!message) return res.status(400).json({ success: false, message: 'A message is required.' });
  if (!process.env.AI_API_KEY) return res.status(503).json({ success: false, message: 'AI service unavailable.' });

  try {
    const menu = await getCurrentMenu(req.body?.menu);
    const availableMenu = publicAvailableMenu(menu);
    const history = Array.isArray(req.body?.history)
      ? req.body.history.filter(item => ['user', 'assistant'].includes(item?.role)).slice(-8).map(item => ({ role: item.role, content: String(item.content || '').slice(0, 500) }))
      : [];
    const providerUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
    const providerResponse = await fetch(providerUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.AI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'gpt-4o-mini',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: `${SYSTEM_PROMPT}${JSON.stringify(availableMenu)}` },
          ...history,
          { role: 'user', content: message }
        ]
      })
    });
    if (!providerResponse.ok) throw new Error(`AI provider returned ${providerResponse.status}`);
    const providerPayload = await providerResponse.json();
    const content = providerPayload.choices?.[0]?.message?.content;
    const parsed = parseProviderResponse(content);
    const recommendations = availableMenu.filter(product => parsed.recommendationIds.includes(product.id));
    return res.json({ success: true, reply: parsed.reply || 'I could not find a menu recommendation for that yet.', recommendations });
  } catch (error) {
    console.error('AI chat failed:', error.message);
    return res.status(502).json({ success: false, message: 'AI service unavailable.' });
  }
});

export default router;