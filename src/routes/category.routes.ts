import { Router } from 'express';
import fetchAndStoreCategories from '../utils/fetchCategories';
import Category from '../model/category';

const router = Router();

let isFetched = false; // Flag to track fetch status

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();

    if (categories.length === 0 && !isFetched) {
      console.log('⚠️ No categories in DB. Fetching from API...');
      await fetchAndStoreCategories();
      isFetched = true; // Mark as fetched
    }

    const storedCategories = await Category.find(); // Get stored data
    res.json(storedCategories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
});

export default router;
