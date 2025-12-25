import { Request, Response } from 'express';

export async function create(req: Request, res: Response) {
  const siteId = req.params.site_id || req.params.siteId;
  const base = process.env.NEXTLOT_BASE_URL || 'https://api-backend.nextlot.net/api/backend/v1';
  const targetUrl = `${base}/sites/${siteId}/auctions`;

  const headers: Record<string, string> = {
    accept: 'application/json',
    'content-type': 'application/json',
  };
  const shared = (req.headers['nextlot-server-token'] as string | undefined) || process.env.NEXTLOT_SERVER_TOKEN || '';
  if (shared) headers['Nextlot-Server-Token'] = shared;

  try {
    const resp = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body ?? {}),
    });
    const data = await resp.json().catch(() => ({}));
    return res.status(resp.status).json(data);
  } catch (err: any) {
    return res.status(502).json({ error: 'Bad Gateway', detail: String(err) });
  }
}