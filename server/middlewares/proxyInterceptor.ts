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

  return createProxyMiddleware(pathFilter, {
    target,
    changeOrigin: true,
    pathRewrite: { '^/proxy': '' },
    logLevel: 'warn',
    onProxyReq: (proxyReq, req, _res) => {
      // Example interceptor: add correlation header
      proxyReq.setHeader('x-forwarded-by', 'nextlot-server');
      // Attach auth token if present
      const token = req.headers['authorization'];
      if (token) proxyReq.setHeader('authorization', token as string);
    },
    onProxyRes: (_proxyRes, _req, _res) => {
      // You can inspect/transform responses here if needed
    },
  });
}