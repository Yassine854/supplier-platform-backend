import { Router } from 'express';
import { getProduct,searchProducts } from '../handlers/product.handlers';

const router = Router();
// Flag to avoid unnecessary fetching

router.get('/', getProduct);
router.get('/search', searchProducts);
export default router;
