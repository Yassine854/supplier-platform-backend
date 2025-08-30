import { Request, Response } from 'express';
import ProductStockModel from '../model/product_stock.model';
import { NotFoundError } from '../errors/not-found.error';
import fetchProductStock from '../utils/fetchProductStock';

// Cache setup for 2 days (172800000 milliseconds)
const productStockCache = new Map();
const CACHE_TTL = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds

// Periodic cache cleanup to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of productStockCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      productStockCache.delete(key);
    }
  }
}, 60 * 60 * 1000); // Cleanup every hour

export const getAllProductStocks = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check cache first
    const cacheKey = 'all_product_stocks';
    const cached = productStockCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.json(cached.data);
      return;
    }

    const count = await ProductStockModel.countDocuments();
    if (count === 0) {
      await fetchProductStock();
    }
    
    // Fast fetch with optimizations
    const productStocks = await ProductStockModel.find({})
      .lean() // Convert to plain JS objects
      .maxTimeMS(15000) // 15 second timeout
      .batchSize(1000); // Optimize for large datasets

    // Cache the result for 2 days
    productStockCache.set(cacheKey, {
      data: productStocks,
      timestamp: Date.now()
    });

    res.json(productStocks);
  } catch (error) {
    console.error('Error fetching product stocks:', error);
    res.status(500).json({ error: 'Failed to fetch product stocks' });
  }
};

export const getProductStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check cache first
    const cacheKey = `product_stock_${id}`;
    const cached = productStockCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.json(cached.data);
      return;
    }

    let productStock = await ProductStockModel.findById(id)
      .lean()
      .maxTimeMS(5000);

    if (!productStock) {
      await fetchProductStock();
      productStock = await ProductStockModel.findById(id)
        .lean()
        .maxTimeMS(5000);
      
      if (!productStock) {
        throw new NotFoundError('Product Stock not found');
      }
    }

    // Cache the result for 2 days
    productStockCache.set(cacheKey, {
      data: productStock,
      timestamp: Date.now()
    });

    res.json(productStock);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
    } else {
      console.error('Error fetching product stock:', error);
      res.status(500).json({ error: 'Failed to fetch product stock' });
    }
  }
};

// NEW: Fast paginated endpoint for large datasets
export const getProductStocksPaginated = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = (page - 1) * limit;

    const cacheKey = `product_stocks_page_${page}_limit_${limit}`;
    const cached = productStockCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.json(cached.data);
      return;
    }

    const [productStocks, total] = await Promise.all([
      ProductStockModel.find({})
        .sort({ updated_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .maxTimeMS(10000),
      ProductStockModel.countDocuments()
    ]);

    const result = {
      productStocks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };

    productStockCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching paginated product stocks:', error);
    res.status(500).json({ error: 'Failed to fetch product stocks' });
  }
};

// NEW: Get product stock by product ID or SKU
export const getProductStockByProductId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    
    // Check cache first
    const cacheKey = `product_stock_product_${productId}`;
    const cached = productStockCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.json(cached.data);
      return;
    }

    const productStock = await ProductStockModel.findOne({
      $or: [
        { product_id: productId },
        { sku: productId }
      ]
    })
    .lean()
    .maxTimeMS(5000);

    if (!productStock) {
      throw new NotFoundError('Product Stock not found for this product');
    }

    // Cache the result for 2 days
    productStockCache.set(cacheKey, {
      data: productStock,
      timestamp: Date.now()
    });

    res.json(productStock);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
    } else {
      console.error('Error fetching product stock by product ID:', error);
      res.status(500).json({ error: 'Failed to fetch product stock' });
    }
  }
};

// NEW: Manual cache invalidation endpoint
export const invalidateProductStockCache = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.query;
    
    if (key) {
      // Invalidate specific cache key
      productStockCache.delete(key as string);
      res.json({ message: `Product stock cache invalidated for key: ${key}` });
    } else {
      // Invalidate all product stock cache
      productStockCache.clear();
      res.json({ message: 'All product stock cache invalidated' });
    }
  } catch (error) {
    console.error('Error invalidating product stock cache:', error);
    res.status(500).json({ error: 'Failed to invalidate cache' });
  }
};

// NEW: Get cache stats
export const getProductStockCacheStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = Date.now();
    const stats = {
      totalEntries: productStockCache.size,
      expiredEntries: Array.from(productStockCache.entries()).filter(
        ([, value]) => now - value.timestamp > CACHE_TTL
      ).length,
      memoryUsage: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100 // MB
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting product stock cache stats:', error);
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
};