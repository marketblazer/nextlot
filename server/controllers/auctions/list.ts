import { Request, Response } from 'express';

export async function list(req: Request, res: Response) {
  const siteId = req.params.site_id || req.params.siteId;
  const base = process.env.NEXTLOT_BASE_URL || 'https://enter-base-url-here';
  const targetUrl = `${base}/sites/${siteId}/auctions`;

  return res.json({
    site_id: siteId,
    targetUrl,
    message: 'Placeholder response for listing auctions. Set NEXTLOT_BASE_URL to enable real integration.',
    auctions: [],
  });
}