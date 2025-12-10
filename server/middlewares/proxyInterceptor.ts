import { RequestHandler } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Centralized proxy interceptor: proxies `/proxy/*` to `PROXY_TARGET`
export function proxyInterceptor(): RequestHandler {
  const target = process.env.PROXY_TARGET;

  if (!target) {
    // No proxy configured; pass-through
    return (req, _res, next) => next();
  }

  const pathFilter = (path: string) => path.startsWith('/proxy/');

  try {
    return createProxyMiddleware(pathFilter, {
      target,
      changeOrigin: true,
      pathRewrite: { '^/proxy': '' },
      logLevel: 'warn',
      onProxyReq: (proxyReq, req, _res) => {
        proxyReq.setHeader('x-forwarded-by', 'nextlot-server');
        const token = req.headers['authorization'];
        if (token) proxyReq.setHeader('authorization', token as string);
      },
    });
  } catch {
    return (req, _res, next) => next();
  }
}