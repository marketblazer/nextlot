import { Request, Response } from 'express';
import { WebhookService } from '../../services/webhook.service.ts';

export async function create(req: Request, res: Response) {
  const { target_url, event_types, site_id, auction_id, filters } = req.body || {};
  if (!target_url || !Array.isArray(event_types) || event_types.length === 0) {
    return res.status(400).json({ error: 'target_url and event_types are required' });
  }
  const sub = WebhookService.create({ targetUrl: target_url, eventTypes: event_types, siteId: site_id, auctionId: auction_id, filters });
  return res.status(201).json({ id: sub.id, status: 'active' });
}

export async function list(_req: Request, res: Response) {
  const subs = WebhookService.list();
  return res.json({ subscriptions: subs });
}

export async function remove(req: Request, res: Response) {
  const id = req.params.id;
  const ok = WebhookService.remove(id);
  if (!ok) return res.status(404).json({ error: 'Not Found' });
  return res.json({ id, removed: true });
}