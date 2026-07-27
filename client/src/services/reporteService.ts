/**
 * Servicio de Reportes.
 * Centraliza todas las llamadas HTTP relacionadas con reportes ciudadanos.
 */
import { apiRequest } from './apiClient'

// --- Tipos de entrada ---

export interface CrearReporteInput {
  titulo: string
  descripcion?: string
  areaServicio: string
  categoria: string
  tipoUbicacion: 'PUNTO' | 'AREA'
  latitud?: number
  longitud?: number
  direccion?: string
  colonia?: string
  municipio?: string
  fotoUrl?: string | null
  contactoEmail?: string
  contactoTelefono?: string
}

// --- Tipos de respuesta ---

export interface Reporte {
  id: string
  codigoSeguimiento: string
  titulo: string
  descripcion: string | null
  areaServicio: string
  categoria: string
  prioridad: string
  estado: string
  tipoUbicacion: string
  latitud: string | null
  longitud: string | null
  direccion: string | null
  colonia: string | null
  municipio: string
  fotoUrl: string | null
  contactoEmail: string | null
  contactoTelefono: string | null
  justificacionIa: string | null
  clasificadoPorIa: boolean
  createdAt: string
  updatedAt: string
}

export interface ReporteConHistorial extends Reporte {
  historial: {
    estado_anterior: string | null
    estado_nuevo: string
    changed_at: string
  }[]
}

export interface ListaReportesResponse {
  total: number
  reportes: Reporte[]
}

// --- Funciones del servicio ---

/**
 * Crea un nuevo reporte ciudadano.
 * El backend clasifica la prioridad con IA automáticamente.
 */
export async function crearReporte(datos: CrearReporteInput) {
  return apiRequest<Reporte>('/reportes', {
    method: 'POST',
    body: JSON.stringify(datos),
  })
}

/**
 * Busca un reporte por su código de seguimiento (ej: REP-001).
 * Incluye el historial de estados para el progress tracker.
 */
export async function buscarPorCodigo(codigo: string) {
  return apiRequest<ReporteConHistorial>(`/reportes/${codigo}`)
}

/**
 * Lista reportes con filtros opcionales.
 * Usado en la landing (reportes recientes) y en el mapa.
 */
export async function listarReportes(filtros?: {
  estado?: string
  prioridad?: string
  areaServicio?: string
  categoria?: string
}) {
  const params = new URLSearchParams()
  if (filtros?.estado) params.set('estado', filtros.estado)
  if (filtros?.prioridad) params.set('prioridad', filtros.prioridad)
  if (filtros?.areaServicio) params.set('areaServicio', filtros.areaServicio)
  if (filtros?.categoria) params.set('categoria', filtros.categoria)

  const query = params.toString() ? `?${params.toString()}` : ''
  return apiRequest<ListaReportesResponse>(`/reportes${query}`)
}

/**
 * Actualiza el estado de un reporte (uso interno/futuro).
 */
export async function actualizarEstado(id: string, estado: string) {
  return apiRequest<Reporte>(`/reportes/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  })
}
