import { Router } from 'express';
import fetchAndStoreProducts from '../utils/fetchProducts';
import Product from '../model/product';

const router = Router();
let isFetched = false; // Flag to avoid unnecessary fetching

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();

    if (products.length === 0 && !isFetched) {
      console.log('⚠️ No products in DB. Fetching from API...');
      await fetchAndStoreProducts();
      isFetched = true;
    }

    const storedProducts = await Product.find(); // Get stored data
    res.json(storedProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
});

export default router;
