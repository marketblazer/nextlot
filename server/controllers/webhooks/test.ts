import { Request, Response } from 'express';
import { DeliveryService } from '../../services/delivery.service.ts';

export async function send(req: Request, res: Response) {
  const { target_url, payload } = req.body || {};
  if (!target_url) return res.status(400).json({ error: 'target_url is required' });
  const eventType = (req.body?.event_type as string) || 'test.event';
  const headers = { 'x-event-type': eventType } as Record<string, string>;
  const result = await DeliveryService.deliver(target_url, payload ?? { ok: true }, headers);
  return res.json({ delivered: result.ok, status: result.status, error: result.error });
}