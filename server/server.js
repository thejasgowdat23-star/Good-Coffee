import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import orderRoutes from './routes/orderRoutes.js';
import './lib/supabase.js';

const app = express();
const port = Number(process.env.PORT || 5000);
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '100kb' }));
app.get('/api/health', (_req, res) => res.json({ success: true, message: 'Good Day Coffee API is running' }));
app.use('/api/orders', orderRoutes);

app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && error.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON request.' });
  }
  return res.status(500).json({ success: false, message: 'Unexpected server error.' });
});

app.listen(port, () => {
  console.log(`Supabase-backed Good Day Coffee API listening on http://localhost:${port}`);
});
