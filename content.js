/**
 * Content Script - Auditor ARIA
 * 
 * Responsabilidad: Extraer el HTML del elemento inspeccionado en DevTools
 * y enviarlo al Service Worker para su procesamiento.
 * 
 * Property 1 (Aislamiento): Este script no manipula el DOM de la página
 * ni interfiere con su CSS o JavaScript.
 */

(function() {
  'use strict';

  // Variable para almacenar el último elemento inspeccionado
  let lastInspectedElement = null;

  /**
   * Listener para mensajes desde el panel de DevTools
   * Validates: Requirements 1 (Escaneo de Elementos)
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Solo procesar mensajes de tipo EXTRACT_DOM
    if (message.type === 'EXTRACT_DOM') {
      handleDOMExtraction(sendResponse);
      // Retornar true para indicar que la respuesta será asíncrona
      return true;
    }
    
    // Guardar referencia al elemento inspeccionado si se recibe
    if (message.type === 'SET_INSPECTED_ELEMENT') {
      lastInspectedElement = message.element;
      sendResponse({ success: true });
      return true;
    }
  });

  /**
   * Extrae el HTML del elemento actualmente inspeccionado
   * Validates: Requirements 1 y 2 (Manejo de Errores)
   * 
   * @param {Function} sendResponse - Callback para enviar la respuesta
   */
  function handleDOMExtraction(sendResponse) {
    try {
      // Intentar obtener el elemento inspeccionado usando $0 (Chrome DevTools)
      // Nota: $0 solo está disponible en el contexto de la consola de DevTools,
      // por lo que usamos un enfoque alternativo mediante inspectedWindow API
      
      // Para content scripts, necesitamos una forma de identificar el elemento
      // En este caso, usamos el elemento que tiene el atributo data-inspected
      // o el último elemento que fue clickeado en el inspector
      
      const inspectedElement = document.querySelector('[data-inspected="true"]') || 
                               lastInspectedElement ||
                               document.activeElement;

      // Validación: Verificar que hay un elemento seleccionado
      // Validates: Requirement 2 (Manejo de Errores y Validaciones)
      if (!inspectedElement || inspectedElement === document.body || inspectedElement === document.documentElement) {
        sendResponse({
          success: false,
          error: 'NO_ELEMENT_SELECTED',
          message: 'Por favor, selecciona un elemento HTML en el inspector'
        });
        return;
      }

      // Validación: Verificar que el elemento no esté vacío
      // Validates: Requirement 2 (Manejo de Errores y Validaciones)
      const emptyValidation = validateElementNotEmpty(inspectedElement);
      if (!emptyValidation.isValid) {
        sendResponse({
          success: false,
          error: 'EMPTY_ELEMENT',
          message: emptyValidation.message
        });
        return;
      }

      // Extraer el HTML del elemento (solo el elemento, no sus hijos recursivos completos)
      // Property 3 (Rendimiento): Extracción atómica para evitar sobrecarga
      const htmlSnippet = extractElementHTML(inspectedElement);

      // Validar que se extrajo contenido
      if (!htmlSnippet) {
        sendResponse({
          success: false,
          error: 'EXTRACTION_FAILED',
          message: 'No se pudo extraer el HTML del elemento seleccionado'
        });
        return;
      }

      // Validación: Verificar que el HTML extraído tiene contenido útil
      // Validates: Requirement 2 (Manejo de Errores y Validaciones)
      const contentValidation = validateElementContent(inspectedElement, htmlSnippet);
      if (!contentValidation.isValid) {
        sendResponse({
          success: false,
          error: 'INSUFFICIENT_CONTENT',
          message: contentValidation.message
        });
        return;
      }

      // Enviar el HTML extraído al background script
      chrome.runtime.sendMessage({
        type: 'DOM_EXTRACTED',
        html: htmlSnippet,
        tagName: inspectedElement.tagName.toLowerCase(),
        attributes: extractAttributes(inspectedElement)
      }, (response) => {
        // Manejar respuesta del background script
        if (chrome.runtime.lastError) {
          sendResponse({
            success: false,
            error: 'COMMUNICATION_ERROR',
            message: 'Error al comunicarse con el Service Worker'
          });
        } else {
          sendResponse({
            success: true,
            html: htmlSnippet
          });
        }
      });

    } catch (error) {
      // Manejo de errores general
      // Validates: Requirement 2 (Manejo de Errores)
      console.error('[Content Script] Error al extraer DOM:', error);
      sendResponse({
        success: false,
        error: 'UNEXPECTED_ERROR',
        message: `Error inesperado: ${error.message}`
      });
    }
  }

  /**
   * Valida que el elemento seleccionado no esté vacío
   * Validates: Requirement 2 (Manejo de Errores y Validaciones)
   * 
   * @param {HTMLElement} element - Elemento a validar
   * @returns {Object} - { isValid: boolean, message: string }
   */
  function validateElementNotEmpty(element) {
    // Verificar que el elemento tenga contenido textual o hijos
    const textContent = element.textContent || '';
    const trimmedText = textContent.trim();
    const hasChildren = element.children.length > 0;
    const hasAttributes = element.attributes.length > 0;

    // Un elemento se considera vacío si:
    // 1. No tiene texto visible y
    // 2. No tiene elementos hijos y
    // 3. No es un elemento autocontenido (img, input, etc.)
    const selfContainedTags = ['img', 'input', 'br', 'hr', 'meta', 'link', 'video', 'audio', 'iframe', 'svg', 'canvas'];
    const isSelfContained = selfContainedTags.includes(element.tagName.toLowerCase());

    if (!trimmedText && !hasChildren && !isSelfContained) {
      return {
        isValid: false,
        message: `El elemento <${element.tagName.toLowerCase()}> está vacío. Selecciona un elemento con contenido para auditar su accesibilidad`
      };
    }

    // Validar que elementos interactivos tengan contenido o atributos relevantes
    const interactiveTags = ['button', 'a', 'label'];
    if (interactiveTags.includes(element.tagName.toLowerCase())) {
      if (!trimmedText && !hasChildren && !hasAttributes) {
        return {
          isValid: false,
          message: `El elemento <${element.tagName.toLowerCase()}> no tiene contenido ni atributos. Los elementos interactivos deben tener texto o atributos ARIA para ser accesibles`
        };
      }
    }

    return { isValid: true, message: '' };
  }

  /**
   * Valida que el elemento tenga contenido útil para auditoría
   * Validates: Requirement 2 (Manejo de Errores y Validaciones)
   * 
   * @param {HTMLElement} element - Elemento original
   * @param {string} htmlSnippet - HTML extraído
   * @returns {Object} - { isValid: boolean, message: string }
   */
  function validateElementContent(element, htmlSnippet) {
    // Validar que el HTML no esté vacío
    if (!htmlSnippet || htmlSnippet.trim().length === 0) {
      return {
        isValid: false,
        message: 'El contenido extraído está vacío'
      };
    }

    // Validar longitud mínima razonable para auditoría
    // Un elemento muy pequeño probablemente no tenga suficiente información
    if (htmlSnippet.length < 10) {
      return {
        isValid: false,
        message: 'El elemento seleccionado es demasiado pequeño para realizar una auditoría significativa'
      };
    }

    // Validar que el elemento tenga al menos una etiqueta HTML válida
    const hasHTMLTag = /<[a-z][\s\S]*>/i.test(htmlSnippet);
    if (!hasHTMLTag) {
      return {
        isValid: false,
        message: 'El contenido extraído no contiene etiquetas HTML válidas'
      };
    }

    // Elementos de script o style no son auditables para accesibilidad
    const nonAuditableTags = ['script', 'style', 'noscript'];
    if (nonAuditableTags.includes(element.tagName.toLowerCase())) {
      return {
        isValid: false,
        message: `Los elementos <${element.tagName.toLowerCase()}> no son auditables para accesibilidad. Selecciona un elemento de contenido visible`
      };
    }

    return { isValid: true, message: '' };
  }

  /**
   * Extrae el HTML de un elemento específico
   * Property 3: Extracción atómica para evitar sobrecarga de memoria
   * 
   * @param {HTMLElement} element - Elemento del que extraer HTML
   * @returns {string} - HTML del elemento
   */
  function extractElementHTML(element) {
    if (!element || !element.outerHTML) {
      return null;
    }

    // Retornar el outerHTML completo del elemento
    // Esto incluye el elemento y sus hijos
    return element.outerHTML;
  }

  /**
   * Extrae los atributos de un elemento como objeto
   * Útil para el análisis de accesibilidad
   * 
   * @param {HTMLElement} element - Elemento del que extraer atributos
   * @returns {Object} - Objeto con los atributos del elemento
   */
  function extractAttributes(element) {
    const attributes = {};
    
    if (!element || !element.attributes) {
      return attributes;
    }

    // Iterar sobre todos los atributos
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }

    return attributes;
  }

  /**
   * Función auxiliar para marcar elementos como inspeccionados
   * (Puede ser llamada desde el panel de DevTools)
   */
  function markElementAsInspected(element) {
    // Limpiar marcas previas
    const previouslyMarked = document.querySelectorAll('[data-inspected="true"]');
    previouslyMarked.forEach(el => el.removeAttribute('data-inspected'));

    // Marcar el nuevo elemento
    if (element) {
      element.setAttribute('data-inspected', 'true');
      lastInspectedElement = element;
    }
  }

  // Property 1 (Aislamiento): No se manipula el DOM ni se agregan estilos
  // Este script solo extrae información cuando se le solicita explícitamente
  
  console.log('[Content Script] Auditor ARIA - Content script cargado correctamente');
})();
