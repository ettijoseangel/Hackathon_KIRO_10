/**
 * Servicio de clasificacion de prioridad con IA (Anthropic/Claude).
 * Comportamiento segun Req 3 de requirements.md:
 * - Si ANTHROPIC_API_KEY no existe -> fallback inmediato.
 * - Timeout de 10 segundos.
 * - Si falla por cualquier razon -> fallback (prioridad MEDIA, clasificado_por_ia: false).
 */

const TIMEOUT_MS = 10_000;

const FALLBACK_RESPONSE = {
  prioridad: 'MEDIA',
  justificacion: null,
  clasificadoPorIa: false,
};

const PRIORIDADES_VALIDAS = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];

/**
 * Construye el prompt para Claude.
 * @param {object} params
 * @param {string} params.titulo
 * @param {string} params.descripcion
 * @param {string} params.categoria
 * @returns {string}
 */
function construirPrompt({ titulo, descripcion, categoria }) {
  return `Eres un sistema de clasificacion de reportes ciudadanos para el municipio de Monterrey.
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
}

/**
 * Llama a la API de Anthropic para clasificar la prioridad.
 * @param {object} params - { titulo, descripcion, categoria }
 * @returns {Promise<{ prioridad: string, justificacion: string|null, clasificadoPorIa: boolean }>}
 */
export async function clasificarPrioridad({ titulo, descripcion, categoria }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Req 3.6: Si no hay API key, fallback directo
  if (!apiKey) {
    return FALLBACK_RESPONSE;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: construirPrompt({ titulo, descripcion, categoria }),
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('[iaClassifier] API respondio con status:', response.status);
      return FALLBACK_RESPONSE;
    }

    const data = await response.json();
    const textoRespuesta = data.content?.[0]?.text;

    if (!textoRespuesta) {
      console.error('[iaClassifier] Respuesta sin contenido de texto');
      return FALLBACK_RESPONSE;
    }

    // Extraer JSON de la respuesta (puede venir envuelto en markdown)
    const jsonMatch = textoRespuesta.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[iaClassifier] No se encontro JSON en la respuesta');
      return FALLBACK_RESPONSE;
    }

    const resultado = JSON.parse(jsonMatch[0]);

    // Validar que la prioridad sea un valor valido del enum
    if (!PRIORIDADES_VALIDAS.includes(resultado.prioridad)) {
      console.error('[iaClassifier] Prioridad invalida:', resultado.prioridad);
      return FALLBACK_RESPONSE;
    }

    return {
      prioridad: resultado.prioridad,
      justificacion: resultado.justificacion || null,
      clasificadoPorIa: true,
    };
  } catch (error) {
    // Req 3.3 y 3.4: Cualquier error -> fallback sin interrumpir
    if (error.name === 'AbortError') {
      console.error('[iaClassifier] Timeout: la API no respondio en 10s');
    } else {
      console.error('[iaClassifier] Error inesperado:', error.message);
    }
    return FALLBACK_RESPONSE;
  }
}
