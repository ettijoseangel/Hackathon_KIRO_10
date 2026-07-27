/**
 * Servicio de Orientacion IA.
 * Orquesta la generacion de orientacion institucional para un reporte:
 * 1. Construye el input segun schema de implementacionIA.md (seccion 5).
 * 2. Llama al modulo de IA via la interfaz comun (Req 9).
 * 3. Persiste el resultado en la tabla orientacion_ia.
 *
 * Este servicio se invoca desde reporte.service.js al crear un reporte (Req 8.1).
 */
import * as iaProvider from '../ia/index.js'
import * as orientacionModel from '../models/orientacionIA.model.js'

/**
 * Genera y persiste la orientacion IA para un reporte recien creado.
 * No lanza excepciones — si falla, persiste el fallback (Req 8.5).
 *
 * @param {object} reporte - El reporte completo ya insertado en BD
 * @returns {Promise<object>} Registro de orientacion_ia creado
 */
export async function generarYPersistirOrientacion (reporte) {
  // 1. Construir input segun schema de entrada (implementacionIA.md seccion 5)
  const input = {
    reporteId: reporte.id,
    descripcionQueja: `${reporte.titulo}. ${reporte.descripcion || ''}`.trim(),
    categoria: reporte.categoria || null,
    ubicacion: {
      pais: 'Mexico',
      provincia_estado: 'Nuevo Leon',
      ciudad: reporte.municipio || 'Monterrey'
    }
  }

  // 2. Llamar al modulo de IA (con fallback automatico via ia/index.js)
  const resultado = await iaProvider.generarOrientacion(input)

  // 3. Persistir en BD
  const orientacion = await orientacionModel.crearOrientacion({
    reporteId: reporte.id,
    ...resultado
  })

  return orientacion
}

/**
 * Obtiene la orientacion IA ya guardada para un reporte.
 * No invoca a la IA — solo lectura de BD (Req 8.6).
 *
 * @param {string} reporteId - UUID del reporte
 * @returns {Promise<{exito: boolean, orientacion?: object, error?: string}>}
 */
export async function obtenerOrientacionPorReporte (reporteId) {
  // Validar UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!reporteId || !uuidRegex.test(reporteId)) {
    return { exito: false, error: 'El reporte_id debe ser un UUID valido' }
  }

  const orientacion = await orientacionModel.buscarPorReporteId(reporteId)

  if (!orientacion) {
    return { exito: false, error: `No se encontro orientacion IA para el reporte "${reporteId}"` }
  }

  // Formatear respuesta segun schema de salida (implementacionIA.md seccion 6)
  return {
    exito: true,
    orientacion: {
      reporte_id: orientacion.reporteId,
      resumen_queja: orientacion.institucionDescripcion ? `Reporte orientado a: ${orientacion.institucionNombre}` : null,
      categoria: null, // Se podria enriquecer con datos del reporte
      institucion: {
        nombre: orientacion.institucionNombre,
        descripcion: orientacion.institucionDescripcion,
        sitio_web: orientacion.institucionSitioWeb,
        confianza: orientacion.confianza ? Number(orientacion.confianza) : null
      },
      medios_contacto: orientacion.mediosContacto || [],
      pasos_siguientes: orientacion.proximosPasos || [],
      requiere_mas_informacion: orientacion.requiereMasInformacion,
      pregunta_aclaratoria: orientacion.mensajeFallback,
      timestamp: orientacion.createdAt.toISOString()
    }
  }
}
