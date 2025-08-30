import { Request, Response } from 'express';
import fetchAndStoreProducts from '../utils/fetchProducts';
import productModel from '../model/product.model';

// Cache setup for 2 days (172800000 milliseconds)
const productCache = new Map();
const CACHE_TTL = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds

// Periodic cache cleanup to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of productCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      productCache.delete(key);
    }
  }
}, 60 * 60 * 1000); // Cleanup every hour

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check cache first
    const cacheKey = 'all_products';
    const cached = productCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.json(cached.data);
      return;
    }

    const products = await productModel.find().lean().maxTimeMS(15000);

    if (products.length === 0) {
      console.log('⚠️ No products in DB. Fetching from API...');
      await fetchAndStoreProducts();
    }

    const storedProducts = await productModel.find()
      .lean()
      .maxTimeMS(15000)
      .batchSize(1000);

    // Cache the result for 2 days
    productCache.set(cacheKey, {
      data: storedProducts,
      timestamp: Date.now()
    });

    res.json(storedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

// For Suppliers
export const getSupplierProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check cache first
    const cacheKey = 'supplier_products';
    const cached = productCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.json(cached.data);
      return;
    }

    const count = await productModel.countDocuments();
    
    if (count === 0) {
      console.log('⚠️ No products in DB. Fetching from API...');
      await fetchAndStoreProducts();
    }

    const storedProducts = await productModel.find()
      .lean()
      .maxTimeMS(15000)
      .batchSize(1000);

    // Cache the result for 2 days
    productCache.set(cacheKey, {
      data: storedProducts,
      timestamp: Date.now()
    });

    res.json(storedProducts);
  } catch (error) {
    console.error('Error fetching supplier products:', error);
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: "Search query is required" });
      return;
    }

    // Check cache first
    const cacheKey = `search_${query.toLowerCase()}`;
    const cached = productCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.json(cached.data);
      return;
    }

    const products = await productModel.find({
      name: { $regex: query, $options: 'i' },
    })
    .limit(10)
    .lean()
    .maxTimeMS(5000);

    // Cache the result for 2 days
    productCache.set(cacheKey, {
      data: products,
      timestamp: Date.now()
    });

    res.json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// NEW: Get product by ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check cache first
    const cacheKey = `product_${id}`;
    const cached = productCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.json(cached.data);
      return;
    }

    const product = await productModel.findById(id)
      .lean()
      .maxTimeMS(5000);

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Cache the result for 2 days
    productCache.set(cacheKey, {
      data: product,
      timestamp: Date.now()
    });

    res.json(product);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// NEW: Fast paginated endpoint for products
export const getProductsPaginated = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const cacheKey = `products_page_${page}_limit_${limit}`;
    const cached = productCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.json(cached.data);
      return;
    }

    const [products, total] = await Promise.all([
      productModel.find({})
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .maxTimeMS(10000),
      productModel.countDocuments()
    ]);

    const result = {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };

    productCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching paginated products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// NEW: Manual cache invalidation endpoint
export const invalidateProductCache = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.query;
    
    if (key) {
      // Invalidate specific cache key
      productCache.delete(key as string);
      res.json({ message: `Product cache invalidated for key: ${key}` });
    } else {
      // Invalidate all product cache
      productCache.clear();
      res.json({ message: 'All product cache invalidated' });
    }
  } catch (error) {
    console.error('Error invalidating product cache:', error);
    res.status(500).json({ error: 'Failed to invalidate cache' });
  }
};

// NEW: Get cache stats
export const getProductCacheStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = Date.now();
    const stats = {
      totalEntries: productCache.size,
      expiredEntries: Array.from(productCache.entries()).filter(
        ([, value]) => now - value.timestamp > CACHE_TTL
      ).length,
      memoryUsage: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100 // MB
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting product cache stats:', error);
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
};