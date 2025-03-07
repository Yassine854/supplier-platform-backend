import { Router } from 'express';
import fetchAndStoreWarehouses from '../utils/fetchWarehouses';
import Warehouse from '../model/warehouse';

const router = Router();

let isFetched = false; // Flag to track fetch status

router.get('/', async (req, res) => {
  try {
    let warehouses = await Warehouse.find();

    if (warehouses.length === 0 && !isFetched) {
      console.log('⚠️ No warehouses in DB. Fetching from API...');
      await fetchAndStoreWarehouses();
      isFetched = true; // Mark as fetched
      warehouses = await Warehouse.find(); // Re-fetch stored data
    }

    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching warehouses', error });
  }
});

export default router;
