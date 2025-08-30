import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middlewares';
import { getAllOrders, getOrder } from '../handlers/order.handlers';

const router = Router();

router.get('/', getAllOrders);
router.get('/:id', authMiddleware, getOrder);

export default router;
