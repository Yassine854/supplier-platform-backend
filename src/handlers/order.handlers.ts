import { Request, Response } from 'express';
import OrderModel from '../model/order.model';
import { NotFoundError } from '../errors/not-found.error';
import fetchAndStoreOrders from '../utils/fetchOrders';

// Cache setup for 2 days (172800000 milliseconds)
const orderCache = new Map();
const CACHE_TTL = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds

// Optional: Periodic cache cleanup to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of orderCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      orderCache.delete(key);
    }
  }
}, 60 * 60 * 1000); // Cleanup every hour

export const getAllOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check cache first
    const cacheKey = 'all_orders';
    const cached = orderCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.json(cached.data);
      return;
    }

    const count = await OrderModel.countDocuments();
    if (count === 0) {
      await fetchAndStoreOrders();
    }
    
    // ULTRA FAST FETCH
    const orders = await OrderModel.find({})
      .lean()
      .maxTimeMS(15000)
      .batchSize(1000);

    // Cache the result for 2 days
    orderCache.set(cacheKey, {
      data: orders,
      timestamp: Date.now()
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check cache first
    const cacheKey = `order_${id}`;
    const cached = orderCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.json(cached.data);
      return;
    }

    // Try both MongoDB _id and entity_id
    let order = await OrderModel.findOne({
      $or: [
        { _id: id },
        { entity_id: isNaN(Number(id)) ? -1 : Number(id) }
      ]
    })
    .lean()
    .maxTimeMS(5000);

    if (!order) {
      await fetchAndStoreOrders();
      order = await OrderModel.findOne({
        $or: [
          { _id: id },
          { entity_id: isNaN(Number(id)) ? -1 : Number(id) }
        ]
      })
      .lean()
      .maxTimeMS(5000);
      
      if (!order) {
        throw new NotFoundError('Order not found');
      }
    }

    // Cache the result for 2 days
    orderCache.set(cacheKey, {
      data: order,
      timestamp: Date.now()
    });

    res.json(order);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
    } else {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  }
};

// NEW: Manual cache invalidation endpoint
export const invalidateCache = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.query;
    
    if (key) {
      // Invalidate specific cache key
      orderCache.delete(key as string);
      res.json({ message: `Cache invalidated for key: ${key}` });
    } else {
      // Invalidate all cache
      orderCache.clear();
      res.json({ message: 'All cache invalidated' });
    }
  } catch (error) {
    console.error('Error invalidating cache:', error);
    res.status(500).json({ error: 'Failed to invalidate cache' });
  }
};

// NEW: Get cache stats
export const getCacheStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = Date.now();
    const stats = {
      totalEntries: orderCache.size,
      expiredEntries: Array.from(orderCache.entries()).filter(
        ([, value]) => now - value.timestamp > CACHE_TTL
      ).length,
      memoryUsage: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100 // MB
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
};