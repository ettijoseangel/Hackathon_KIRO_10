import express from 'express';
import cors from 'cors';

const app = express();

// --- Middleware ---
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
}));
app.use(express.json());

// --- Rutas ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
