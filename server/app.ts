import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.ts';
import { proxyInterceptor } from './middlewares/proxyInterceptor.ts';

dotenv.config();

export function createApp() {
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  const app = express();

  app.use(cors({ origin: corsOrigin, credentials: true }));
  app.use(express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf?.toString('utf8');
    },
  }));
  app.use(express.urlencoded({ extended: true }));

  app.use(proxyInterceptor());

  app.use('/api', apiRouter);

  app.get('/', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'nextlot-api', timestamp: new Date().toISOString() });
  });

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found' });
  });

  return app;
}