import { Router } from 'express';
import * as AuctionController from '../controllers/auctions/index.ts';
import * as LotController from '../controllers/lots/index.ts';
import lotsRouter from './lots.ts';

const router = Router({ mergeParams: true });

// GET /sites/:site_id/auctions - List all auctions for a site
router.get('/', AuctionController.list);

// POST /sites/:site_id/auctions - Create a new auction for a site
router.post('/', AuctionController.create);

// GET /sites/:site_id/auctions/:auction_id - Get specific auction
router.get('/:auction_id', AuctionController.get);

// PUT /sites/:site_id/auctions/:auction_id - Update specific auction
router.put('/:auction_id', AuctionController.update);

// /sites/:site_id/auctions/:auction_id/closed_lots - List closed lots (must come before /:auction_id/lots)
router.get('/:auction_id/closed_lots', LotController.listClosed);

// /sites/:site_id/auctions/:auction_id/lots/*
router.use('/:auction_id/lots', lotsRouter);

export default router;