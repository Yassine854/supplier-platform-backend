import { Request, Response } from 'express';
import CustomerModel from '../model/customer.model';
import { NotFoundError } from '../errors/not-found.error';
import fetchAndStoreCustomers from '../utils/fetchCustomers';

// Cache setup for 2 days (172800000 milliseconds)
const customerCache = new Map();
const CACHE_TTL = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds

// Periodic cache cleanup to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of customerCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      customerCache.delete(key);
    }
  }
}, 60 * 60 * 1000); // Cleanup every hour

export const getAllCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check cache first
    const cacheKey = 'all_customers';
    const cached = customerCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.json(cached.data);
      return;
    }

    const count = await CustomerModel.countDocuments();
    if (count === 0) {
      await fetchAndStoreCustomers();
    }
    
    // Fast fetch with optimizations
    const customers = await CustomerModel.find({})
      .lean() // Convert to plain JS objects
      .maxTimeMS(15000) // 15 second timeout
      .batchSize(1000); // Optimize for large datasets

    // Cache the result for 2 days
    customerCache.set(cacheKey, {
      data: customers,
      timestamp: Date.now()
    });

    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

export const getCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check cache first
    const cacheKey = `customer_${id}`;
    const cached = customerCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.json(cached.data);
      return;
    }

    let customer = await CustomerModel.findById(id)
      .lean()
      .maxTimeMS(5000);

    if (!customer) {
      await fetchAndStoreCustomers();
      customer = await CustomerModel.findById(id)
        .lean()
        .maxTimeMS(5000);
      
      if (!customer) {
        throw new NotFoundError('Customer not found');
      }
    }

    // Cache the result for 2 days
    customerCache.set(cacheKey, {
      data: customer,
      timestamp: Date.now()
    });

    res.json(customer);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
    } else {
      console.error('Error fetching customer:', error);
      res.status(500).json({ error: 'Failed to fetch customer' });
    }
  }
};

// NEW: Fast paginated endpoint for large datasets
export const getCustomersPaginated = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = (page - 1) * limit;

    const cacheKey = `customers_page_${page}_limit_${limit}`;
    const cached = customerCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.json(cached.data);
      return;
    }

    const [customers, total] = await Promise.all([
      CustomerModel.find({})
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .maxTimeMS(10000),
      CustomerModel.countDocuments()
    ]);

    const result = {
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };

    customerCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching paginated customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

// NEW: Manual cache invalidation endpoint
export const invalidateCustomerCache = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.query;
    
    if (key) {
      // Invalidate specific cache key
      customerCache.delete(key as string);
      res.json({ message: `Customer cache invalidated for key: ${key}` });
    } else {
      // Invalidate all customer cache
      customerCache.clear();
      res.json({ message: 'All customer cache invalidated' });
    }
  } catch (error) {
    console.error('Error invalidating customer cache:', error);
    res.status(500).json({ error: 'Failed to invalidate cache' });
  }
};

// NEW: Get cache stats
export const getCustomerCacheStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = Date.now();
    const stats = {
      totalEntries: customerCache.size,
      expiredEntries: Array.from(customerCache.entries()).filter(
        ([, value]) => now - value.timestamp > CACHE_TTL
      ).length,
      memoryUsage: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100 // MB
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting customer cache stats:', error);
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
};