/**
 * Servicio de Orientación IA.
 * Consulta la guía institucional generada por IA para un reporte.
 */
import { apiRequest } from './apiClient'

// --- Tipos de respuesta ---

export interface MedioContacto {
  tipo: string
  valor: string
  horario_atencion: string | null
}

export interface PasoSiguiente {
  orden: number
  titulo: string
  descripcion: string
}

export interface OrientacionIA {
  reporte_id: string
  resumen_queja: string | null
  categoria: string | null
  institucion: {
    nombre: string | null
    descripcion: string | null
    sitio_web: string | null
    confianza: number | null
  }
  medios_contacto: MedioContacto[]
  pasos_siguientes: PasoSiguiente[]
  requiere_mas_informacion: boolean
  pregunta_aclaratoria: string | null
  timestamp: string
}

// --- Funciones del servicio ---

/**
 * Obtiene la orientación IA guardada para un reporte.
 * No invoca a la IA — retorna datos ya persistidos.
 */
export async function obtenerGuiaIA(reporteId: string) {
  return apiRequest<OrientacionIA>(`/v1/reportes/${reporteId}/guia-ia`)
}
