import express from 'express';
import adRoutes from './routes/ad.routes';
import ScreenRoutes from './routes/Screen.routes';
//Supplier Dashboard
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import supplier_products from './routes/supplier_product.routes';

import productStockRoutes from './routes/product_stock.routes';

import orderRoutes from './routes/order.routes';
import warehouseRoutes from './routes/warehouse.routes';
import customerRoutes from './routes/customer.routes';
import supplierRoutes from './routes/supplier.routes';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import { authMiddleware } from './middlewares/auth.middlewares';

const app = express();

app.use(express.json({ type: ['application/json', 'application/*+json', 'text/plain'] }));
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));


// Auth
app.use('/api/auth', authRoutes);

app.get('/test', (_, res) => {
  res.json({ test: true });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      database: {
        status: 'unknown',
        readyState: 'unknown'
      }
    };

    // Check database connection if mongoose is available
    try {
      const mongoose = require('mongoose');
      health.database.readyState = mongoose.connection.readyState;
      health.database.status = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    } catch (error) {
      health.database.status = 'error';
    }

    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Welcome endpoint
app.get('/welcome', (req, res) => {
  res.json({
    message: 'Welcome to OMS Express Server API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth/login',
      test: '/test',
      testPost: '/test-post'
    },
    documentation: 'API is running successfully on Netlify Functions'
  });
});
app.use('/api/ad', adRoutes);
app.use('/api/screen', ScreenRoutes);
app.use('/api/products', productRoutes);

const protectedRoutes = [
  { path: '/api/warehouses', route: warehouseRoutes },
  { path: '/api/categories', route: categoryRoutes },
  { path: '/api/supplier_products', route: supplier_products },
  { path: '/api/products_stock', route: productStockRoutes },
  { path: '/api/orders', route: orderRoutes },
  { path: '/api/customers', route: customerRoutes },
  { path: '/api/suppliers', route: supplierRoutes },
];

app.use((req, res, next) => {
  const authHeader = req.headers.authorization;

  if (
    authHeader &&
    !/^Bearer [A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(
      authHeader
    )
  ) {
    return res
      .status(400)
      .json({ error: 'Invalid authorization header format' });
  }

  next();
});

protectedRoutes.forEach(({ path, route }) => {
  app.use(path, authMiddleware, route);
});

export { app };
