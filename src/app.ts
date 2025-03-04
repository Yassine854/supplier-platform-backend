import express from 'express';
import adRoutes from './routes/ad.routes';
import screenRoutes from './routes/Screen.routes';
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import productStockRoutes from './routes/product_stock.routes';

import orderRoutes from './routes/order.routes';
import warehouseRoutes from './routes/warehouse.routes';
import customerRoutes from './routes/customer.routes';
import supplierRoutes from './routes/supplier.routes';
import cors from 'cors';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.get('/test', (_, res) => {
  res.json({ test: true });
});
app.use('/api/ad', adRoutes);
app.use('/api/screen', screenRoutes);

//Supplier Dashboard
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/products_stock', productStockRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);

export { app };
