import { Request, Response } from 'express';

export async function get(req: Request, res: Response) {
  const siteId = req.params.site_id || req.params.siteId;
  const auctionId = req.params.auction_id || req.params.auctionId;
  const lotId = req.params.lot_id || req.params.lotId;
  const base = process.env.NEXTLOT_BASE_URL || 'https://enter-base-url-here';
  const targetUrl = `${base}/sites/${siteId}/auctions/${auctionId}/lots/${lotId}`;

  return res.json({
    site_id: siteId,
    auction_id: auctionId,
    lot_id: lotId,
    targetUrl,
    message: 'Placeholder response for getting specific lot. Set NEXTLOT_BASE_URL to enable real integration.',
    lot: {
      id: lotId,
      auction_id: auctionId,
      site_id: siteId,
      title: 'Placeholder Lot',
      status: 'draft',
    },
  });
}