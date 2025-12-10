## Overview
- Backend base: `https://api-backend.nextlot-beta.com/api/backend/v1`
- Vercel domain for Postman: `https://nextlotendpoints.vercel.app`
- Goal: Wire env vars and document endpoints so Postman can hit the backend via Vercel.

## Current Wiring
- Controllers build backend URLs using `process.env.NEXTLOT_BASE_URL`:
  - `server/controllers/sites/info.ts:6` and `server/controllers/auctions/list.ts:5` compute `targetUrl`.
- Proxy middleware forwards `/proxy/*` to `process.env.PROXY_TARGET` with path rewrite:
  - `server/middlewares/proxyInterceptor.ts:13–19`.
- Express app is exported as a Vercel serverless function at `/api`:
  - `api/index.ts:4–5` exports app, `server/app.ts:23` mounts subrouter at `/api`.

## Env Configuration (Vercel)
- Set `NEXTLOT_BASE_URL = https://api-backend.nextlot-beta.com/api/backend/v1`.
- Add `PROXY_TARGET = https://api-backend.nextlot-beta.com/api/backend/v1` (used by `/proxy/*`).
- Optional: tune `CORS_ORIGIN` if needed (`server/app.ts:10,13`).
- You can set these in the Vercel project settings or update `vercel.json` (`vercel.json:12–13`).

## Postman Endpoints (Vercel)
- Health (Express router is under `/api` inside the app, so external path is `/api/api/...`):
  - `GET https://nextlotendpoints.vercel.app/api/api/health` (`server/routes/api.ts:10–13`).
- Root health JSON:
  - `GET https://nextlotendpoints.vercel.app/api/` (`server/app.ts:25–27`).
- Proxy to backend (recommended while controllers are placeholders):
  - `GET https://nextlotendpoints.vercel.app/api/proxy/sites/{site_id}/info`
  - `GET https://nextlotendpoints.vercel.app/api/proxy/sites/{site_id}/auctions`
  - `GET https://nextlotendpoints.vercel.app/api/proxy/sites/{site_id}/auctions/{auction_id}/lots`
- Auth header propagation works through the proxy (`server/middlewares/proxyInterceptor.ts:24–26`).

## Controller Behavior (Now)
- Controllers currently return placeholder JSON with the computed `targetUrl` and do not call the backend:
  - Example: `server/controllers/sites/info.ts:9–13`, `server/controllers/auctions/list.ts:8–13`.
- Using `/api/proxy/...` lets you hit the real backend immediately via Vercel.

## Next Steps (upon approval)
- Update `vercel.json` or Vercel envs with `NEXTLOT_BASE_URL` and `PROXY_TARGET` values.
- Replace placeholder controllers with real `fetch()` calls to the backend using `NEXTLOT_BASE_URL`.
- Ship a small Postman collection with the above endpoints and example headers (Authorization, JSON).