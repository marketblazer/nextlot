import { Request, Response } from 'express';
import { saveCredentials, verifyCredentials, saveApiKey, verifyApiKey } from '../services/auth.service.ts';
import { signToken, TokenPayload } from '../utils/jwt.ts';

export async function install(req: Request, res: Response) {
  const { username, password, apiKey, scopeType, scopeId } = req.body as {
    username?: string;
    password?: string;
    apiKey?: string;
    scopeType: 'agency' | 'location';
    scopeId?: string;
  };
  if (!scopeType) {
    return res.status(400).json({ error: 'scopeType is required' });
  }
  if (!username && !password && !apiKey) {
    return res.status(400).json({ error: 'Provide username/password or apiKey' });
  }
  if (username && password) {
    await saveCredentials(scopeType, scopeId, username, password);
  }
  if (apiKey) {
    await saveApiKey(scopeType, scopeId, apiKey);
  }
  return res.status(201).json({ ok: true });
}

export async function login(req: Request, res: Response) {
  const { username, password, apiKey, scopeType, scopeId } = req.body as {
    username?: string;
    password?: string;
    apiKey?: string;
    scopeType: 'agency' | 'location';
    scopeId?: string;
  };
  if (!scopeType) {
    return res.status(400).json({ error: 'scopeType is required' });
  }
  let ok = false;
  let sub = '';
  if (apiKey) {
    ok = await verifyApiKey(scopeType, scopeId, apiKey);
    sub = `apikey:${scopeType}:${scopeId ?? 'global'}`;
  } else if (username && password) {
    ok = await verifyCredentials(scopeType, scopeId, username, password);
    sub = username;
  } else {
    return res.status(400).json({ error: 'Provide apiKey or username/password' });
  }
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const payload: TokenPayload = { sub, username: username ?? sub, scopeType, scopeId };
  const token = signToken(payload, '12h');
  return res.json({ token, user: payload });
}

export async function me(req: Request, res: Response) {
  const user = (req as any).user as TokenPayload | undefined;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  return res.json({ user });
}