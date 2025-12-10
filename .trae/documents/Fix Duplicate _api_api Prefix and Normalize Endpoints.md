## Findings
- Vercel maps serverless functions to `/api/*`. Our app also mounts the API router at `/api` (`server/app.ts:23`), so deployed URLs become `/api/api/*`.
- Routers themselves do not re-prefix `/api`; they assume the mount prefix from `app.ts`. Current internal paths are correct.

## Proposed Changes
- Change router mount in `server/app.ts` from `app.use('/api', apiRouter)` to `app.use('/', apiRouter)`.
- Update the Postman collection to use corrected paths (`/api/health`, `/api/sites/...`, etc.).
- No changes to individual routers; their internal paths stay the same.

## Resulting Endpoint Matrix
- Root: `GET /api/` (deployed) • `GET /` (local)
- Health: `GET /api/health` (deployed) • `GET /health` (local)
- Auth: `POST /api/auth/install`, `POST /api/auth/login`, `GET /api/auth/me`
- Sites: `GET /api/sites/:site_id/info`
- Auctions: `GET/POST /api/sites/:site_id/auctions`, `GET/PUT /api/sites/:site_id/auctions/:auction_id`, `GET /api/sites/:site_id/auctions/:auction_id/closed_lots`
- Lots: `GET/POST /api/sites/:site_id/auctions/:auction_id/lots`, `GET/PUT/DELETE /api/sites/:site_id/auctions/:auction_id/lots/:lot_id`
- Proxy: `GET /api/proxy/*` (unchanged; still forwards to `PROXY_TARGET`)

## Verification Plan
- Local: start `npm run dev:server`, test `GET http://localhost:3000/health` and two sample routes.
- Vercel: test `GET https://nextlotendpoints.vercel.app/api/health` and `/api/sites/:site_id/info`.
- Update Postman collection entries to match the above, then run requests with `Authorization` when needed.

## Notes
- Local vs deployed prefixes will differ: local `/...`; deployed `/api/...`. This is expected with Vercel’s function mapping.
- No business logic changes; only mount path and collection updates to remove duplication.