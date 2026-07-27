/**
 * Rutas: /api/reportes
 * Define los endpoints CRUD para reportes ciudadanos.
 * Ref: design.md - tabla de endpoints.
 */
import { Router } from 'express'
import * as reporteController from '../controllers/reporte.controller.js'
import { crearReporteLimiter } from '../middleware/index.js'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Reporte:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "17066919-806f-4b58-8923-157bbbd1377b"
 *         codigoSeguimiento:
 *           type: string
 *           example: "REP-001"
 *         titulo:
 *           type: string
 *           example: "Fuga de agua en calle principal"
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: "Lleva goteando desde ayer"
 *         areaServicio:
 *           type: string
 *           enum: [AGUA, ALUMBRADO, BACHEO, RECOLECCION_BASURA, DRENAJE, OTRO]
 *           example: "AGUA"
 *         categoria:
 *           type: string
 *           enum: [INFRAESTRUCTURA, SEGURIDAD, LIMPIEZA, SERVICIOS_PUBLICOS, OTRO]
 *           example: "INFRAESTRUCTURA"
 *         prioridad:
 *           type: string
 *           enum: [BAJA, MEDIA, ALTA, URGENTE]
 *           example: "MEDIA"
 *         estado:
 *           type: string
 *           enum: [PENDIENTE, EN_PROCESO, RESUELTO, CANCELADO]
 *           example: "PENDIENTE"
 *         tipoUbicacion:
 *           type: string
 *           enum: [PUNTO, AREA]
 *           example: "PUNTO"
 *         latitud:
 *           type: string
 *           nullable: true
 *           example: "25.671800"
 *         longitud:
 *           type: string
 *           nullable: true
 *           example: "-100.309000"
 *         direccion:
 *           type: string
 *           nullable: true
 *         colonia:
 *           type: string
 *           nullable: true
 *           example: "Centro"
 *         municipio:
 *           type: string
 *           example: "Monterrey"
 *         fotoUrl:
 *           type: string
 *           nullable: true
 *         contactoEmail:
 *           type: string
 *           nullable: true
 *         contactoTelefono:
 *           type: string
 *           nullable: true
 *         justificacionIa:
 *           type: string
 *           nullable: true
 *         clasificadoPorIa:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     OrientacionIA:
 *       type: object
 *       nullable: true
 *       description: Orientacion institucional generada por IA. Null si la IA fallo o no hay API key.
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         reporteId:
 *           type: string
 *           format: uuid
 *         institucionNombre:
 *           type: string
 *           nullable: true
 *           example: "Servicios de Agua y Drenaje de Monterrey"
 *         institucionDescripcion:
 *           type: string
 *           nullable: true
 *           example: "Organismo encargado del suministro de agua potable y alcantarillado"
 *         institucionSitioWeb:
 *           type: string
 *           nullable: true
 *           example: "https://www.sadm.gob.mx"
 *         confianza:
 *           type: number
 *           nullable: true
 *           example: 0.92
 *           description: Nivel de certeza de la IA (0.00 - 1.00)
 *         mediosContacto:
 *           type: array
 *           nullable: true
 *           items:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [web, email, telefono, direccion_fisica, red_social, app_movil]
 *               valor:
 *                 type: string
 *               horario_atencion:
 *                 type: string
 *                 nullable: true
 *           example:
 *             - tipo: "telefono"
 *               valor: "81-8150-6000"
 *               horario_atencion: "L-V 8:00-17:00"
 *             - tipo: "web"
 *               valor: "https://www.sadm.gob.mx/reportes"
 *               horario_atencion: null
 *         proximosPasos:
 *           type: array
 *           nullable: true
 *           items:
 *             type: object
 *             properties:
 *               orden:
 *                 type: integer
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *           example:
 *             - orden: 1
 *               titulo: "Confirmar institucion"
 *               descripcion: "Verifica que Servicios de Agua y Drenaje es la institucion correcta."
 *             - orden: 2
 *               titulo: "Reunir evidencia"
 *               descripcion: "Fotos de la fuga, direccion exacta, fecha de inicio."
 *             - orden: 3
 *               titulo: "Presentar reporte"
 *               descripcion: "Llama al 81-8150-6000 o usa el formulario web."
 *         requiereMasInformacion:
 *           type: boolean
 *           example: false
 *           description: true si la IA no pudo identificar la institucion con certeza
 *         mensajeFallback:
 *           type: string
 *           nullable: true
 *           description: Pregunta aclaratoria o mensaje cuando requiere mas informacion
 *         modeloIA:
 *           type: string
 *           nullable: true
 *           example: "gemini-2.0-flash"
 *         promptVersion:
 *           type: string
 *           nullable: true
 *           example: "v1.0"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CrearReporteResponse:
 *       type: object
 *       properties:
 *         reporte:
 *           $ref: '#/components/schemas/Reporte'
 *         orientacionIA:
 *           $ref: '#/components/schemas/OrientacionIA'
 *     CrearReporteInput:
 *       type: object
 *       required:
 *         - titulo
 *         - areaServicio
 *         - categoria
 *         - tipoUbicacion
 *       properties:
 *         titulo:
 *           type: string
 *           example: "Fuga de agua en calle principal"
 *         descripcion:
 *           type: string
 *           example: "Lleva goteando desde ayer"
 *         areaServicio:
 *           type: string
 *           enum: [AGUA, ALUMBRADO, BACHEO, RECOLECCION_BASURA, DRENAJE, OTRO]
 *           example: "AGUA"
 *         categoria:
 *           type: string
 *           enum: [INFRAESTRUCTURA, SEGURIDAD, LIMPIEZA, SERVICIOS_PUBLICOS, OTRO]
 *           example: "INFRAESTRUCTURA"
 *         tipoUbicacion:
 *           type: string
 *           enum: [PUNTO, AREA]
 *           example: "PUNTO"
 *         latitud:
 *           type: number
 *           example: 25.6718
 *         longitud:
 *           type: number
 *           example: -100.309
 *         direccion:
 *           type: string
 *           example: "Av. Constitución 1500"
 *         colonia:
 *           type: string
 *           example: "Centro"
 *         municipio:
 *           type: string
 *           example: "Monterrey"
 *         fotoUrl:
 *           type: string
 *           example: "https://storage.supabase.co/foto.jpg"
 *         contactoEmail:
 *           type: string
 *           example: "ciudadano@email.com"
 *         contactoTelefono:
 *           type: string
 *           example: "8112345678"
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Campos obligatorios faltantes"
 */

