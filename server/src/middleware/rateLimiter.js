/**
 * Middleware de rate limiting.
 * Protege contra ataques de fuerza bruta y spam en endpoints criticos.
 * Limita la cantidad de requests por IP en una ventana de tiempo.
 */
import rateLimit from 'express-rate-limit';

/**
 * Rate limiter general para todas las rutas de la API.
 * Permite 100 requests por IP cada 15 minutos.
 */
export function generalLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' },
  });
}

/**
 * Rate limiter estricto para creacion de reportes.
 * Permite 10 reportes por IP cada 15 minutos.
 * Evita spam masivo de reportes falsos.
 */
export function crearReporteLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Has creado demasiados reportes. Intenta de nuevo en 15 minutos.' },
  });
}
