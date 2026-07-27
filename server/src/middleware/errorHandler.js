/**
 * Middleware global de manejo de errores.
 *
 * Captura cualquier error lanzado en la aplicacion y:
 * - Devuelve una respuesta JSON estandarizada con codigo y mensaje.
 * - Registra el error via Winston con contexto completo.
 * - Incluye stack trace y detalles solo en desarrollo.
 * - Nunca expone informacion sensible al cliente en produccion.
 */
import { InternalServerError } from '../lib/apiErrors.js'
import { logger } from '../utils/logger.js'

/**
 * @param {Error} err - Error lanzado o pasado a next().
 * @param {import('express').Request} req - Objeto de solicitud HTTP.
 * @param {import('express').Response} res - Objeto de respuesta HTTP.
 * @param {import('express').NextFunction} next - Siguiente middleware.
 */
export function errorHandler (err, req, res, next) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Si el error no tiene statusCode, convertirlo a InternalServerError
  if (!err.statusCode) {
    err = new InternalServerError('Error inesperado', { original: err.message })
  }

  const statusCode = err.statusCode || 500
  const code = err.code || 'INTERNAL_SERVER_ERROR'
  const message = err.message || 'Ocurrio un error inesperado'

  // Log del error con Winston
  logger.api.error(message, {
    code,
    statusCode,
    path: req.originalUrl,
    method: req.method,
    stack: err.stack,
    details: err.details
  })

  // Respuesta estandarizada al cliente
  const response = {
    status: 'error',
    httpStatus: statusCode,
    code,
    message
  }

  // Solo incluir detalles y stack en desarrollo
  if (isDevelopment) {
    response.details = err.details || null
    response.stack = err.stack
  }

  res.status(statusCode).json(response)
}
