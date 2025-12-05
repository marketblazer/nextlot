import { Router } from 'express';
import * as SiteController from '../controllers/sites/index.ts';
import auctionsRouter from './auctions.ts';

const router = Router();

// /api/sites/:site_id/info
router.get('/:site_id/info', SiteController.info);

// /api/sites/:site_id/auctions/*
router.use('/:site_id/auctions', auctionsRouter);

export default router;