/**
 * @swagger
 * /api/reportes:
 *   post:
 *     summary: Crear un nuevo reporte ciudadano
 *     description: |
 *       Crea un reporte con clasificacion automatica de prioridad por IA y genera
 *       orientacion institucional (institucion competente, medios de contacto, proximos pasos).
 *       Rate limit de 10 requests por IP cada 15 minutos.
 *     tags: [Reportes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearReporteInput'
 *     responses:
 *       201:
 *         description: Reporte creado exitosamente con orientacion IA
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrearReporteResponse'
 *       400:
 *         description: Error de validacion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Demasiadas solicitudes
 */

router.post('/', crearReporteLimiter(), reporteController.crearReporte)

/**
 * @swagger
 * /api/reportes:
 *   get:
 *     summary: Listar reportes con filtros opcionales
 *     description: Retorna todos los reportes ordenados por fecha descendente. Acepta filtros por query params.
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, EN_PROCESO, RESUELTO, CANCELADO]
 *         description: Filtrar por estado
 *       - in: query
 *         name: prioridad
 *         schema:
 *           type: string
 *           enum: [BAJA, MEDIA, ALTA, URGENTE]
 *         description: Filtrar por prioridad
 *       - in: query
 *         name: areaServicio
 *         schema:
 *           type: string
 *           enum: [AGUA, ALUMBRADO, BACHEO, RECOLECCION_BASURA, DRENAJE, OTRO]
 *         description: Filtrar por area de servicio
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *           enum: [INFRAESTRUCTURA, SEGURIDAD, LIMPIEZA, SERVICIOS_PUBLICOS, OTRO]
 *         description: Filtrar por categoria
 *     responses:
 *       200:
 *         description: Lista de reportes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 reportes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reporte'
 */
router.get('/', reporteController.listarReportes)

/**
 * @swagger
 * /api/reportes/{codigo}:
 *   get:
 *     summary: Buscar reporte por codigo de seguimiento
 *     description: Retorna el reporte completo con su historial de estados.
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *         description: Codigo de seguimiento (ej REP-001)
 *         example: "REP-001"
 *     responses:
 *       200:
 *         description: Reporte encontrado con historial
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Reporte'
 *                 - type: object
 *                   properties:
 *                     historial:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           estado_anterior:
 *                             type: string
 *                             nullable: true
 *                           estado_nuevo:
 *                             type: string
 *                           changed_at:
 *                             type: string
 *                             format: date-time
 *       404:
 *         description: Reporte no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:codigo', reporteController.buscarPorCodigo)

/**
 * @swagger
 * /api/reportes/{id}/estado:
 *   patch:
 *     summary: Actualizar el estado de un reporte
 *     description: Cambia el estado de un reporte. El historial se registra automaticamente.
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del reporte
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [PENDIENTE, EN_PROCESO, RESUELTO, CANCELADO]
 *                 example: "EN_PROCESO"
 *     responses:
 *       200:
 *         description: Reporte actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reporte'
 *       400:
 *         description: Estado invalido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Reporte no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/estado', reporteController.actualizarEstado)

export default router
