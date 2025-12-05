import crypto from 'crypto';

type Subscription = {
  id: string;
  targetUrl: string;
  eventTypes: string[];
  siteId?: string;
  auctionId?: string;
  filters?: Record<string, unknown>;
  createdAt: string;
  disabled?: boolean;
  failures?: number;
  cursors?: Record<string, string>;
};

function uid(): string {
  return crypto.randomUUID();
}

const subs = new Map<string, Subscription>();

export const WebhookService = {
  create(input: Omit<Subscription, 'id' | 'createdAt'>): Subscription {
    const id = uid();
    const sub: Subscription = { id, createdAt: new Date().toISOString(), failures: 0, disabled: false, cursors: {}, ...input };
    subs.set(id, sub);
    return sub;
  },
  list(): Subscription[] {
    return Array.from(subs.values());
  },
  get(id: string): Subscription | undefined {
    return subs.get(id);
  },
  remove(id: string): boolean {
    return subs.delete(id);
  },
  updateCursor(id: string, eventType: string, cursor: string): void {
    const s = subs.get(id);
    if (!s) return;
    const c = s.cursors || {};
    c[eventType] = cursor;
    s.cursors = c;
  },
  all(): Map<string, Subscription> {
    return subs;
  },
};