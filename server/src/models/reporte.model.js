/**
 * Modelo de acceso a datos: Reporte
 * Consultas puras contra la BD usando PrismaClient.
 * No contiene logica de negocio — solo operaciones CRUD.
 */
import { prisma } from '../db/prisma.js';

/**
 * Genera un codigo de seguimiento unico con formato REP-XXX.
 * Consulta el ultimo codigo existente e incrementa.
 */
async function generarCodigoSeguimiento() {
  const ultimoReporte = await prisma.reporte.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { codigoSeguimiento: true },
  });

  if (!ultimoReporte) {
    return 'REP-001';
  }

  const ultimoNumero = parseInt(
    ultimoReporte.codigoSeguimiento.replace('REP-', ''),
    10
  );
  const nuevoNumero = ultimoNumero + 1;
  return `REP-${String(nuevoNumero).padStart(3, '0')}`;
}

/**
 * Crea un nuevo reporte en la BD.
 * @param {object} datos - Campos del reporte (sin id, codigo_seguimiento, timestamps)
 * @returns {object} El reporte creado completo
 */
export async function crearReporte(datos) {
  const codigoSeguimiento = await generarCodigoSeguimiento();

  const reporte = await prisma.reporte.create({
    data: {
      codigoSeguimiento,
      titulo: datos.titulo,
      descripcion: datos.descripcion ?? null,
      areaServicio: datos.areaServicio,
      categoria: datos.categoria,
      prioridad: datos.prioridad,
      estado: 'PENDIENTE',
      tipoUbicacion: datos.tipoUbicacion,
      latitud: datos.latitud ?? null,
      longitud: datos.longitud ?? null,
      direccion: datos.direccion ?? null,
      colonia: datos.colonia ?? null,
      municipio: datos.municipio ?? 'Monterrey',
      fotoUrl: datos.fotoUrl ?? null,
      contactoEmail: datos.contactoEmail ?? null,
      contactoTelefono: datos.contactoTelefono ?? null,
      justificacionIa: datos.justificacionIa ?? null,
      clasificadoPorIa: datos.clasificadoPorIa ?? false,
    },
  });

  return reporte;
}

/**
 * Lista reportes con filtros opcionales.
 * @param {object} filtros - { estado, prioridad, areaServicio, categoria }
 * @returns {{ total: number, reportes: object[] }}
 */
export async function listarReportes(filtros = {}) {
  const where = {};

  if (filtros.estado) where.estado = filtros.estado;
  if (filtros.prioridad) where.prioridad = filtros.prioridad;
  if (filtros.areaServicio) where.areaServicio = filtros.areaServicio;
  if (filtros.categoria) where.categoria = filtros.categoria;

  const [total, reportes] = await Promise.all([
    prisma.reporte.count({ where }),
    prisma.reporte.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { total, reportes };
}

/**
 * Busca un reporte por su codigo de seguimiento (ej: REP-001).
 * Incluye el historial de estados.
 * @param {string} codigo - Codigo de seguimiento
 * @returns {object|null} El reporte con historial, o null si no existe
 */
export async function buscarPorCodigo(codigo) {
  const reporte = await prisma.reporte.findUnique({
    where: { codigoSeguimiento: codigo },
    include: {
      historialEstados: {
        orderBy: { changedAt: 'asc' },
        select: {
          estadoAnterior: true,
          estadoNuevo: true,
          changedAt: true,
        },
      },
    },
  });

  return reporte;
}

/**
 * Busca un reporte por su UUID.
 * @param {string} id - UUID del reporte
 * @returns {object|null}
 */
export async function buscarPorId(id) {
  const reporte = await prisma.reporte.findUnique({
    where: { id },
  });

  return reporte;
}

/**
 * Actualiza el estado de un reporte y registra el cambio en historial_estados.
 * Usa una transaccion para garantizar consistencia.
 * @param {string} id - UUID del reporte
 * @param {string} nuevoEstado - Nuevo valor del enum EstadoReporte
 * @returns {object} El reporte actualizado
 */
export async function actualizarEstado(id, nuevoEstado) {
  const reporteActual = await prisma.reporte.findUnique({
    where: { id },
    select: { estado: true },
  });

  if (!reporteActual) return null;

  const resultado = await prisma.$transaction(async (tx) => {
    // Registrar en historial
    await tx.historialEstado.create({
      data: {
        reporteId: id,
        estadoAnterior: reporteActual.estado,
        estadoNuevo: nuevoEstado,
      },
    });

    // Actualizar el reporte
    const reporteActualizado = await tx.reporte.update({
      where: { id },
      data: { estado: nuevoEstado },
    });

    return reporteActualizado;
  });

  return resultado;
}
