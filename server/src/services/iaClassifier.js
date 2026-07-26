/**
 * Servicio de clasificacion de prioridad con IA.
 * Refactorizado para usar la arquitectura de adaptadores (Req 9).
 * Delega al modulo ia/index.js que aplica fallbacks automaticamente.
 */
import { clasificarPrioridad as clasificar } from '../ia/index.js';

/**
 * Clasifica la prioridad de un reporte ciudadano.
 * @param {{titulo: string, descripcion: string, categoria: string}} params
 * @returns {Promise<{prioridad: string, justificacion: string|null, clasificadoPorIa: boolean}>}
 */
export async function clasificarPrioridad(params) {
  return clasificar(params);
}
