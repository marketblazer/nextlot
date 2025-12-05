## Triggers (GET)
### Implemented
- GET /api/health — server/routes/api.ts:10
- GET /api/auth/me — server/routes/api.ts:17
- GET /api/examples — server/routes/api.ts:23
- GET /api/sites/:site_id/info — server/routes/sites.ts:8
- GET /api/sites/:site_id/auctions — server/routes/auctions.ts:7
- GET /api/sites/:site_id/auctions/:auction_id — server/routes/auctions.ts:13
- GET /api/sites/:site_id/auctions/:auction_id/closed_lots — server/routes/auctions.ts:21
- GET /api/sites/:site_id/auctions/:auction_id/lots — server/routes/lots.ts:10
- GET /api/sites/:site_id/auctions/:auction_id/lots/:lot_id — server/routes/lots.ts:16

### To Add (as Triggers)
- GET /api/sites/:site_id/auctions/:auction_id/lots/:lot_id/bids
- GET /api/sites/:site_id/auctions/:auction_id/bidders
- GET /api/sites/:site_id/bidders
- GET /api/sites/:site_id/bidders/:bidder_uniq_identifier
- GET /api/sites/:site_id/inventory_items/:inventory_item_id
- GET /api/sites/:site_id/bidding_warrants
- GET /api/sites/:site_id/bidding_warrants/:bidding_warrant_id

## Actions (POST/PUT/DELETE)
### Implemented
- POST /api/auth/install — server/routes/api.ts:15
- POST /api/auth/login — server/routes/api.ts:16
- POST /api/examples — server/routes/api.ts:24
- POST /api/sites/:site_id/auctions — server/routes/auctions.ts:11
- PUT /api/sites/:site_id/auctions/:auction_id — server/routes/auctions.ts:17
- POST /api/sites/:site_id/auctions/:auction_id/lots — server/routes/lots.ts:13
- PUT /api/sites/:site_id/auctions/:auction_id/lots/:lot_id — server/routes/lots.ts:19
- DELETE /api/sites/:site_id/auctions/:auction_id/lots/:lot_id — server/routes/lots.ts:22

### To Add (as Actions)
- POST /api/sites/:site_id/auctions/:auction_id/bidders
- PUT /api/sites/:site_id/auctions/:auction_id/bidders/:bidder_id
- POST /api/sites/:site_id/bidders
- PUT /api/sites/:site_id/bidders/:bidder_uniq_identifier
- POST /api/sites/:site_id/inventory_items
- PUT /api/sites/:site_id/inventory_items/:inventory_item_id
- POST /api/sites/:site_id/bidding_warrants
- PUT /api/sites/:site_id/bidding_warrants/:bidding_warrant_id

## Webhook Triggering
- All GET endpoints above are treated as "Triggers" via the webhook system: subscriptions to event types (e.g., lot.created, bid.created) deliver signed POSTs to your target URL when new data is detected.
- Existing subscription APIs (webhooks) remain:
  - POST /api/webhooks/subscriptions — create
  - GET /api/webhooks/subscriptions — list
  - DELETE /api/webhooks/subscriptions/:id — remove
  - POST /api/webhooks/test — send signed test event

## Next Step
- I will implement the missing GET (trigger) endpoints and the corresponding POST/PUT (action) endpoints you listed, wired into the webhook poller/event map. Confirm and I’ll proceed to add them.