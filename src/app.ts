import express from 'express';
import adRoutes from './routes/ad.routes';
const app = express();
app.use(express.json());
app.get('/test', (_, res) => {
  res.json({ test: true });
});
app.use('/api/ad', adRoutes);
export { app };
