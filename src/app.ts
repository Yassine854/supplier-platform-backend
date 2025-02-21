import express from 'express';
import adRoutes from './routes/ad.routes';

//Supplier Dashboard
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import warehouseRoutes from './routes/warehouse.routes';
import customerRoutes from './routes/customer.routes';
import supplierRoutes from './routes/supplier.routes';


const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());
app.get('/test', (_, res) => {
  res.json({ test: true });
});
app.use('/api/ad', adRoutes);


//Supplier Dashboard
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);


export { app };
