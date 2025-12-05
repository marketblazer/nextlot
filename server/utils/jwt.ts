import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export type TokenPayload = {
  sub: string; // user identifier
  scopeId?: string; // agency or location identifier
  scopeType?: 'agency' | 'location';
  username?: string;
};

export function signToken(payload: TokenPayload, expiresIn: string = '12h'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}