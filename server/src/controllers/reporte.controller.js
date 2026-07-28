/**
 * Controlador HTTP: Reportes
 * Maneja requests/responses y delega logica a la capa de servicios.
 * No contiene logica de negocio ni acceso directo a datos.
 */
import * as reporteService from '../services/reporte.service.js'

/**
 * POST /api/reportes
 * Crea un nuevo reporte ciudadano.
 */
export async function crearReporte (req, res, next) {
  try {
    const resultado = await reporteService.crearReporte(req.body)

    if (!resultado.exito) {
      return res.status(400).json({ error: resultado.errores.join('; ') })
    }

    return res.status(201).json({
      reporte: resultado.reporte,
      orientacionIA: resultado.orientacionIA || null
    })

  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/reportes
 * Lista reportes con filtros opcionales (query params).
 */
export async function listarReportes (req, res, next) {
  try {
    const filtros = {
      estado: req.query.estado || undefined,
      prioridad: req.query.prioridad || undefined,
      areaServicio: req.query.areaServicio || undefined,
      categoria: req.query.categoria || undefined
    }

    const resultado = await reporteService.listarReportes(filtros)

    if (!resultado.exito) {
      return res.status(400).json({ error: resultado.errores.join('; ') })
    }

    return res.status(200).json({
      total: resultado.total,
      reportes: resultado.reportes
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/reportes/:codigo
 * Busca un reporte por codigo de seguimiento (ej: REP-001).
 * Incluye historial de estados.
 */
export async function buscarPorCodigo (req, res, next) {
  try {
    const { codigo } = req.params
    const resultado = await reporteService.buscarPorCodigo(codigo)

    if (!resultado.exito) {
      return res.status(404).json({ error: resultado.error })
    }

    return res.status(200).json(resultado.reporte)
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/reportes/:id/estado
 * Actualiza el estado de un reporte.
 */
export async function actualizarEstado (req, res, next) {
  try {
    const { id } = req.params
    const { estado } = req.body

    if (!estado) {
      return res.status(400).json({ error: 'El campo "estado" es obligatorio en el body' })
    }

    const resultado = await reporteService.actualizarEstado(id, estado)

    if (!resultado.exito) {
      // Distinguir entre 400 (validacion) y 404 (no encontrado)
      const status = resultado.error.includes('No se encontro') ? 404 : 400
      return res.status(status).json({ error: resultado.error })
    }

    return res.status(200).json(resultado.reporte)
  } catch (error) {
    next(error)
  }
}
