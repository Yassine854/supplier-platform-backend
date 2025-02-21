import { Router } from 'express';
import fetchAndStoreOrders from '../utils/fetchOrders';
import Order from '../model/order';

const router = Router();

let isFetched = false; // Flag to track fetch status

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();

    if (orders.length === 0 && !isFetched) {
      console.log('⚠️ No orders in DB. Fetching from API...');
      await fetchAndStoreOrders();
      isFetched = true; // Mark as fetched
    }

    const storedOrders = await Order.find(); // Get stored data
    res.json(storedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
});

export default router;
