import crypto from 'crypto';

type StoredCred = {
  username?: string;
  passwordHash?: string;
  apiKeyHash?: string;
  scopeType: 'agency' | 'location';
  scopeId?: string;
};

const store = new Map<string, StoredCred>();

function hash(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export async function saveCredentials(
  scopeType: 'agency' | 'location',
  scopeId: string | undefined,
  username: string,
  password: string,
): Promise<void> {
  const key = `${scopeType}:${scopeId ?? 'global'}`;
  const existing = store.get(key);
  store.set(key, {
    ...(existing || {}),
    username,
    passwordHash: hash(password),
    scopeType,
    scopeId,
  });
}

export async function verifyCredentials(
  scopeType: 'agency' | 'location',
  scopeId: string | undefined,
  username: string,
  password: string,
): Promise<boolean> {
  const key = `${scopeType}:${scopeId ?? 'global'}`;
  const rec = store.get(key);
  if (!rec) return false;
  if (!rec.username || rec.username !== username) return false;
  if (!rec.passwordHash) return false;
  return rec.passwordHash === hash(password);
}

export async function saveApiKey(
  scopeType: 'agency' | 'location',
  scopeId: string | undefined,
  apiKey: string,
): Promise<void> {
  const key = `${scopeType}:${scopeId ?? 'global'}`;
  const existing = store.get(key);
  store.set(key, {
    ...(existing || {}),
    apiKeyHash: hash(apiKey),
    scopeType,
    scopeId,
  });
}

export async function verifyApiKey(
  scopeType: 'agency' | 'location',
  scopeId: string | undefined,
  apiKey: string,
): Promise<boolean> {
  const key = `${scopeType}:${scopeId ?? 'global'}`;
  const rec = store.get(key);
  if (!rec) return false;
  if (!rec.apiKeyHash) return false;
  return rec.apiKeyHash === hash(apiKey);
}