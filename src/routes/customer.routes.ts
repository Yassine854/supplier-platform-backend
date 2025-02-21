import { Router } from 'express';
import fetchAndStoreCustomers from '../utils/fetchCustomers';
import Customer from '../model/customer';

const router = Router();

let isFetched = false; // Flag to track fetch status

router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();

    if (customers.length === 0 && !isFetched) {
      console.log('⚠️ No customers in DB. Fetching from API...');
      await fetchAndStoreCustomers();
      isFetched = true; // Mark as fetched
    }

    const storedCustomers = await Customer.find(); // Get stored data
    res.json(storedCustomers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers', error });
  }
});

export default router;
