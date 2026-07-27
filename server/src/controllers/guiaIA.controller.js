/**
 * Controlador HTTP: Guia IA (Orientacion Institucional)
 * Endpoint de solo lectura — no invoca a la IA.
 * Retorna el registro ya persistido en orientacion_ia.
 * Req 8.6, 8.7, 8.8, 8.9
 */
import * as orientacionService from '../services/orientacionIA.service.js'

/**
 * GET /api/v1/reportes/:reporteId/guia-ia
 * Retorna la orientacion IA guardada para un reporte.
 * No requiere autenticacion (Req 8.7).
 */
export async function obtenerGuiaIA (req, res, next) {
  try {
    const { reporteId } = req.params

    const resultado = await orientacionService.obtenerOrientacionPorReporte(reporteId)

    if (!resultado.exito) {
      // Distinguir entre 400 (UUID invalido) y 404 (no encontrado)
      const status = resultado.error.includes('UUID') ? 400 : 404
      return res.status(status).json({ error: resultado.error })
    }

    // Si requiere mas informacion, responder 206 (Partial Content)
    const status = resultado.orientacion.requiere_mas_informacion ? 206 : 200

    return res.status(status).json(resultado.orientacion)
  } catch (error) {
    next(error)
  }
}
