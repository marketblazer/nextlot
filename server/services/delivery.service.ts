import crypto from 'crypto';

type Result = { ok: boolean; status?: number; error?: string };

function sign(body: string, secret: string): string {
  const h = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return `sha256=${h}`;
}

export const DeliveryService = {
  async deliver(url: string, payload: unknown, headers?: Record<string, string>): Promise<Result> {
    const body = JSON.stringify(payload ?? {});
    const secret = process.env.WEBHOOK_SIGNING_SECRET || '';
    const signature = secret ? sign(body, secret) : '';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(signature ? { 'x-webhook-signature': signature } : {}),
        ...(headers || {}),
      },
      body,
    });
    const ok = res.ok;
    return { ok, status: res.status, error: ok ? undefined : `${res.status}` };
  },
};