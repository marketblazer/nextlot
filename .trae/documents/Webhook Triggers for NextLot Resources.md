## Objectives
- Add a webhook trigger system so new data on NextLot automatically notifies your app or Zapier-like endpoints.
- Cover all listed GET resources (lots, bids, bidders, inventory items, warrants) with event-specific triggers.
- Keep your existing GET endpoints unchanged; webhooks run in parallel and push new data when detected.

## Covered Resources & Event Types
- Lots: `lot.created`, `lot.updated`, `lot.deleted`
- Lot Bids: `bid.created`
- Auction Bidders: `auction_bidder.created`, `auction_bidder.updated`
- Site Bidders: `site_bidder.created`, `site_bidder.updated`
- Inventory Items: `inventory_item.created`, `inventory_item.updated`
- Bidding Warrants: `bidding_warrant.created`, `bidding_warrant.updated`

Targets (existing GETs):
- `/sites/{site_id}/auctions/{auction_id}/lots`
- `/sites/{site_id}/auctions/{auction_id}/lots/{lot_id}`
- `/sites/{site_id}/auctions/{auction_id}/lots/{lot_id}/bids`
- `/sites/{site_id}/auctions/{auction_id}/bidders`
- `/sites/{site_id}/inventory_items/{inventory_item_id}`
- `/sites/{site_id}/bidders`, `/sites/{site_id}/bidders/{bidder_uniq_identifier}`
- `/sites/{site_id}/bidding_warrants`, `/sites/{site_id}/bidding_warrants/{bidding_warrant_id}`

## High-Level Design
- Webhook Subscriptions: clients register a target URL and the event types they care about, optionally scoping to `site_id` and `auction_id`.
- Polling Detector: a lightweight scheduler polls NextLot (via `NEXTLOT_BASE_URL`) for each subscription and detects new/updated records using an `updated_at` field or a cursor strategy. When changes are found, we fetch the resource and emit a webhook call.
- Secure Delivery: each webhook delivery is signed (HMAC SHA-256) with `WEBHOOK_SIGNING_SECRET`. Include headers like `x-event-id`, `x-event-type`, `x-site-id`, `x-auction-id`, `x-resource-path`.
- Reliability: retries with exponential backoff; dedupe via `event_id`; optional disable on repeated failures.
- Storage: start with in-memory subscriptions plus last cursor; optionally add JSON file persistence later (keeping secrets out of code).

## New API Surface
- `POST /api/webhooks/subscriptions` — create subscription
  - body: `{ target_url, event_types[], site_id?, auction_id?, filters? }`
  - returns: `{ id, status }`
- `GET /api/webhooks/subscriptions` — list subscriptions
- `DELETE /api/webhooks/subscriptions/{id}` — remove subscription
- `POST /api/webhooks/test` — emit a signed test event to a provided `target_url`

Webhook Delivery Payload (example):
```json
{
  "event_id": "uuid",
  "event_type": "lot.created",
  "site_id": "abc",
  "auction_id": "def",
  "resource_path": "/sites/abc/auctions/def/lots/123",
  "data": { /* fetched current resource data */ },
  "triggered_at": "2025-12-02T12:34:56Z"
}
```
Headers:
- `x-webhook-signature: sha256=...` (HMAC of body)
- `x-event-id`, `x-event-type`, `x-site-id`, `x-auction-id`

## Polling & Change Detection
- Interval: `POLL_INTERVAL_MS` (default 30s).
- Per subscription, call the relevant NextLot list endpoint (e.g., lots for a given auction) using stored credentials or headers.
- Cursor Strategy:
  - Prefer `updated_at`/`created_at` fields if available.
  - Fallback to highest `id` seen or a content fingerprint (hash of stable fields).
- For each new/updated item since the last cursor, emit one webhook event.

## Security & Auth
- Outbound signing via `WEBHOOK_SIGNING_SECRET`.
- Use your existing auth patterns when fetching NextLot: `Authorization: Bearer <NEXTLOT token>` or API key stored via `/api/auth/install`.
- Rate-limit webhook deliveries per target URL to prevent abuse.

## Implementation Steps
1. Create `webhooks` router: subscriptions CRUD + test endpoint.
2. Create `WebhookService` (in-memory store): manage subscriptions and last cursors.
3. Create `PollerService`:
   - Maps event types to NextLot fetchers (e.g., lots, bidders, bids).
   - Schedules polling via `setInterval` and invokes deliveries.
4. Create `DeliveryService`:
   - Signs payloads, sends HTTP POST, retries on failure, marks status.
5. Wire poller startup in `server/index.ts` if `ENABLE_WEBHOOKS=true`.
6. Add small utilities for cursor management and hashing.

## Testing Plan
- Unit-test cursor detection and dedupe logic.
- Spin up dev server and register a subscription pointing to a public request bin or local endpoint.
- Verify signed payload, headers, and retries behavior.
- Validate per-resource mappings: lots, bids, bidders, inventory items, warrants.

## Configuration
- `NEXTLOT_BASE_URL` — NextLot API base
- `ENABLE_WEBHOOKS=true` — enable scheduler
- `POLL_INTERVAL_MS=30000` — polling interval (ms)
- `WEBHOOK_SIGNING_SECRET` — HMAC secret
- Reuse `NEXTLOT_SERVER_TOKEN` or stored API key via `/api/auth/install`

## Deliverables
- New routers/controllers/services for webhooks, poller, and delivery
- Full coverage of listed resources with event-type mapping
- Example cURL for subscription creation and a test event endpoint to validate Zapier hooks

If this plan looks good, I’ll implement the router/services, wire the scheduler, and provide sample registration calls and tests.