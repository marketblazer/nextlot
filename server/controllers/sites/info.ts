import { Request, Response } from 'express';

// Placeholder controller for site info until base URL is provided
export async function info(req: Request, res: Response) {
  const siteId = req.params.site_id || req.params.siteId;
  const base = process.env.NEXTLOT_BASE_URL || 'https://enter-base-url-here';
  const targetUrl = `${base}/sites/${siteId}/info`;

  return res.json({
    site_id: siteId,
    targetUrl,
    message: 'Placeholder response. Set NEXTLOT_BASE_URL to enable real integration.',
  });
}