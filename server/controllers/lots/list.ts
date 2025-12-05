import { Request, Response } from 'express';

export async function list(req: Request, res: Response) {
  const siteId = req.params.site_id || req.params.siteId;
  const auctionId = req.params.auction_id || req.params.auctionId;
  const base = process.env.NEXTLOT_BASE_URL || 'https://enter-base-url-here';
  const targetUrl = `${base}/sites/${siteId}/auctions/${auctionId}/lots`;

  return res.json({
    site_id: siteId,
    auction_id: auctionId,
    targetUrl,
    message: 'Placeholder response for listing lots. Set NEXTLOT_BASE_URL to enable real integration.',
    lots: [],
  });
}