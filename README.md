# Good Day Coffee

A lightweight React + Vite customer frontend for Good Day Coffee. The customer shell is intentionally short: a coffee-cup hero, available coffee and snack strips, a compact AI teaser, and a small footer.

## Current repository boundary

This workspace contains the Vite frontend and a small Express/Supabase order API. The frontend uses the existing localStorage menu as a development fallback and sends completed table orders to the server when `VITE_API_BASE_URL` is configured.

Expected server endpoints:

- `GET /api/coffee`
- `GET /api/snacks`
- `POST`, `PUT`, `DELETE` and availability PATCH routes for each menu
- `POST /api/chat`
- `POST /api/orders`
- `GET /api/orders`
- `PATCH /api/orders/:orderNumber/status`

The API response may be an array or `{ products: [] }`. Product records should expose `available` or the existing `inStock` boolean, `name`, `price`, `image`, and a lowercase `menuCategory` (`coffee` or `snacks`). The order API is also available as a Vercel serverless function under the same-origin `/api` path. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the Vercel project environment variables; leave `VITE_API_BASE_URL` empty for a same-project deployment, or set it to the URL of a separately deployed API.

## Run the frontend

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` for the browser API origin. Put the Supabase URL and service-role key only in `server/.env`; they must never be prefixed with `VITE_` or placed in the root frontend environment file.

## Run the app and API

1. Paste your Supabase project credentials into `server/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

2. Start both services with:

```bash
npm run dev:all
```

Or use separate terminals:

```bash
npm run dev
npm run server
```

The API health check is available at `http://localhost:5000/api/health`. Run `server/supabase/schema.sql` in the Supabase SQL Editor first. After placing an order, verify it with `GET http://localhost:5000/api/orders` or in the Supabase dashboard under the `public.orders` table.

## Daily menu workflow

Customer pages are separate hash routes:

- `#/coffee`
- `#/snacks`
- `#/ai-assistant`

Shared UI lives in `src/components/` (`ProductCard`, `PriceTag`, cart, checkout, and admin orders). `src/hooks/useMenu.js` fetches the live coffee or snacks endpoint and falls back to local development data when no API origin is configured. The Express/Supabase API persists table orders and preserves order-time item price snapshots.

The requested seed commands are reserved in `package.json`:

```bash
npm run seed:coffee
npm run seed:snacks
npm run seed:all
```

The placeholder scripts in `database/seed/` are reserved for future server-backed menu seeding and currently do not connect to MongoDB.

## Chatbot setup

The lightweight assistant calls `POST /api/chat` when `VITE_API_BASE_URL` is set and keeps a friendly local fallback when the endpoint is unavailable. The current backend scope is order persistence; chatbot implementation remains external to this repository.

## Favicons

Generate the complete set from the bold espresso/cream cup source:

```bash
npm run generate:favicons
```

The generator uses `sharp` and `png-to-ico` and writes the 16, 32, 48, 180, 192, 512, ICO, and manifest assets into `public/`. After changing favicon assets, hard refresh with `Ctrl+Shift+R` because browsers cache favicons aggressively.

Optimize local development renders with:

```bash
npm run optimize:images
```

This writes WebP fallbacks into `public/images/3d/`. Replace those files with the final Gemini-generated 3D renders when ready; remote product URLs from the database continue to work unchanged.

## Performance decisions

GSAP, Lenis, canvas particles, confetti, scroll pinning, scroll scrubbing, parallax, film grain, background motion, and backdrop blur are removed. The only visual motion is short hover/press transitions. Product cards are memoized, below-fold images are lazy-loaded with explicit dimensions, and the AI route is code-split with `React.lazy`. Run `npm run lint` and `npm run build` before shipping.
