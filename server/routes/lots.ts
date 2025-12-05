import { Router } from 'express';
import * as LotController from '../controllers/lots/index.ts';

const router = Router({ mergeParams: true });

// GET /sites/:site_id/auctions/:auction_id/closed_lots - List closed lots
router.get('/closed_lots', LotController.listClosed);

// GET /sites/:site_id/auctions/:auction_id/lots - List all lots
router.get('/', LotController.list);

// POST /sites/:site_id/auctions/:auction_id/lots - Create a new lot
router.post('/', LotController.create);

// GET /sites/:site_id/auctions/:auction_id/lots/:lot_id - Get specific lot
router.get('/:lot_id', LotController.get);

// PUT /sites/:site_id/auctions/:auction_id/lots/:lot_id - Update specific lot
router.put('/:lot_id', LotController.update);

// DELETE /sites/:site_id/auctions/:auction_id/lots/:lot_id - Delete specific lot
router.delete('/:lot_id', LotController.remove);

export default router;