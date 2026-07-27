/**
 * Clases de error HTTP personalizadas.
 * Permiten lanzar errores con codigo de estado y codigo interno
 * que el errorHandler interpreta para construir respuestas estandarizadas.
 *
 * Uso:
 *   throw new BadRequestError('El campo titulo es obligatorio');
 *   throw new NotFoundError('Reporte no encontrado');
 */

export class AppError extends Error {
  constructor(message, statusCode, code, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Solicitud invalida', details = null) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado', details = null) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto con el estado actual', details = null) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Demasiadas solicitudes', details = null) {
    super(message, 429, 'TOO_MANY_REQUESTS', details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Error interno del servidor', details = null) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', details);
  }
}
