/**
 * Servicio de logica de negocio: Reportes
 * Orquesta validaciones, clasificacion IA, y operaciones de datos.
 */
import * as reporteModel from '../models/reporte.model.js'
import { generarYPersistirOrientacion } from './orientacionIA.service.js'

// --- Constantes de validacion (alineadas con Prisma schema enums) ---

const AREAS_VALIDAS = ['AGUA', 'ALUMBRADO', 'BACHEO', 'RECOLECCION_BASURA', 'DRENAJE', 'OTRO']
const CATEGORIAS_VALIDAS = ['INFRAESTRUCTURA', 'SEGURIDAD', 'LIMPIEZA', 'SERVICIOS_PUBLICOS', 'OTRO']
const ESTADOS_VALIDOS = ['PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'CANCELADO']
const TIPOS_UBICACION_VALIDOS = ['PUNTO', 'AREA']

/**
 * Valida los campos obligatorios para crear un reporte.
 * @param {object} datos - Body del request
 * @returns {{ valido: boolean, errores: string[] }}
 */
function validarCamposCreacion (datos) {
  const errores = []

  // Campos obligatorios
  if (!datos.titulo?.trim()) {
    errores.push('El campo "titulo" es obligatorio')
  }
  if (!datos.areaServicio) {
    errores.push('El campo "areaServicio" es obligatorio')
  }
  if (!datos.categoria) {
    errores.push('El campo "categoria" es obligatorio')
  }
  if (!datos.tipoUbicacion) {
    errores.push('El campo "tipoUbicacion" es obligatorio')
  }

  // Validar enums
  if (datos.areaServicio && !AREAS_VALIDAS.includes(datos.areaServicio)) {
    errores.push(
      `"areaServicio" debe ser uno de: ${AREAS_VALIDAS.join(', ')}`
    )
  }
  if (datos.categoria && !CATEGORIAS_VALIDAS.includes(datos.categoria)) {
    errores.push(
      `"categoria" debe ser uno de: ${CATEGORIAS_VALIDAS.join(', ')}`
    )
  }
  if (datos.tipoUbicacion && !TIPOS_UBICACION_VALIDOS.includes(datos.tipoUbicacion)) {
    errores.push(
      `"tipoUbicacion" debe ser uno de: ${TIPOS_UBICACION_VALIDOS.join(', ')}`
    )
  }

  // Validar ubicacion segun tipo
  if (datos.tipoUbicacion === 'PUNTO') {
    if (datos.latitud == null || datos.longitud == null) {
      errores.push(
        'Cuando tipoUbicacion es "PUNTO", "latitud" y "longitud" son obligatorios'
      )
    }
  }

  if (datos.tipoUbicacion === 'AREA') {
    if (!datos.direccion?.trim()) {
      errores.push(
        'Cuando tipoUbicacion es "AREA", "direccion" es obligatorio'
      )
    }
  }

  return { valido: errores.length === 0, errores }
}

/**
 * Crea un nuevo reporte con clasificacion de prioridad por IA.
 * @param {object} datos - Datos del reporte desde el request body
 * @returns {{ exito: boolean, reporte?: object, errores?: string[] }}
 */
export async function crearReporte (datos) {
  // 1. Validar campos
  const { valido, errores } = validarCamposCreacion(datos)
  if (!valido) {
    return { exito: false, errores }
  }

 

  // 3. Insertar en BD
  const reporte = await reporteModel.crearReporte({
    titulo: datos.titulo.trim(),
    descripcion: datos.descripcion?.trim() || null,
    areaServicio: datos.areaServicio,
    categoria: datos.categoria,
    prioridad: 'MEDIA',
    tipoUbicacion: datos.tipoUbicacion,
    latitud: datos.latitud ?? null,
    longitud: datos.longitud ?? null,
    direccion: datos.direccion?.trim() || null,
    colonia: datos.colonia?.trim() || null,
    municipio: datos.municipio || 'Monterrey',
    fotoUrl: datos.fotoUrl || null,
    contactoEmail: datos.contactoEmail?.trim() || null,
    contactoTelefono: datos.contactoTelefono?.trim() || null,
    justificacionIa: null,
    clasificadoPorIa: false
  })

  // 4. Generar orientacion IA (Req 8.1, 8.5)
  let orientacionIA = null
  try {
    orientacionIA = await generarYPersistirOrientacion(reporte)
  } catch (error) {
    console.error('[reporte.service] Error generando orientacion IA:', error.message)
  }

  return { exito: true, reporte, orientacionIA }

}

/**
 * Lista reportes con filtros opcionales.
 * Valida que los filtros sean valores de enum validos.
 * @param {object} filtros - Query params { estado, prioridad, areaServicio, categoria }
 * @returns {{ exito: boolean, total?: number, reportes?: object[], errores?: string[] }}
 */
export async function listarReportes (filtros = {}) {
  const errores = []

  // Validar filtros si se proporcionan
  if (filtros.estado && !ESTADOS_VALIDOS.includes(filtros.estado)) {
    errores.push(`"estado" debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`)
  }
  if (filtros.prioridad && !['BAJA', 'MEDIA', 'ALTA', 'URGENTE'].includes(filtros.prioridad)) {
    errores.push('"prioridad" debe ser uno de: BAJA, MEDIA, ALTA, URGENTE')
  }
  if (filtros.areaServicio && !AREAS_VALIDAS.includes(filtros.areaServicio)) {
    errores.push(`"areaServicio" debe ser uno de: ${AREAS_VALIDAS.join(', ')}`)
  }
  if (filtros.categoria && !CATEGORIAS_VALIDAS.includes(filtros.categoria)) {
    errores.push(`"categoria" debe ser uno de: ${CATEGORIAS_VALIDAS.join(', ')}`)
  }

  if (errores.length > 0) {
    return { exito: false, errores }
  }

  const resultado = await reporteModel.listarReportes(filtros)
  return { exito: true, ...resultado }
}

/**
 * Busca un reporte por codigo de seguimiento.
 * @param {string} codigo - Ej: REP-001
 * @returns {{ exito: boolean, reporte?: object, error?: string }}
 */
export async function buscarPorCodigo (codigo) {
  if (!codigo?.trim()) {
    return { exito: false, error: 'El codigo de seguimiento es obligatorio' }
  }

  const reporte = await reporteModel.buscarPorCodigo(codigo.trim().toUpperCase())

  if (!reporte) {
    return { exito: false, error: `No se encontro un reporte con codigo "${codigo}"` }
  }

  // Formatear historial para la respuesta
  const { historialEstados, ...datosReporte } = reporte
  return {
    exito: true,
    reporte: {
      ...datosReporte,
      historial: historialEstados.map((h) => ({
        estado_anterior: h.estadoAnterior,
        estado_nuevo: h.estadoNuevo,
        changed_at: h.changedAt
      }))
    }
  }
}

/**
 * Actualiza el estado de un reporte.
 * @param {string} id - UUID del reporte
 * @param {string} nuevoEstado - Nuevo estado
 * @returns {{ exito: boolean, reporte?: object, error?: string }}
 */
export async function actualizarEstado (id, nuevoEstado) {
  // Validar UUID basico
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!id || !uuidRegex.test(id)) {
    return { exito: false, error: 'El ID debe ser un UUID valido' }
  }

  // Validar estado
  if (!nuevoEstado || !ESTADOS_VALIDOS.includes(nuevoEstado)) {
    return {
      exito: false,
      error: `"estado" debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`
    }
  }

  const reporte = await reporteModel.actualizarEstado(id, nuevoEstado)

  if (!reporte) {
    return { exito: false, error: `No se encontro un reporte con id "${id}"` }
  }

  return { exito: true, reporte }
}
