/**
 * Fallbacks centralizados para el modulo de IA.
 * Se usan cuando la IA no responde, falla, o no hay credenciales.
 * Req 3.3, 3.4, 8.4, 8.5, 9.6
 */

export const CLASIFICACION_FALLBACK = {
  prioridad: 'MEDIA',
  justificacion: null,
  clasificadoPorIa: false
}

export const ORIENTACION_FALLBACK = {
  institucionNombre: null,
  institucionDescripcion: null,
  institucionSitioWeb: null,
  confianza: null,
  mediosContacto: [],
  proximosPasos: [],
  requiereMasInformacion: true,
  mensajeFallback: 'No fue posible identificar la institucion competente en este momento. Por favor, intenta de nuevo mas tarde o contacta directamente a tu municipio.',
  modeloIA: null
}
