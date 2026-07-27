/**
 * Logger centralizado con Winston.
 * Registra logs por nivel en archivos separados y en consola (desarrollo).
 * Helpers por contexto para facilitar trazabilidad en cada capa del sistema.
 */
import { createLogger, format, transports } from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, '../../logs');

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    // Solo errores
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
    }),

    // Advertencias
    new transports.File({
      filename: path.join(logsDir, 'warn.log'),
      level: 'warn',
    }),

    // Info
    new transports.File({
      filename: path.join(logsDir, 'info.log'),
      level: 'info',
    }),

    // Todos los logs combinados
    new transports.File({
      filename: path.join(logsDir, 'combined.log'),
    }),

    // Consola (solo en desarrollo)
    ...(process.env.NODE_ENV !== 'production'
      ? [new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          ),
        })]
      : []),
  ],
});

// --- Helpers por contexto del proyecto ---

/**
 * Crea un helper de logging con contexto predefinido.
 * @param {string} context - Nombre del modulo/capa
 * @returns {{ info: Function, error: Function, warn: Function, debug: Function }}
 */
function crearContexto(context) {
  return {
    info: (message, meta = {}) => logger.info({ ...meta, context, message }),
    error: (message, meta = {}) => logger.error({ ...meta, context, message }),
    warn: (message, meta = {}) => logger.warn({ ...meta, context, message }),
    debug: (message, meta = {}) => logger.debug({ ...meta, context, message }),
  };
}

logger.api = crearContexto('API');
logger.reportes = crearContexto('REPORTES');
logger.ia = crearContexto('IA');
logger.database = crearContexto('DATABASE');
logger.security = crearContexto('SECURITY');
logger.server = crearContexto('SERVER');

export { logger };
