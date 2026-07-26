/**
 * Interfaz comun de IA (Req 9: Independencia del Proveedor).
 *
 * Define el contrato que todo adaptador de IA debe cumplir.
 * La logica de negocio depende SOLO de esta interfaz, nunca
 * de un proveedor concreto (Anthropic, OpenAI, Google, etc.).
 *
 * Para agregar un nuevo proveedor:
 * 1. Crear un archivo adaptador (ej. openaiAdapter.js) que exporte
 *    las funciones clasificarPrioridad y generarOrientacion.
 * 2. Registrarlo en services/ia/index.js.
 * 3. Configurar AI_PROVIDER=openai en .env.
 */

/**
 * Valida que un adaptador implemente la interfaz requerida.
 * @param {object} adapter - Modulo adaptador a validar
 * @param {string} providerName - Nombre del proveedor (para mensajes de error)
 * @throws {Error} Si el adaptador no implementa las funciones requeridas
 */
export function validarAdapter(adapter, providerName) {
  const funcionesRequeridas = ['clasificarPrioridad', 'generarOrientacion'];

  for (const fn of funcionesRequeridas) {
    if (typeof adapter[fn] !== 'function') {
      throw new Error(
        `El adaptador "${providerName}" no implementa la funcion requerida: ${fn}`
      );
    }
  }
}
