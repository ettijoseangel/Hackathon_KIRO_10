/**
 * Modelo de acceso a datos: HistorialEstado
 * Consultas puras contra la BD usando PrismaClient.
 */
import { prisma } from '../db/prisma.js';

/**
 * Obtiene el historial de estados de un reporte.
 * @param {string} reporteId - UUID del reporte
 * @returns {object[]} Array de cambios de estado ordenados cronologicamente
 */
export async function obtenerHistorialPorReporte(reporteId) {
  const historial = await prisma.historialEstado.findMany({
    where: { reporteId },
    orderBy: { changedAt: 'asc' },
    select: {
      estadoAnterior: true,
      estadoNuevo: true,
      comentario: true,
      changedAt: true,
    },
  });

  return historial;
}

/**
 * Crea una entrada de historial manualmente.
 * Nota: normalmente esto se maneja dentro de la transaccion de actualizarEstado.
 * @param {object} datos - { reporteId, estadoAnterior, estadoNuevo, comentario? }
 * @returns {object} La entrada creada
 */
export async function crearEntradaHistorial(datos) {
  const entrada = await prisma.historialEstado.create({
    data: {
      reporteId: datos.reporteId,
      estadoAnterior: datos.estadoAnterior ?? null,
      estadoNuevo: datos.estadoNuevo,
      comentario: datos.comentario ?? null,
    },
  });

  return entrada;
}
