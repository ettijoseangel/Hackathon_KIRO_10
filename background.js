/**
 * background.js - Service Worker (Manifest V3)
 * Auditor ARIA - Accesibilidad WCAG
 * 
 * Responsabilidad: Actuar como puente de comunicación entre:
 * 1. El panel de DevTools (panel.js) que solicita auditorías
 * 2. El content script (content.js) que extrae el DOM
 * 3. El backend de auditoría (API externa)
 * 
 * Validates: Requirements 1 (Escaneo de Elementos), 2 (Manejo de Errores)
 */

(function() {
  'use strict';

  console.log('[Background] Service Worker inicializado');

  /**
   * Listener principal para mensajes desde panel.js y content.js
   * Validates: Requirements 1 y 2
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Background] Mensaje recibido:', message.type, sender);

    // Manejar diferentes tipos de mensajes
    switch (message.type) {
      case 'START_AUDIT':
        handleStartAudit(message, sender, sendResponse);
        return true; // Indicar que la respuesta será asíncrona

      case 'DOM_EXTRACTED':
        handleDOMExtracted(message, sender, sendResponse);
        return true; // Indicar que la respuesta será asíncrona

      case 'PING':
        // Mensaje de health check
        sendResponse({ success: true, message: 'Service Worker activo' });
        return false;

      default:
        console.warn('[Background] Tipo de mensaje no reconocido:', message.type);
        sendResponse({ 
          success: false, 
          error: 'UNKNOWN_MESSAGE_TYPE',
          message: `Tipo de mensaje no soportado: ${message.type}` 
        });
        return false;
    }
  });

  /**
   * Manejar solicitud de auditoría desde el panel
   * Validates: Requirement 1 (Escaneo de Elementos)
   * 
   * @param {Object} message - Mensaje desde panel.js
   * @param {Object} sender - Información del remitente
   * @param {Function} sendResponse - Callback para responder
   */
  async function handleStartAudit(message, sender, sendResponse) {
    console.log('[Background] Iniciando auditoría...');

    try {
      // Paso 1: Obtener el tab activo de DevTools
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tabs || tabs.length === 0) {
        throw new Error('NO_ACTIVE_TAB: No hay ninguna pestaña activa');
      }

      const tabId = tabs[0].id;
      console.log('[Background] Tab activo:', tabId);

      // Paso 2: Enviar mensaje al content script para extraer el DOM
      console.log('[Background] Solicitando extracción de DOM al content script...');
      
      chrome.tabs.sendMessage(
        tabId,
        { type: 'EXTRACT_DOM' },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('[Background] Error al comunicarse con content script:', chrome.runtime.lastError);
            sendResponse({
              success: false,
              error: 'CONTENT_SCRIPT_ERROR',
              message: 'No se pudo comunicar con el content script. Asegúrate de recargar la página.'
            });
            return;
          }

          if (!response || !response.success) {
            console.error('[Background] Content script respondió con error:', response);
            sendResponse({
              success: false,
              error: response?.error || 'EXTRACTION_FAILED',
              message: response?.message || 'Error al extraer el DOM'
            });
            return;
          }

          // Paso 3: La extracción fue exitosa
          console.log('[Background] DOM extraído exitosamente');
          sendResponse({
            success: true,
            message: 'Extracción iniciada',
            html: response.html
          });
        }
      );

    } catch (error) {
      console.error('[Background] Error inesperado durante START_AUDIT:', error);
      sendResponse({
        success: false,
        error: 'UNEXPECTED_ERROR',
        message: `Error inesperado: ${error.message}`
      });
    }
  }

  /**
   * Manejar DOM extraído desde content script
   * Validates: Requirement 1 (Escaneo de Elementos) y 2 (Manejo de Errores)
   * 
   * @param {Object} message - Mensaje desde content.js con el HTML extraído
   * @param {Object} sender - Información del remitente
   * @param {Function} sendResponse - Callback para responder
   */
  async function handleDOMExtracted(message, sender, sendResponse) {
    console.log('[Background] Procesando DOM extraído...');

    try {
      const { html, tagName, attributes } = message;

      // Validación: Verificar que se recibió HTML
      if (!html || typeof html !== 'string') {
        throw new Error('HTML_MISSING: No se recibió HTML del content script');
      }

      console.log('[Background] HTML recibido:', html.substring(0, 100) + '...');
      console.log('[Background] Tag:', tagName);
      console.log('[Background] Atributos:', attributes);

      // Paso 1: Preparar payload para el backend
      const auditPayload = {
        html: html,
        tagName: tagName,
        attributes: attributes,
        timestamp: Date.now()
      };

      // Paso 2: Enviar al backend de auditoría
      console.log('[Background] Enviando al backend de auditoría...');
      const auditResult = await sendToBackend(auditPayload);

      // Paso 3: Enviar resultado al panel
      console.log('[Background] Auditoría completada, enviando resultado al panel...');
      
      // Notificar al panel con el resultado
      // Nota: Como el content script inició este flujo, necesitamos
      // notificar al panel de una forma diferente
      // Por ahora, guardamos en storage para que el panel lo consulte
      await chrome.storage.local.set({ lastAuditResult: auditResult });

      sendResponse({
        success: true,
        message: 'Auditoría completada',
        result: auditResult
      });

    } catch (error) {
      console.error('[Background] Error durante procesamiento de DOM:', error);
      
      // Validar si es un error de red/timeout
      // Validates: Requirement 2 (Manejo de Errores)
      const isNetworkError = error.message.includes('fetch') || 
                             error.message.includes('network') ||
                             error.message.includes('timeout');

      sendResponse({
        success: false,
        error: isNetworkError ? 'ERROR_TIMEOUT' : 'PROCESSING_ERROR',
        message: error.message
      });
    }
  }

  /**
   * Enviar HTML al backend de auditoría
   * Validates: Requirement 2 (Manejo de Errores - timeout y fallos de red)
   * 
   * @param {Object} payload - Datos a enviar al backend
   * @returns {Promise<Object>} - Resultado de la auditoría
   * @throws {Error} - Error específico según el tipo de fallo de red
   */
  async function sendToBackend(payload) {
    // URL del backend - se puede configurar mediante storage o variables de entorno
    const BACKEND_URL = 'https://api.auditor-aria.example.com/audit';
    const TIMEOUT_MS = 30000; // 30 segundos
    const USE_MOCK = true; // Flag para cambiar entre mock y backend real

    // Si está habilitado el modo mock, usar datos de prueba
    if (USE_MOCK) {
      console.log('[Background] NOTA: Usando datos mock. Cambiar USE_MOCK a false para usar backend real.');
      
      // Simular delay de red realista
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simular respuesta del backend
      const mockResponse = {
        id: `audit-${Date.now()}`,
        errors: [
          {
            type: 'missing-aria-label',
            severity: 'error',
            message: 'Botón sin atributo aria-label',
            htmlSnippet: payload.html,
            suggestion: payload.html.replace(/^<(\w+)/, '<$1 aria-label="Descripción del botón"'),
            wcagCriteria: '4.1.2 Name, Role, Value (Level A)'
          }
        ],
        timestamp: Date.now()
      };

      return mockResponse;
    }

    // Implementación real con manejo robusto de errores
    console.log('[Background] Enviando petición real al backend:', BACKEND_URL);

    // Configurar AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn('[Background] Timeout alcanzado, abortando petición...');
      controller.abort();
    }, TIMEOUT_MS);

    try {
      // Realizar petición con timeout
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      // Limpiar timeout si la petición se completó a tiempo
      clearTimeout(timeoutId);

      // Validar código de estado HTTP
      if (!response.ok) {
        // Diferenciar entre tipos de errores del servidor
        if (response.status >= 500) {
          // Error del servidor (5xx)
          throw new Error(`SERVER_ERROR: El servidor respondió con error ${response.status} - ${response.statusText}`);
        } else if (response.status === 404) {
          // Endpoint no encontrado
          throw new Error(`NOT_FOUND: El endpoint de auditoría no existe (404)`);
        } else if (response.status === 401 || response.status === 403) {
          // Error de autenticación/autorización
          throw new Error(`AUTH_ERROR: No autorizado para acceder al servicio de auditoría (${response.status})`);
        } else if (response.status === 400) {
          // Solicitud mal formada
          throw new Error(`BAD_REQUEST: El payload enviado es inválido (400)`);
        } else {
          // Otro error HTTP
          throw new Error(`HTTP_ERROR: El servidor respondió con error ${response.status} - ${response.statusText}`);
        }
      }

      // Intentar parsear la respuesta JSON
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error(`PARSE_ERROR: La respuesta del servidor no es JSON válido - ${parseError.message}`);
      }

      console.log('[Background] Auditoría recibida del backend exitosamente');
      return result;

    } catch (error) {
      // Limpiar timeout en caso de error
      clearTimeout(timeoutId);

      // Diferenciar entre tipos de errores de red
      
      // 1. Error de timeout (AbortError)
      if (error.name === 'AbortError') {
        console.error('[Background] Error de timeout:', error);
        throw new Error(`TIMEOUT: La solicitud al backend excedió el tiempo límite de ${TIMEOUT_MS / 1000} segundos. Verifica tu conexión a internet o intenta nuevamente.`);
      }

      // 2. Error de conexión (TypeError - sin conexión/DNS/CORS)
      if (error instanceof TypeError) {
        // Los errores de fetch suelen ser TypeError cuando no hay conexión
        console.error('[Background] Error de conexión:', error);
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error(`NO_CONNECTION: No se pudo conectar al servidor. Verifica tu conexión a internet o que el backend esté disponible.`);
        }
        
        // Podría ser un error CORS
        throw new Error(`NETWORK_ERROR: Error de red al intentar conectar con el backend - ${error.message}`);
      }

      // 3. Errores ya formateados desde las validaciones de response.ok
      if (error.message.startsWith('SERVER_ERROR:') || 
          error.message.startsWith('NOT_FOUND:') ||
          error.message.startsWith('AUTH_ERROR:') ||
          error.message.startsWith('BAD_REQUEST:') ||
          error.message.startsWith('HTTP_ERROR:') ||
          error.message.startsWith('PARSE_ERROR:')) {
        // Re-lanzar errores ya procesados
        throw error;
      }

      // 4. Error inesperado
      console.error('[Background] Error inesperado:', error);
      throw new Error(`UNEXPECTED_ERROR: Error inesperado al comunicarse con el backend - ${error.message}`);
    }
  }

  /**
   * Listener para cuando la extensión se instala o actualiza
   */
  chrome.runtime.onInstalled.addListener((details) => {
    console.log('[Background] Extensión instalada/actualizada:', details.reason);
    
    if (details.reason === 'install') {
      console.log('[Background] Primera instalación - Inicializando storage...');
      chrome.storage.local.set({ 
        auditTasks: [],
        installDate: Date.now()
      });
    }
  });

  /**
   * Listener para mantener el Service Worker activo
   * Manifest V3 Service Workers se desactivan después de 30 segundos de inactividad
   */
  chrome.runtime.onConnect.addListener((port) => {
    console.log('[Background] Puerto de conexión establecido:', port.name);
    
    port.onDisconnect.addListener(() => {
      console.log('[Background] Puerto de conexión cerrado:', port.name);
    });
  });

  console.log('[Background] Listeners configurados correctamente');

})();
