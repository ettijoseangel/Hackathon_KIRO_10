import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import reportesRouter from './routes/reportes.js';
import guiaIARouter from './routes/guiaIa.js';
import { securityHeaders, generalLimiter, sanitizeBody, errorHandler } from './middleware/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Middleware de seguridad ---
app.use(securityHeaders());
app.use(generalLimiter());

// --- Middleware de parseo y CORS ---
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
}));
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeBody());

// --- Rutas ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/reportes', reportesRouter);
app.use('/api/v1', guiaIARouter);

// --- Servir frontend en produccion ---
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}


// --- Middleware de error global ---
app.use(errorHandler);

export default app;
