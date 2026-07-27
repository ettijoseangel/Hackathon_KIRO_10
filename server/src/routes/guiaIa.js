/**
 * Rutas: /api/v1/reportes/:reporteId/guia-ia
 * Endpoint de solo lectura para consultar la orientacion IA.
 * No invoca a la IA — retorna datos ya persistidos.
 * Ref: implementacionIA.md seccion 7, design.md
 */
import { Router } from 'express'
import * as guiaIAController from '../controllers/guiaIA.controller.js'

const router = Router()

/**
 * @swagger
 * /api/v1/reportes/{reporteId}/guia-ia:
 *   get:
 *     summary: Consultar orientacion IA de un reporte
 *     description: Retorna la orientacion institucional generada por IA para un reporte. No invoca a la IA — solo lectura de datos ya persistidos.
 *     tags: [Guia IA]
 *     parameters:
 *       - in: path
 *         name: reporteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del reporte
 *     responses:
 *       200:
 *         description: Orientacion completa disponible
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reporte_id:
 *                   type: string
 *                   format: uuid
 *                 resumen_queja:
 *                   type: string
 *                   nullable: true
 *                 categoria:
 *                   type: string
 *                   nullable: true
 *                 institucion:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                       nullable: true
 *                     descripcion:
 *                       type: string
 *                       nullable: true
 *                     sitio_web:
 *                       type: string
 *                       nullable: true
 *                     confianza:
 *                       type: number
 *                       nullable: true
 *                 medios_contacto:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tipo:
 *                         type: string
 *                         enum: [web, email, telefono, direccion_fisica, red_social, app_movil]
 *                       valor:
 *                         type: string
 *                       horario_atencion:
 *                         type: string
 *                         nullable: true
 *                 pasos_siguientes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       orden:
 *                         type: integer
 *                       titulo:
 *                         type: string
 *                       descripcion:
 *                         type: string
 *                 requiere_mas_informacion:
 *                   type: boolean
 *                 pregunta_aclaratoria:
 *                   type: string
 *                   nullable: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       206:
 *         description: Orientacion parcial (requiere mas informacion)
 *       400:
 *         description: UUID invalido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Orientacion no encontrada para el reporte
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/reportes/:reporteId/guia-ia', guiaIAController.obtenerGuiaIA)

export default router
