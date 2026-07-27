/**
 * Cliente HTTP base para comunicación con el backend.
 * Centraliza la URL base, headers, y manejo de errores.
 * Todos los servicios usan este cliente — nunca fetch directo en componentes.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export interface ApiError {
  error: string
  httpStatus?: number
  code?: string
}

export interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
  loading?: boolean
}

/**
 * Realiza una petición HTTP al backend.
 * @param endpoint - Ruta relativa (ej: '/reportes', '/reportes/REP-001')
 * @param options - Opciones de fetch (method, body, headers)
 * @returns Datos parseados o error estructurado
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })

    const responseData = await response.json()

    if (!response.ok) {
      return {
        data: null,
        error: {
          error: responseData.error || responseData.message || 'Error desconocido',
          httpStatus: response.status,
          code: responseData.code || undefined,
        },
      }
    }

    return { data: responseData as T, error: null }
  } catch (error) {
    return {
      data: null,
      error: {
        error: 'No se pudo conectar con el servidor. Verifica tu conexión.',
        httpStatus: 0,
        code: 'NETWORK_ERROR',
      },
    }
  }
}
