import { Router } from 'express';
import * as SubController from '../controllers/webhooks/subscriptions.ts';
import * as TestController from '../controllers/webhooks/test.ts';

const router = Router();

router.post('/subscriptions', SubController.create);
router.get('/subscriptions', SubController.list);
router.delete('/subscriptions/:id', SubController.remove);
router.post('/test', TestController.send);

export default router;