/**
 * test-loading-states.js
 * Script de prueba manual para validar el sistema de estados de carga granulares
 * 
 * INSTRUCCIONES DE USO:
 * 1. Cargar la extensión en Chrome (chrome://extensions)
 * 2. Abrir DevTools en cualquier página
 * 3. Ir a la pestaña "Auditor ARIA"
 * 4. Abrir la consola del panel (click derecho → Inspeccionar)
 * 5. Copiar y pegar este script en la consola
 * 6. Ejecutar los tests
 */

console.log('=== TEST: Sistema de Estados de Carga Granulares ===\n');

/**
 * Test 1: Verificar que las funciones de loading existen
 */
function test1_FuncionesExisten() {
  console.log('Test 1: Verificar funciones de loading...');
  
  if (typeof showLoading !== 'function') {
    console.error('❌ FALLO: showLoading() no existe');
    return false;
  }
  
  if (typeof hideLoading !== 'function') {
    console.error('❌ FALLO: hideLoading() no existe');
    return false;
  }
  
  console.log('✅ ÉXITO: Funciones showLoading() y hideLoading() existen\n');
  return true;
}

/**
 * Test 2: Verificar elementos del DOM
 */
function test2_ElementosDOM() {
  console.log('Test 2: Verificar elementos del DOM...');
  
  const loadingState = document.getElementById('loading-state');
  const loadingMessage = document.getElementById('loading-message');
  
  if (!loadingState) {
    console.error('❌ FALLO: Elemento #loading-state no existe');
    return false;
  }
  
  if (!loadingMessage) {
    console.error('❌ FALLO: Elemento #loading-message no existe');
    return false;
  }
  
  console.log('✅ ÉXITO: Elementos del DOM existen\n');
  return true;
}

/**
 * Test 3: Verificar que showLoading() muestra el spinner
 */
function test3_MostrarSpinner() {
  console.log('Test 3: Verificar showLoading()...');
  
  const loadingState = document.getElementById('loading-state');
  const loadingMessage = document.getElementById('loading-message');
  
  // Estado inicial debe estar oculto
  if (!loadingState.classList.contains('hidden')) {
    console.warn('⚠️ ADVERTENCIA: El spinner ya estaba visible');
  }
  
  // Llamar showLoading con mensaje de prueba
  showLoading('Test: Estado de prueba');
  
  // Verificar que se muestra
  if (loadingState.classList.contains('hidden')) {
    console.error('❌ FALLO: showLoading() no quitó la clase "hidden"');
    return false;
  }
  
  // Verificar que el mensaje se actualizó
  if (loadingMessage.textContent !== 'Test: Estado de prueba') {
    console.error('❌ FALLO: El mensaje no se actualizó correctamente');
    console.error(`   Esperado: "Test: Estado de prueba"`);
    console.error(`   Recibido: "${loadingMessage.textContent}"`);
    return false;
  }
  
  console.log('✅ ÉXITO: showLoading() funciona correctamente\n');
  return true;
}

/**
 * Test 4: Verificar que hideLoading() oculta el spinner
 */
function test4_OcultarSpinner() {
  console.log('Test 4: Verificar hideLoading()...');
  
  const loadingState = document.getElementById('loading-state');
  
  // Asegurar que está visible primero
  showLoading('Test: Preparando para ocultar');
  
  if (loadingState.classList.contains('hidden')) {
    console.error('❌ FALLO: El spinner no estaba visible antes de hideLoading()');
    return false;
  }
  
  // Llamar hideLoading
  hideLoading();
  
  // Verificar que se oculta
  if (!loadingState.classList.contains('hidden')) {
    console.error('❌ FALLO: hideLoading() no añadió la clase "hidden"');
    return false;
  }
  
  console.log('✅ ÉXITO: hideLoading() funciona correctamente\n');
  return true;
}

/**
 * Test 5: Simular el flujo completo de estados
 */
