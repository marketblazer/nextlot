import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { verifyToken, TokenPayload } from '../utils/jwt.ts';
import { verifyCredentials, verifyApiKey } from '../services/auth.service.ts';

function isPublicRoute(req: Request): boolean {
  const path = req.path.toLowerCase();
  if (path.startsWith('/auth/')) return true; // allow /api/auth/*
  if (path === '/health') return true; // allow health
  return false;
}

export async function authGuard(req: Request, res: Response, next: NextFunction) {
  if (isPublicRoute(req)) return next();
  // eslint-disable-next-line no-console
  console.log('Auth headers:', Object.keys(req.headers));

  const authHeader = req.headers['authorization'] || '';
  const tokenParam = (req.query['token'] as string | undefined) || undefined;

  // Bearer token
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring('Bearer '.length);
    const shared = process.env.NEXTLOT_SERVER_TOKEN || 'nextlot';
    if (token === shared || authHeader.trim() === `Bearer ${shared}`) {
      const sub = `shared:nextlot`;
      const scopeType = (req.headers['x-scope-type'] as 'agency' | 'location') || (req.headers['x-ghl-scope-type'] as 'agency' | 'location') || undefined;
      const scopeId = (req.headers['x-scope-id'] as string) || (req.headers['x-ghl-scope-id'] as string) || undefined;
      (req as any).user = { sub, username: sub, scopeType, scopeId } as TokenPayload;
      return next();
    }
    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ error: 'Invalid token' });
    (req as any).user = payload as TokenPayload;
    return next();
  }

  // Token via query param
  if (tokenParam) {
    const payload = verifyToken(tokenParam);
    if (!payload) return res.status(401).json({ error: 'Invalid token' });
    (req as any).user = payload as TokenPayload;
    return next();
  }

  // API key via header or query
  const apiKey = (req.headers['x-api-key'] as string | undefined) || (req.query['apikey'] as string | undefined) || undefined;
  if (apiKey) {
    const scopeType = (req.headers['x-scope-type'] as 'agency' | 'location') || (req.headers['x-ghl-scope-type'] as 'agency' | 'location') || 'location';
    const scopeId = (req.headers['x-scope-id'] as string) || (req.headers['x-ghl-scope-id'] as string) || undefined;
    const ok = await verifyApiKey(scopeType, scopeId, apiKey);
    if (!ok) return res.status(401).json({ error: 'Invalid API key' });
    const sub = `apikey:${scopeType}:${scopeId ?? 'global'}`;
    (req as any).user = { sub, username: sub, scopeId, scopeType } as TokenPayload;
    return next();
  }

  // Shared secret header: nextlot-server-token: Bearer <token>
  const sharedHeader = (req.headers['nextlot-server-token'] as string | undefined) || undefined;
  // Debug: inspect headers for shared token
  // eslint-disable-next-line no-console
  if (sharedHeader) console.log('nextlot-server-token header detected');
  if (sharedHeader) {
    const shared = process.env.NEXTLOT_SERVER_TOKEN || 'nextlot';
    const provided = sharedHeader.startsWith('Bearer ') ? sharedHeader.substring('Bearer '.length) : sharedHeader;
    if (!(provided === shared || sharedHeader.trim() === `Bearer ${shared}`)) {
      return res.status(401).json({ error: 'Invalid shared token' });
    }
    const sub = `shared:nextlot`;
    const scopeType = (req.headers['x-scope-type'] as 'agency' | 'location') || (req.headers['x-ghl-scope-type'] as 'agency' | 'location') || undefined;
    const scopeId = (req.headers['x-scope-id'] as string) || (req.headers['x-ghl-scope-id'] as string) || undefined;
    (req as any).user = { sub, username: sub, scopeType, scopeId } as TokenPayload;
    return next();
  }

  // Marketplace signature (automatic auth post-install)
  const sigHeader = (req.headers['x-marketplace-signature'] as string | undefined) || (req.headers['x-ghl-signature'] as string | undefined) || undefined;
  const secret = process.env.MARKETPLACE_SIGNING_SECRET;
  if (sigHeader && secret) {
    const raw = (req as any).rawBody as string | undefined;
    const hmac = crypto.createHmac('sha256', secret).update(raw ?? '').digest('hex');
    if (sigHeader.length !== hmac.length) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    const valid = crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(sigHeader));
    if (!valid) return res.status(401).json({ error: 'Invalid signature' });
    const scopeType = (req.headers['x-scope-type'] as 'agency' | 'location') || (req.headers['x-ghl-scope-type'] as 'agency' | 'location') || 'location';
    const scopeId = (req.headers['x-scope-id'] as string) || (req.headers['x-ghl-scope-id'] as string) || undefined;
    if (!scopeType || !scopeId) return res.status(400).json({ error: 'Missing scope headers' });
    const sub = `marketplace:${scopeType}:${scopeId}`;
    (req as any).user = { sub, username: sub, scopeId, scopeType } as TokenPayload;
    return next();
  }

  // Basic auth fallback
  if (authHeader.startsWith('Basic ')) {
    const base64 = authHeader.substring('Basic '.length);
    const decoded = Buffer.from(base64, 'base64').toString('utf8');
    const [username, password] = decoded.split(':');
    const scopeType = (req.headers['x-scope-type'] as 'agency' | 'location') || (req.headers['x-ghl-scope-type'] as 'agency' | 'location') || 'location';
    const scopeId = (req.headers['x-scope-id'] as string) || (req.headers['x-ghl-scope-id'] as string) || undefined;
    const ok = await verifyCredentials(scopeType, scopeId, username, password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    (req as any).user = { sub: username, username, scopeId, scopeType } as TokenPayload;
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized' });
}