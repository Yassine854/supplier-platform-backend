import express from 'express';
import adRoutes from './routes/ad.routes';
import ScreenRoutes from './routes/Screen.routes';
//Supplier Dashboard
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import productStockRoutes from './routes/product_stock.routes';

import orderRoutes from './routes/order.routes';
import warehouseRoutes from './routes/warehouse.routes';
import customerRoutes from './routes/customer.routes';
import supplierRoutes from './routes/supplier.routes';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import { authMiddleware } from './middlewares/auth.middlewares';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware
app.use(cors());

// Auth
app.use('/api/auth', authRoutes);

app.get('/test', (_, res) => {
  res.json({ test: true });
});
app.use('/api/ad', adRoutes);
app.use('/api/screen', ScreenRoutes);
app.use('/api/products', productRoutes);

const protectedRoutes = [
  { path: '/api/warehouses', route: warehouseRoutes },
  { path: '/api/categories', route: categoryRoutes },
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
