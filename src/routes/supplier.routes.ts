import { Router } from 'express';
import fetchAndStoreSuppliers from '../utils/fetchSuppliers';
import Supplier from '../model/supplier';

const router = Router();

let isFetched = false; // Flag to track fetch status

router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find();

    if (suppliers.length === 0 && !isFetched) {
      console.log('⚠️ No suppliers in DB. Fetching from file...');
      await fetchAndStoreSuppliers(); // Fetch and store suppliers from the JSON file
      isFetched = true; // Mark as fetched
    }

    const storedSuppliers = await Supplier.find(); // Get stored data
    res.json(storedSuppliers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suppliers', error });
  }
});

export default router;
