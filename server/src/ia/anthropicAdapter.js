/**
 * Adaptador de IA: Anthropic (Claude).
 * Implementa la interfaz comun definida en iaInterface.js.
 * Req 9.3: aislado de la logica de negocio.
 */

const TIMEOUT_MS = 10_000;
const MODEL = 'claude-sonnet-4-20250514';
const PROMPT_VERSION = 'v1.0';

const PRIORIDADES_VALIDAS = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];

/**
 * Realiza una llamada a la API de Anthropic.
 * @param {string} prompt - Contenido del mensaje de usuario
 * @param {number} maxTokens - Tokens maximos de respuesta
 * @returns {Promise<string|null>} Texto de respuesta o null si falla
 */
async function llamarAnthropic(prompt, maxTokens = 1024) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('[anthropicAdapter] API status:', response.status);
      return null;
    }

    const data = await response.json();
    return data.content?.[0]?.text || null;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('[anthropicAdapter] Timeout: API no respondio en 10s');
    } else {
      console.error('[anthropicAdapter] Error:', error.message);
    }
    return null;
  }
}

/**
 * Extrae JSON de una respuesta que puede venir envuelta en markdown.
 * @param {string} texto - Texto de respuesta de la IA
 * @returns {object|null} JSON parseado o null
 */
function extraerJSON(texto) {
  try {
    const jsonMatch = texto.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

/**
 * Clasifica la prioridad de un reporte ciudadano.
 * @param {{titulo: string, descripcion: string, categoria: string}} input
 * @returns {Promise<{prioridad: string, justificacion: string|null, clasificadoPorIa: boolean}|null>}
 *   null indica que se debe usar fallback (la capa superior se encarga).
 */
export async function clasificarPrioridad({ titulo, descripcion, categoria }) {
  const prompt = `Eres un sistema de clasificacion de reportes ciudadanos para el municipio de Monterrey.
Analiza el siguiente reporte y asigna una prioridad.

Titulo: ${titulo}
Descripcion: ${descripcion || 'No proporcionada'}
Categoria: ${categoria}

Responde UNICAMENTE con un JSON valido con esta estructura exacta:
{
  "prioridad": "BAJA" | "MEDIA" | "ALTA" | "URGENTE",
  "justificacion": "explicacion breve de maximo 100 caracteres"
}

Criterios:
- URGENTE: peligro inmediato para la vida o salud publica (ej: fuga de gas, colapso estructural)
- ALTA: afecta servicios esenciales de multiples personas (ej: corte de agua en colonia)
- MEDIA: afecta comodidad pero no es critico (ej: bache, falta de alumbrado)
- BAJA: estetico o menor impacto (ej: pintura deteriorada, jardineria)`;

  const texto = await llamarAnthropic(prompt, 150);
  if (!texto) return null;

  const resultado = extraerJSON(texto);
  if (!resultado || !PRIORIDADES_VALIDAS.includes(resultado.prioridad)) {
    console.error('[anthropicAdapter] Prioridad invalida o JSON malformado');
    return null;
  }

  return {
    prioridad: resultado.prioridad,
    justificacion: resultado.justificacion || null,
    clasificadoPorIa: true,
  };
}

/**
 * Genera orientacion institucional para un reporte.
 * Sigue el schema de entrada de implementacionIA.md (seccion 5).
 * @param {{reporteId: string, descripcionQueja: string, categoria: string|null, ubicacion: object}} input
 * @returns {Promise<object|null>} Orientacion parseada o null para fallback
 */
export async function generarOrientacion({ reporteId, descripcionQueja, categoria, ubicacion }) {
  const prompt = `Eres un asistente de orientacion ciudadana para Mexico.
Tu tarea es analizar la siguiente queja/reporte y determinar:
1. Que institucion u organismo es competente para atenderla.
2. Los medios de contacto oficiales de esa institucion.
3. Los proximos pasos que el ciudadano debe seguir.

REPORTE:
- ID: ${reporteId}
- Descripcion: ${descripcionQueja}
- Categoria: ${categoria || 'No especificada (infierela de la descripcion)'}
- Ubicacion: ${ubicacion.ciudad || 'No especificada'}, ${ubicacion.provincia_estado || 'No especificada'}, ${ubicacion.pais || 'Mexico'}

INSTRUCCIONES:
- Si no puedes identificar la institucion con certeza, indica "requiere_mas_informacion": true y formula una pregunta aclaratoria.
- Los medios de contacto deben ser reales y verificables. Si no conoces los datos exactos, indica los canales genericos del tipo de institucion.
- El campo "confianza" debe ser un numero entre 0 y 1 indicando tu nivel de certeza.

Responde UNICAMENTE con un JSON valido con esta estructura:
{
  "resumen_queja": "string (resumen breve de la queja)",
  "categoria": "string (categoria inferida o confirmada)",
  "institucion": {
    "nombre": "string",
    "descripcion": "string (que hace esta institucion)",
    "sitio_web": "string o null",
    "confianza": 0.0
  },
  "medios_contacto": [
    { "tipo": "web|email|telefono|direccion_fisica|red_social|app_movil", "valor": "string", "horario_atencion": "string o null" }
  ],
  "proximos_pasos": [
    { "orden": 1, "titulo": "string", "descripcion": "string" }
  ],
  "requiere_mas_informacion": false,
  "pregunta_aclaratoria": null
}`;

  const texto = await llamarAnthropic(prompt, 1024);
  if (!texto) return null;

  const resultado = extraerJSON(texto);
  if (!resultado) {
    console.error('[anthropicAdapter] No se pudo extraer JSON de orientacion');
    return null;
  }

  // Mapear al formato interno del sistema
  return {
    institucionNombre: resultado.institucion?.nombre || null,
    institucionDescripcion: resultado.institucion?.descripcion || null,
    institucionSitioWeb: resultado.institucion?.sitio_web || null,
    confianza: resultado.institucion?.confianza ?? null,
    mediosContacto: resultado.medios_contacto || [],
    proximosPasos: resultado.proximos_pasos || [],
    requiereMasInformacion: resultado.requiere_mas_informacion || false,
    mensajeFallback: resultado.pregunta_aclaratoria || null,
    modeloIA: MODEL,
    promptVersion: PROMPT_VERSION,
  };
}