async function test5_FlujoCompleto() {
  console.log('Test 5: Simular flujo completo de estados...');
  
  const estados = [
    'Extrayendo DOM...',
    'Esperando auditoría...',
    'Procesando 3 resultado(s)...'
  ];
  
  console.log('Iniciando simulación de flujo de auditoría:\n');
  
  for (const estado of estados) {
    console.log(`  → ${estado}`);
    showLoading(estado);
    
    // Verificar que el mensaje se actualizó
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage.textContent !== estado) {
      console.error(`❌ FALLO: El mensaje no se actualizó a "${estado}"`);
      return false;
    }
    
    // Esperar 1 segundo para visualizar
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n  → Limpiando estado...');
  hideLoading();
  
  // Verificar que se ocultó
  const loadingState = document.getElementById('loading-state');
  if (!loadingState.classList.contains('hidden')) {
    console.error('❌ FALLO: El estado no se limpió correctamente');
    return false;
  }
  
  console.log('✅ ÉXITO: Flujo completo funciona correctamente\n');
  return true;
}

/**
 * Test 6: Verificar spinner animado
 */
function test6_SpinnerAnimado() {
  console.log('Test 6: Verificar spinner animado...');
  
  const spinner = document.querySelector('#loading-state svg.animate-spin');
  
  if (!spinner) {
    console.error('❌ FALLO: No se encontró el spinner animado');
    return false;
  }
  
  // Verificar que tiene la clase de animación de Tailwind
  if (!spinner.classList.contains('animate-spin')) {
    console.error('❌ FALLO: El spinner no tiene la clase "animate-spin"');
    return false;
  }
  
  console.log('✅ ÉXITO: Spinner animado existe y tiene animación\n');
  return true;
}

/**
 * Ejecutar todos los tests
 */
async function ejecutarTodos() {
  console.log('='.repeat(60));
  console.log('INICIANDO SUITE DE TESTS DE ESTADOS DE CARGA');
  console.log('='.repeat(60) + '\n');
  
  const resultados = {
    pasados: 0,
    fallados: 0,
    total: 0
  };
  
  // Tests síncronos
  const testsSincronos = [
    { nombre: 'Test 1: Funciones existen', fn: test1_FuncionesExisten },
    { nombre: 'Test 2: Elementos DOM', fn: test2_ElementosDOM },
    { nombre: 'Test 3: Mostrar spinner', fn: test3_MostrarSpinner },
    { nombre: 'Test 4: Ocultar spinner', fn: test4_OcultarSpinner },
    { nombre: 'Test 6: Spinner animado', fn: test6_SpinnerAnimado }
  ];
  
  for (const test of testsSincronos) {
    resultados.total++;
    const exito = test.fn();
    if (exito) {
      resultados.pasados++;
    } else {
      resultados.fallados++;
    }
  }
  
  // Test asíncrono (flujo completo)
  resultados.total++;
  const exito = await test5_FlujoCompleto();
  if (exito) {
    resultados.pasados++;
  } else {
    resultados.fallados++;
  }
  
  // Resumen
  console.log('='.repeat(60));
  console.log('RESUMEN DE RESULTADOS');
  console.log('='.repeat(60));
  console.log(`Total de tests: ${resultados.total}`);
  console.log(`✅ Pasados: ${resultados.pasados}`);
  console.log(`❌ Fallados: ${resultados.fallados}`);
  console.log(`Tasa de éxito: ${((resultados.pasados / resultados.total) * 100).toFixed(1)}%`);
  console.log('='.repeat(60) + '\n');
  
  if (resultados.fallados === 0) {
    console.log('🎉 ¡TODOS LOS TESTS PASARON! El sistema de estados de carga funciona correctamente.');
  } else {
    console.log('⚠️ Algunos tests fallaron. Revisar los errores arriba.');
  }
}

// Ejecutar automáticamente
ejecutarTodos();
