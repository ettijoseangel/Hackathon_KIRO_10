/**
 * test-message-passing.js
 * Script de prueba para validar el message passing
 * 
 * INSTRUCCIONES DE USO:
 * 1. Cargar la extensión en chrome://extensions/ (modo desarrollador)
 * 2. Abrir DevTools en cualquier página
 * 3. Ir a la pestaña "Auditor ARIA"
 * 4. Abrir la consola de DevTools (F12)
 * 5. Copiar y pegar este código en la consola
 * 6. Ejecutar las funciones de prueba
 */

// TEST 1: Verificar que el background está activo
async function testBackgroundPing() {
  console.log('=== TEST 1: Ping al Service Worker ===');
  
  try {
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
    
    console.log('✓ Service Worker responde:', response);
    return true;
  } catch (error) {
    console.error('✗ Error al contactar Service Worker:', error);
    return false;
  }
}

// TEST 2: Verificar comunicación panel → background
async function testPanelToBackground() {
  console.log('=== TEST 2: Panel → Background ===');
  
  try {
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'START_AUDIT' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
    
    console.log('✓ Background respondió:', response);
    return response;
  } catch (error) {
    console.error('✗ Error en comunicación:', error);
    return false;
  }
}

// TEST 3: Verificar que el storage funciona
async function testStorage() {
  console.log('=== TEST 3: Chrome Storage ===');
  
  try {
    // Escribir
    await chrome.storage.local.set({ testKey: 'testValue', timestamp: Date.now() });
    console.log('✓ Escritura exitosa');
    
    // Leer
    const result = await chrome.storage.local.get(['testKey', 'timestamp']);
    console.log('✓ Lectura exitosa:', result);
    
    // Limpiar
    await chrome.storage.local.remove(['testKey', 'timestamp']);
    console.log('✓ Limpieza exitosa');
    
    return true;
  } catch (error) {
    console.error('✗ Error en storage:', error);
    return false;
  }
}

// TEST 4: Verificar estado de tareas persistidas
async function testTasksPersistence() {
  console.log('=== TEST 4: Persistencia de Tareas ===');
  
  try {
    const result = await chrome.storage.local.get(['auditTasks']);
    
    if (result.auditTasks) {
      console.log(`✓ Hay ${result.auditTasks.length} tarea(s) guardada(s):`, result.auditTasks);
    } else {
      console.log('✓ No hay tareas guardadas (storage vacío)');
    }
    
    return true;
  } catch (error) {
    console.error('✗ Error al leer tareas:', error);
    return false;
  }
}

// TEST 5: Simular ciclo completo de auditoría (con datos mock)
async function testFullAuditCycle() {
  console.log('=== TEST 5: Ciclo Completo de Auditoría (Mock) ===');
  
  try {
    // 1. Iniciar auditoría
    console.log('1. Enviando START_AUDIT...');
    const startResponse = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'START_AUDIT' }, resolve);
    });
    console.log('   Respuesta:', startResponse);
    
    // 2. Esperar resultado en storage (con timeout)
    console.log('2. Esperando resultado en storage...');
    let attempts = 0;
    let auditResult = null;
    
    while (attempts < 20 && !auditResult) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = await chrome.storage.local.get(['lastAuditResult']);
      
      if (result.lastAuditResult) {
        auditResult = result.lastAuditResult;
        await chrome.storage.local.remove(['lastAuditResult']);
      }
      
      attempts++;
      console.log(`   Intento ${attempts}/20...`);
    }
    
    if (auditResult) {
      console.log('✓ Resultado recibido:', auditResult);
      console.log(`   Errores encontrados: ${auditResult.errors?.length || 0}`);
      return auditResult;
    } else {
      console.log('✗ Timeout: No se recibió resultado');
      return false;
    }
    
  } catch (error) {
    console.error('✗ Error en ciclo completo:', error);
    return false;
  }
}

// TEST SUITE COMPLETO
async function runAllTests() {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║  AUDITOR ARIA - Test Suite Message Passing   ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');
  
  const results = {
    backgroundPing: await testBackgroundPing(),
    panelToBackground: await testPanelToBackground(),
    storage: await testStorage(),
    tasksPersistence: await testTasksPersistence()
  };
  
  console.log('');
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║              RESULTADOS FINALES               ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');
  
  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✓' : '✗';
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`${icon} ${test}: ${status}`);
  });
  
  const allPassed = Object.values(results).every(r => r);
  console.log('');
  console.log(allPassed 
    ? '✓✓✓ TODOS LOS TESTS PASARON ✓✓✓' 
    : '✗✗✗ ALGUNOS TESTS FALLARON ✗✗✗'
  );
  
  return results;
}

// Exponer funciones globalmente para uso desde consola
window.testBackgroundPing = testBackgroundPing;
window.testPanelToBackground = testPanelToBackground;
window.testStorage = testStorage;
window.testTasksPersistence = testTasksPersistence;
window.testFullAuditCycle = testFullAuditCycle;
window.runAllTests = runAllTests;

console.log('✓ Test suite cargado. Funciones disponibles:');
console.log('  - runAllTests()          → Ejecutar todos los tests');
console.log('  - testBackgroundPing()   → Test 1: Ping al Service Worker');
console.log('  - testPanelToBackground()→ Test 2: Panel → Background');
console.log('  - testStorage()          → Test 3: Chrome Storage');
console.log('  - testTasksPersistence() → Test 4: Persistencia de Tareas');
console.log('  - testFullAuditCycle()   → Test 5: Ciclo completo (Mock)');
console.log('');
console.log('Ejecuta runAllTests() para empezar.');
