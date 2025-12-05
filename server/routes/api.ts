import { Router } from 'express';
import * as ExampleController from '../controllers/example.controller.ts';
import * as AuthController from '../controllers/auth.controller.ts';
import sitesRouter from './sites.ts';
import webhooksRouter from './webhooks.ts';
import { authGuard } from '../middlewares/auth.ts';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Auth endpoints (public)
router.post('/auth/install', AuthController.install);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', AuthController.me);

// Protect all subsequent routes
router.use(authGuard);

// Example endpoints (replace with your real models/controllers)
router.get('/examples', ExampleController.list);
router.post('/examples', ExampleController.create);

// Sites subrouter (protected)
router.use('/sites', sitesRouter);

// Webhooks subrouter (protected)
router.use('/webhooks', webhooksRouter);

// GoHighLevel marketplace endpoints
// GHL marketplace endpoints removed per requirements

export default router;