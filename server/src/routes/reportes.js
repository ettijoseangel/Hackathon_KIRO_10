/**
 * Rutas: /api/reportes
 * Define los endpoints CRUD para reportes ciudadanos.
 * Ref: design.md - tabla de endpoints.
 */
import { Router } from 'express';
import * as reporteController from '../controllers/reporte.controller.js';
import { crearReporteLimiter } from '../middleware/index.js';

const router = Router();

// POST /api/reportes — Crear reporte (con clasificacion IA)
router.post('/', crearReporteLimiter(), reporteController.crearReporte);

// GET /api/reportes — Listar reportes (con filtros opcionales)
router.get('/', reporteController.listarReportes);

// GET /api/reportes/:codigo — Buscar por codigo de seguimiento
router.get('/:codigo', reporteController.buscarPorCodigo);

// PATCH /api/reportes/:id/estado — Actualizar estado de un reporte
router.patch('/:id/estado', reporteController.actualizarEstado);

export default router;
