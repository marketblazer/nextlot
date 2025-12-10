import { Request, Response } from 'express';

export async function update(req: Request, res: Response) {
  const siteId = req.params.site_id || req.params.siteId;
  const auctionId = req.params.auction_id;
  const base = process.env.NEXTLOT_BASE_URL || 'https://enter-base-url-here';
  const targetUrl = `${base}/sites/${siteId}/auctions/${auctionId}`;

  const headers: Record<string, string> = {
    accept: 'application/json',
    'content-type': 'application/json',
  };
  const auth = req.headers['authorization'];
  if (auth) headers['authorization'] = String(auth);

  try {
    const resp = await fetch(targetUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(req.body ?? {}),
    });
    const data = await resp.json().catch(() => ({}));
    return res.status(resp.status).json(data);
  } catch (err: any) {
    return res.status(502).json({ error: 'Bad Gateway', detail: String(err) });
  }
}