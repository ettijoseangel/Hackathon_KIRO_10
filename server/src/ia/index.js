/**
 * Factory/Registry de proveedores de IA (Req 9).
 *
 * Selecciona el adaptador activo segun la variable de entorno AI_PROVIDER.
 * Aplica fallbacks centralizados cuando el adaptador retorna null o falla.
 *
 * Proveedores soportados:
 * - anthropic (default) — requiere ANTHROPIC_API_KEY
 * - gemini — requiere GEMINI_API_KEY
 * - openai — requiere OPENAI_API_KEY
 *
 * Para agregar uno nuevo:
 * 1. Crear src/ia/<nombre>Adapter.js con clasificarPrioridad y generarOrientacion.
 * 2. Registrarlo en el objeto ADAPTERS de este archivo.
 * 3. Configurar AI_PROVIDER=<nombre> en .env.
 */
import * as anthropicAdapter from './anthropicAdapter.js'
import * as geminiAdapter from './geminiAdapter.js'
import * as openaiAdapter from './openaiAdapter.js'
import { CLASIFICACION_FALLBACK, ORIENTACION_FALLBACK } from './fallbacks.js'
import { validarAdapter } from './iaInterface.js'

// --- Registro de adaptadores ---
const ADAPTERS = {
  anthropic: anthropicAdapter,
  gemini: geminiAdapter,
  openai: openaiAdapter
}

// --- Mapa de variables de entorno por proveedor ---
const API_KEY_MAP = {
  anthropic: 'ANTHROPIC_API_KEY',
  gemini: 'GEMINI_API_KEY',
  openai: 'OPENAI_API_KEY'
}

/**
 * Obtiene el adaptador configurado por AI_PROVIDER.
 * @returns {object|null} Adaptador validado o null si no existe
 */
function getAdapter () {
  const provider = process.env.AI_PROVIDER || 'anthropic'
  const adapter = ADAPTERS[provider]

  if (!adapter) {
    console.error(
      `[ia/index] Proveedor "${provider}" no registrado. Proveedores disponibles: ${Object.keys(ADAPTERS).join(', ')}`
    )
    return null
  }

  validarAdapter(adapter, provider)
  return adapter
}

/**
 * Verifica si hay una API key configurada para el proveedor activo.
 * @returns {boolean}
 */
function tieneApiKey () {
  const provider = process.env.AI_PROVIDER || 'anthropic'
  const envVar = API_KEY_MAP[provider] || 'AI_PROVIDER_API_KEY'
  return !!process.env[envVar]
}

/**
 * Clasifica la prioridad de un reporte con fallback automatico.
 * Req 9.6: el fallback no es responsabilidad del adaptador.
 * @param {{titulo: string, descripcion: string, categoria: string}} input
 * @returns {Promise<{prioridad: string, justificacion: string|null, clasificadoPorIa: boolean}>}
 */
export async function clasificarPrioridad (input) {
  if (!tieneApiKey()) {
    return CLASIFICACION_FALLBACK
  }

  try {
    const adapter = getAdapter()
    if (!adapter) return CLASIFICACION_FALLBACK

    const resultado = await adapter.clasificarPrioridad(input)
    return resultado || CLASIFICACION_FALLBACK
  } catch (error) {
    console.error('[ia/index] Error en clasificarPrioridad:', error.message)
    return CLASIFICACION_FALLBACK
  }
}

/**
 * Genera orientacion institucional con fallback automatico.
 * Req 9.6: el fallback no es responsabilidad del adaptador.
 * @param {{reporteId: string, descripcionQueja: string, categoria: string|null, ubicacion: object}} input
 * @returns {Promise<object>} Resultado de orientacion o fallback
 */
export async function generarOrientacion (input) {
  if (!tieneApiKey()) {
    return ORIENTACION_FALLBACK
  }

  try {
    const adapter = getAdapter()
    if (!adapter) return ORIENTACION_FALLBACK

    const resultado = await adapter.generarOrientacion(input)
    return resultado || ORIENTACION_FALLBACK
  } catch (error) {
    console.error('[ia/index] Error en generarOrientacion:', error.message)
    return ORIENTACION_FALLBACK
  }
}
