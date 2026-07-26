/**
 * Rutas: /api/v1/reportes/:reporteId/guia-ia
 * Endpoint de solo lectura para consultar la orientacion IA.
 * No invoca a la IA — retorna datos ya persistidos.
 * Ref: implementacionIA.md seccion 7, design.md
 */
import { Router } from 'express';
import * as guiaIAController from '../controllers/guiaIA.controller.js';

const router = Router();

// GET /api/v1/reportes/:reporteId/guia-ia — Consultar orientacion IA
router.get('/reportes/:reporteId/guia-ia', guiaIAController.obtenerGuiaIA);

export default router;
