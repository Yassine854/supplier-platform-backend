import { Router } from 'express';
import { getProduct,searchProducts } from '../handlers/product.handlers';

const router = Router();

router.get('/', getProduct);
router.get('/search', searchProducts);
export default router;
