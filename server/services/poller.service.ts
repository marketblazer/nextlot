import { WebhookService } from './webhook.service.ts';
import { DeliveryService } from './delivery.service.ts';
import crypto from 'crypto';

type FetchFn = (siteId?: string, auctionId?: string) => Promise<{ cursor: string; items: any[] }>;

const fetchers: Record<string, FetchFn> = {
  'lot.created': async () => ({ cursor: new Date().toISOString(), items: [] }),
  'lot.updated': async () => ({ cursor: new Date().toISOString(), items: [] }),
  'bid.created': async () => ({ cursor: new Date().toISOString(), items: [] }),
  'auction_bidder.created': async () => ({ cursor: new Date().toISOString(), items: [] }),
  'auction_bidder.updated': async () => ({ cursor: new Date().toISOString(), items: [] }),
  'site_bidder.created': async () => ({ cursor: new Date().toISOString(), items: [] }),
  'site_bidder.updated': async () => ({ cursor: new Date().toISOString(), items: [] }),
  'inventory_item.created': async () => ({ cursor: new Date().toISOString(), items: [] }),
  'inventory_item.updated': async () => ({ cursor: new Date().toISOString(), items: [] }),
  'bidding_warrant.created': async () => ({ cursor: new Date().toISOString(), items: [] }),
  'bidding_warrant.updated': async () => ({ cursor: new Date().toISOString(), items: [] }),
};

async function processSubscription(subId: string) {
  const sub = WebhookService.get(subId);
  if (!sub || sub.disabled) return;
  for (const evt of sub.eventTypes) {
    const fn = fetchers[evt];
    if (!fn) continue;
    const r = await fn(sub.siteId, sub.auctionId);
    const last = sub.cursors?.[evt];
    if (r.cursor && r.cursor !== last && r.items.length > 0) {
      for (const item of r.items) {
        const payload = {
          event_id: crypto.randomUUID(),
          event_type: evt,
          site_id: sub.siteId,
          auction_id: sub.auctionId,
          data: item,
          triggered_at: new Date().toISOString(),
        };
        await DeliveryService.deliver(sub.targetUrl, payload, {
          'x-event-type': evt,
          ...(sub.siteId ? { 'x-site-id': sub.siteId } : {}),
          ...(sub.auctionId ? { 'x-auction-id': sub.auctionId } : {}),
        });
      }
      WebhookService.updateCursor(sub.id, evt, r.cursor);
    }
  }
}

let timer: NodeJS.Timer | undefined;

export const PollerService = {
  start(): void {
    const enabled = (process.env.ENABLE_WEBHOOKS || 'false').toLowerCase() === 'true';
    if (!enabled) return;
    const interval = parseInt(process.env.POLL_INTERVAL_MS || '30000', 10);
    if (timer) clearInterval(timer);
    timer = setInterval(async () => {
      for (const id of WebhookService.all().keys()) {
        await processSubscription(id);
      }
    }, interval);
  },
  stop(): void {
    if (timer) clearInterval(timer);
    timer = undefined;
  },
};