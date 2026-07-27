/**
 * Modelo de acceso a datos: OrientacionIA
 * Consultas puras contra la BD usando PrismaClient.
 * No contiene logica de negocio — solo operaciones CRUD.
 */
import { prisma } from '../db/prisma.js'

/**
 * Crea un registro de orientacion IA para un reporte.
 * @param {object} datos - Campos de la orientacion
 * @returns {object} El registro creado
 */
export async function crearOrientacion (datos) {
  const orientacion = await prisma.orientacionIA.create({
    data: {
      reporteId: datos.reporteId,
      institucionNombre: datos.institucionNombre ?? null,
      institucionDescripcion: datos.institucionDescripcion ?? null,
      institucionSitioWeb: datos.institucionSitioWeb ?? null,
      confianza: datos.confianza ?? null,
      mediosContacto: datos.mediosContacto ?? null,
      proximosPasos: datos.proximosPasos ?? null,
      requiereMasInformacion: datos.requiereMasInformacion ?? false,
      mensajeFallback: datos.mensajeFallback ?? null,
      modeloIA: datos.modeloIA ?? null,
      promptVersion: datos.promptVersion ?? null
    }
  })

  return orientacion
}

/**
 * Busca la orientacion IA asociada a un reporte.
 * @param {string} reporteId - UUID del reporte
 * @returns {object|null} Registro de orientacion o null si no existe
 */
export async function buscarPorReporteId (reporteId) {
  const orientacion = await prisma.orientacionIA.findUnique({
    where: { reporteId }
  })

  return orientacion
}
