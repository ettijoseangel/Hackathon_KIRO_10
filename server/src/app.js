import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import reportesRouter from './routes/reportes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

app.use('/api/reportes', reportesRouter);

// --- Servir frontend en produccion ---
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// --- Middleware de error global (Req 7) ---
// DEBE estar despues de todas las rutas
app.use((err, req, res, next) => {
  console.error('Error interno:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;
