import { Router } from 'express';
import fetchAndStoreWarehouses from '../utils/fetchWarehouses';
import Warehouse from '../model/warehouse';

const router = Router();

let isFetched = false; 

router.get('/', async (req, res) => {
  try {
    let warehouses = await Warehouse.find();

    if (warehouses.length === 0 && !isFetched) {
      console.log('⚠️ No warehouses in DB. Fetching from API...');
      await fetchAndStoreWarehouses();
      isFetched = true; 
      warehouses = await Warehouse.find(); 
    }

    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching warehouses', error });
  }
});

export default router;
