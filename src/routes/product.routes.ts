import { Router } from 'express';
import { getProduct, searchProducts } from '../handlers/product.handlers';
import { authenticateApiKey } from '../middlewares/apiKeyMiddleware';

const router = Router();

router.get('/', authenticateApiKey, getProduct);
router.get('/search', authenticateApiKey, searchProducts);
export default router;
