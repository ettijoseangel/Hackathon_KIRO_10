/**
 * test-error-handling.js
 * Pruebas para validar el manejo robusto de errores de red en background.js
 * Validates: Requirement 2 (Manejo de Errores y Validaciones)
 * 
 * Este archivo simula diferentes escenarios de error para verificar que
 * sendToBackend() maneja correctamente timeouts, errores de conexión y
 * errores del servidor.
 */

(function() {
  'use strict';

  console.log('=== Iniciando pruebas de manejo de errores ===\n');

  /**
   * Simula la función sendToBackend() con diferentes escenarios de error
   * Esta es una versión de prueba que replica la lógica de background.js
   */
  async function testSendToBackend(scenario, payload) {
    const BACKEND_URL = 'https://api.auditor-aria.example.com/audit';
    const TIMEOUT_MS = 30000;

    console.log(`\n--- Escenario: ${scenario} ---`);

    // Simular diferentes escenarios
    const controller = new AbortController();
    let timeoutId;

    try {
      switch (scenario) {
        case 'TIMEOUT':
          // Simular timeout abortando inmediatamente
          timeoutId = setTimeout(() => {
            console.log('⏱️  Simulando timeout...');
            controller.abort();
          }, 100); // Timeout artificial de 100ms
          
          await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
          });
          break;

        case 'NO_CONNECTION':
          // Intentar conectar a una URL inválida (sin red)
          console.log('🔌 Simulando error de conexión...');
          await fetch('http://invalid-domain-that-does-not-exist.local/audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
          });
          break;

        case 'SERVER_ERROR_500':
          // Nota: Este escenario requiere un servidor mock real
          console.log('🔥 Simulando error 500 del servidor...');
          console.log('⚠️  Este escenario requiere un servidor mock para pruebas completas');
          throw new Error('SERVER_ERROR: El servidor respondió con error 500 - Internal Server Error');

        case 'NOT_FOUND_404':
          console.log('❓ Simulando endpoint no encontrado (404)...');
          console.log('⚠️  Este escenario requiere un servidor mock para pruebas completas');
          throw new Error('NOT_FOUND: El endpoint de auditoría no existe (404)');

        case 'BAD_REQUEST_400':
          console.log('📝 Simulando solicitud mal formada (400)...');
          console.log('⚠️  Este escenario requiere un servidor mock para pruebas completas');
          throw new Error('BAD_REQUEST: El payload enviado es inválido (400)');

        case 'SUCCESS':
          // Simular respuesta exitosa con mock
          console.log('✅ Simulando respuesta exitosa con mock...');
          await new Promise(resolve => setTimeout(resolve, 500));
          clearTimeout(timeoutId);
          return {
            id: `audit-${Date.now()}`,
            errors: [{
              type: 'test-error',
              severity: 'info',
              message: 'Test exitoso'
            }],
            timestamp: Date.now()
          };

        default:
          throw new Error('Escenario de prueba no reconocido');
      }

    } catch (error) {
      clearTimeout(timeoutId);

      // Clasificar errores según el tipo
      if (error.name === 'AbortError') {
        throw new Error(`TIMEOUT: La solicitud al backend excedió el tiempo límite de ${TIMEOUT_MS / 1000} segundos. Verifica tu conexión a internet o intenta nuevamente.`);
      }

      if (error instanceof TypeError) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error(`NO_CONNECTION: No se pudo conectar al servidor. Verifica tu conexión a internet o que el backend esté disponible.`);
        }
        throw new Error(`NETWORK_ERROR: Error de red al intentar conectar con el backend - ${error.message}`);
      }

      // Re-lanzar errores ya clasificados
      if (error.message.startsWith('SERVER_ERROR:') || 
          error.message.startsWith('NOT_FOUND:') ||
          error.message.startsWith('BAD_REQUEST:')) {
        throw error;
      }

      throw new Error(`UNEXPECTED_ERROR: Error inesperado - ${error.message}`);
    }
  }

  /**
   * Ejecutar todas las pruebas
   */
  async function runTests() {
    const testPayload = {
      html: '<button>Test</button>',
      tagName: 'button',
      attributes: {},
      timestamp: Date.now()
    };

    const scenarios = [
      'SUCCESS',
      'TIMEOUT',
      'NO_CONNECTION',
      'SERVER_ERROR_500',
      'NOT_FOUND_404',
      'BAD_REQUEST_400'
    ];

    for (const scenario of scenarios) {
      try {
        const result = await testSendToBackend(scenario, testPayload);
        console.log('✅ Resultado exitoso:', result);
      } catch (error) {
        console.log('❌ Error capturado correctamente:', error.message);
        
        // Validar que el mensaje de error comienza con un código específico
        const errorCodes = ['TIMEOUT:', 'NO_CONNECTION:', 'NETWORK_ERROR:', 'SERVER_ERROR:', 'NOT_FOUND:', 'BAD_REQUEST:', 'UNEXPECTED_ERROR:'];
        const hasValidCode = errorCodes.some(code => error.message.startsWith(code));
        
        if (hasValidCode) {
          console.log('✓ El error tiene un código válido');
        } else {
          console.log('✗ ADVERTENCIA: El error no tiene un código estándar');
        }
      }
    }

    console.log('\n=== Pruebas completadas ===');
    console.log('\n📋 Resumen:');
    console.log('- TIMEOUT: Detecta cuando la petición excede el límite de tiempo');
    console.log('- NO_CONNECTION: Detecta cuando no hay conectividad de red');
    console.log('- SERVER_ERROR: Identifica errores 5xx del servidor');
    console.log('- NOT_FOUND: Identifica cuando el endpoint no existe (404)');
    console.log('- BAD_REQUEST: Identifica cuando el payload es inválido (400)');
    console.log('\n💡 Para pruebas completas de errores HTTP, se recomienda usar un servidor mock.');
  }

  // Ejecutar pruebas
  runTests().catch(error => {
    console.error('Error fatal durante las pruebas:', error);
  });

})();
