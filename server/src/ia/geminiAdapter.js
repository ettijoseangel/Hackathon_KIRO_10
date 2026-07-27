
/**
 * Adaptador de IA: Google Gemini.
 * Implementa la interfaz comun definida en iaInterface.js.
 * Req 9.3: aislado de la logica de negocio.
 *
 * Variable de entorno requerida: GEMINI_API_KEY
 * Modelo por defecto: gemini-2.0-flash
 */
 
const TIMEOUT_MS = 30000
const MODEL = 'gemini-flash-latest'
const PROMPT_VERSION = 'v1.0'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const MAX_REINTENTOS = 2
const BACKOFF_BASE_MS = 1000
const PRIORIDADES_VALIDAS = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE']
 
function esperar (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
 
/**
 * Detecta si un 429 es una cuota estructuralmente en cero (proyecto sin
 * billing vinculado) en vez de un rate limit normal por RPM/RPD.
 * En ese caso reintentar es inutil: el limite nunca va a subir solo,
 * asi que hay que ir directo al fallback en vez de hacer esperar al
 * usuario ~55s en reintentos que van a fallar igual.
 * @param {string|null} cuerpoError - Body crudo de la respuesta 429
 * @returns {boolean}
 */
function esCuotaCero (cuerpoError) {
  if (!cuerpoError) return false
  // El body incluye lineas tipo "limit: 0, model: gemini-2.0-flash" por
  // cada metrica violada cuando el proyecto no tiene billing vinculado.
  return /limit:\s*0\b/.test(cuerpoError)
}
 
/**
 * Realiza una llamada a la API de Google Gemini, con reintentos ante
 * errores transitorios (429 / 5xx).
 * @param {string} prompt - Contenido del mensaje
 * @param {number} maxTokens - Tokens maximos de respuesta
 * @returns {Promise<string|null>} Texto de respuesta o null si falla
 */
async function llamarGemini (prompt, maxTokens = 4096 ) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('[geminiAdapter] GEMINI_API_KEY no esta definida')
    return null
  }
 
  // El for envuelve TODA la llamada (fetch, timeout, manejo de respuesta),
  // no solo el bloque del 429 - por eso "intento" existe en todo el cuerpo.
  for (let intento = 0; intento <= MAX_REINTENTOS; intento++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
 
    try {
      const url = `${API_BASE}/${MODEL}:generateContent?key=${apiKey}`
      console.log(JSON.stringify({
        model: MODEL,
        maxTokens,
        promptLength: prompt.length
      }, null, 2));
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: 0.2,
            responseMimeType: "application/json",
          }
        }),
        signal: controller.signal
      })
      console.log(await response.clone().text());
 
      clearTimeout(timeoutId)
 
      if (response.status === 429 || response.status >= 500) {
        const cuerpoError = await response.text().catch(() => null)
        console.error(`[geminiAdapter] Status ${response.status} (intento ${intento + 1}/${MAX_REINTENTOS + 1}):`, cuerpoError)
 
        if (response.status === 429 && esCuotaCero(cuerpoError)) {
          console.error('[geminiAdapter] Cuota estructuralmente en 0 (falta vincular billing en el proyecto de Google Cloud) - se omiten reintentos, se va directo a fallback')
          return null
        }
 
        if (intento < MAX_REINTENTOS) {
          await esperar(BACKOFF_BASE_MS * 2 ** intento)
          continue // vuelve al inicio del for, NO retorna
        }
        return null
      }
 
      if (!response.ok) {
        const cuerpoError = await response.text().catch(() => null)
        console.error('[geminiAdapter] API status:', response.status, cuerpoError)

        return null
      }

 
      const data = await response.json()
      console.log(JSON.stringify(data, null, 2));

      const candidate = data.candidates?.[0];

      console.log({
        finishReason: candidate?.finishReason,
        finishMessage: candidate?.finishMessage,
        safetyRatings: candidate?.safetyRatings,
        usageMetadata: data.usageMetadata
      });
      console.log(JSON.stringify(data, null, 2));
      const texto = data.candidates?.[0]?.content?.parts?.[0]?.text
      console.log('===== RESPUESTA GEMINI =====')
      console.log(texto)
      console.log('===========================')
      return texto || null
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        console.error('[geminiAdapter] Timeout: API no respondio en 10s')
        return null
      }
      console.error('[geminiAdapter] Error:', error.message)
      if (intento < MAX_REINTENTOS) {
        await esperar(BACKOFF_BASE_MS * 2 ** intento)
        continue
      }
      return null
    }
  }
 
  return null
}
 
/**
 * Extrae JSON de una respuesta que puede venir envuelta en markdown.
 * @param {string} texto - Texto de respuesta de la IA
 * @returns {object|null} JSON parseado o null
 */
function extraerJSON(texto) {
    if (!texto) return null;

    try {
        return JSON.parse(texto.trim());
    } catch {}

    try {
        const inicio = texto.indexOf('{');
        const fin = texto.lastIndexOf('}');

        if (inicio === -1 || fin === -1) {
            return null;
        }

        return JSON.parse(texto.slice(inicio, fin + 1));
    } catch (e) {
        console.error(e);
        return null;
    }
}
 
/**
 * Clasifica la prioridad de un reporte ciudadano.
 * @param {{titulo: string, descripcion: string, categoria: string}} input
 * @returns {Promise<{prioridad: string, justificacion: string|null, clasificadoPorIa: boolean}|null>}
 */
export async function clasificarPrioridad ({ titulo, descripcion, categoria }) {
  console.log(`titulo: ${titulo}`)
  console.log(`descripcion: ${descripcion}`)
  console.log(`categoria: ${categoria}`)
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
- BAJA: estetico o menor impacto (ej: pintura deteriorada, jardineria)`
 
  const texto = await llamarGemini(prompt, 150)
  console.log(`texto de llamarGemini: ${texto}`)
  if (!texto) return null
 
  const resultado = extraerJSON(texto)
  if (!resultado || !PRIORIDADES_VALIDAS.includes(resultado.prioridad)) {
    console.error('[geminiAdapter] Prioridad invalida o JSON malformado')
    return null
  }
 
  return {
    prioridad: resultado.prioridad,
    justificacion: resultado.justificacion || null,
    clasificadoPorIa: true
  }
}
 
/**
 * Genera orientacion institucional para un reporte.
 * Sigue el schema de entrada de implementacionIA.md (seccion 5).
 * @param {{reporteId: string, descripcionQueja: string, categoria: string|null, ubicacion: object}} input
 * @returns {Promise<object|null>} Orientacion parseada o null para fallback
 */
export async function generarOrientacion ({ reporteId, descripcionQueja, categoria, ubicacion }) {
  console.log(`descripconde la Queja: ${descripcionQueja}`)
  console.log(`ubicacion: ${ubicacion}`)
  console.log(`categoria: ${categoria}`)
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
 IMPORTANTE:

- Devuelve exclusivamente un objeto JSON.
- No escribas explicaciones.
- No uses Markdown.
- No agregues texto antes ni después.
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
}`
 

  const texto = await llamarGemini(prompt, 4096)
  console.log(`texto de llamarGemini: ${texto}`)

  if (!texto) return null
 
  const resultado = extraerJSON(texto)
  if (!resultado) {
    console.error('[geminiAdapter] No se pudo extraer JSON de orientacion')
    return null
  }
 
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
    promptVersion: PROMPT_VERSION
  }
}