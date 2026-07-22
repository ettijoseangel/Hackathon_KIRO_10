/**
 * panel.js
 * Controlador principal de la UI del panel de Auditor ARIA
 * Gestiona la Task List UI y el almacenamiento persistente con chrome.storage.local
 * Cumple con Requirement 4 (Contexto Persistente) y Requirement 5 (Interacción Task List UI)
 */

// Referencias a elementos del DOM
const auditBtn = document.getElementById('audit-btn');
const loadingState = document.getElementById('loading-state');
const loadingMessage = document.getElementById('loading-message');
const alertContainer = document.getElementById('alert-container');
const alertMessage = document.getElementById('alert-message');
const alertClose = document.getElementById('alert-close');
const successContainer = document.getElementById('success-container');
const successMessage = document.getElementById('success-message');
const successClose = document.getElementById('success-close');
const emptyState = document.getElementById('empty-state');
const tasksContainer = document.getElementById('tasks-container');
const statTotal = document.getElementById('stat-total');
const statPending = document.getElementById('stat-pending');
const statResolved = document.getElementById('stat-resolved');

// Estado global de las tareas
let tasks = [];

/**
 * Inicialización del panel al cargar
 * Validates: Requirements 4 (Contexto Persistente)
 */
async function initializePanel() {
  console.log('Inicializando panel de Auditor ARIA...');
  
  // Restaurar tareas desde chrome.storage.local
  try {
    const result = await chrome.storage.local.get(['auditTasks']);
    if (result.auditTasks && Array.isArray(result.auditTasks)) {
      tasks = result.auditTasks;
      console.log(`${tasks.length} tareas restauradas desde storage`);
      renderTasks();
    } else {
      console.log('No hay tareas previas en storage');
    }
  } catch (error) {
    console.error('Error al restaurar tareas desde storage:', error);
    showAlert('Error al cargar las tareas previas. Iniciando sesión nueva.');
  }
}

/**
 * Guardar tareas en chrome.storage.local
 * Validates: Requirements 4 (Contexto Persistente)
 */
async function saveTasks() {
  try {
    await chrome.storage.local.set({ auditTasks: tasks });
    console.log('Tareas guardadas en storage');
  } catch (error) {
    console.error('Error al guardar tareas:', error);
    showAlert('Error al guardar el estado de las tareas');
  }
}

/**
 * Mostrar estado de carga con mensaje personalizado
 * Implementa estados de carga granulares para mejorar la experiencia de usuario
 * durante el proceso de auditoría.
 * 
 * Estados disponibles:
 * - "Extrayendo DOM..." - Cuando se está comunicando con el content script
 * - "Esperando auditoría..." - Cuando se está esperando respuesta del backend
 * - "Procesando N resultado(s)..." - Cuando se están procesando y guardando resultados
 * 
 * Validates: Requirements 3 (Ciclo de Vida y Hooks - Estados de carga granulares)
 * 
 * @param {string} message - Mensaje descriptivo del estado actual
 */
function showLoading(message) {
  loadingMessage.textContent = message;
  loadingState.classList.remove('hidden');
  console.log(`[Panel] Estado de carga: ${message}`);
}

/**
 * Ocultar estado de carga
 * Se llama en el bloque finally para garantizar limpieza en todos los escenarios
 * (éxito, error, timeout)
 * 
 * Validates: Requirements 3 (Limpieza correcta de estados)
 */
function hideLoading() {
  loadingState.classList.add('hidden');
  console.log('[Panel] Estado de carga ocultado');
}

/**
 * Mostrar alerta de error
 * Validates: Requirements 2 (Manejo de Errores)
 */
function showAlert(message) {
  alertMessage.textContent = message;
  alertContainer.classList.remove('hidden');
}

/**
 * Ocultar alerta de error
 */
function hideAlert() {
  alertContainer.classList.add('hidden');
}

/**
 * Mostrar notificación de éxito
 * @param {string} message - Mensaje de éxito
 */
function showSuccess(message) {
  successMessage.textContent = message;
  successContainer.classList.remove('hidden');
  
  // Auto-ocultar después de 3 segundos
  setTimeout(() => {
    hideSuccess();
  }, 3000);
}

/**
 * Ocultar notificación de éxito
 */
function hideSuccess() {
  successContainer.classList.add('hidden');
}

/**
 * Actualizar estadísticas del panel
 */
function updateStats() {
  const total = tasks.length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const resolved = tasks.filter(t => t.status === 'resolved').length;
  
  statTotal.textContent = total;
  statPending.textContent = pending;
  statResolved.textContent = resolved;
}

/**
 * Renderizar todas las tareas en la UI
 * Validates: Requirements 5 (Interacción Task List UI)
 */
function renderTasks() {
  // Limpiar contenedor
  tasksContainer.innerHTML = '';
  
  // Mostrar/ocultar estado vacío
  if (tasks.length === 0) {
    emptyState.classList.remove('hidden');
    tasksContainer.classList.add('hidden');
  } else {
    emptyState.classList.add('hidden');
    tasksContainer.classList.remove('hidden');
    
    // Renderizar cada tarea
    tasks.forEach(task => {
      const taskElement = createTaskElement(task);
      tasksContainer.appendChild(taskElement);
    });
  }
  
  // Actualizar estadísticas
  updateStats();
}

/**
 * Crear elemento HTML para una tarea individual
 * @param {Object} task - TaskItem { id, error, htmlSnippet, suggestion, status }
 * @returns {HTMLElement}
 */
function createTaskElement(task) {
  const taskDiv = document.createElement('div');
  taskDiv.className = `border rounded-lg p-4 transition-all duration-200 ${
    task.status === 'resolved' 
      ? 'bg-green-50 border-green-200 opacity-75' 
      : 'bg-white border-gray-200'
  }`;
  taskDiv.dataset.taskId = task.id;
  
  taskDiv.innerHTML = `
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            task.status === 'resolved' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }">
            ${task.status === 'resolved' ? '✓ Resuelto' : '✗ Pendiente'}
          </span>
        </div>
        <h3 class="text-sm font-semibold text-gray-900 mb-1">Error de Accesibilidad</h3>
        <p class="text-sm text-gray-700">${escapeHtml(task.error)}</p>
      </div>
    </div>
    
    <div class="mb-3">
      <h4 class="text-xs font-semibold text-gray-600 uppercase mb-1">Fragmento HTML:</h4>
      <pre class="bg-gray-100 rounded p-2 text-xs overflow-x-auto"><code>${escapeHtml(task.htmlSnippet)}</code></pre>
    </div>
    
    <div class="mb-4">
      <h4 class="text-xs font-semibold text-gray-600 uppercase mb-1">Sugerencia de Corrección:</h4>
      <pre class="bg-blue-50 rounded p-2 text-xs overflow-x-auto"><code>${escapeHtml(task.suggestion)}</code></pre>
    </div>
    
    <div class="flex gap-2">
      ${task.status === 'pending' ? `
        <button 
          class="accept-btn flex-1 bg-aria-success hover:bg-green-600 text-white text-sm font-medium py-2 px-4 rounded transition duration-200"
          data-task-id="${task.id}">
          Aceptar corrección
        </button>
      ` : `
        <button 
          class="unresolve-btn flex-1 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded transition duration-200"
          data-task-id="${task.id}">
          Marcar como pendiente
        </button>
      `}
      <button 
        class="delete-btn bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded transition duration-200"
        data-task-id="${task.id}">
        Eliminar
      </button>
    </div>
  `;
  
  return taskDiv;
}

/**
 * Escapar HTML para prevenir XSS
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Marcar tarea como resuelta
 * Validates: Requirements 5 (Interacción Task List UI)
 * @param {string} taskId
 */
async function resolveTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = 'resolved';
    await saveTasks();
    renderTasks();
    showSuccess('✓ Tarea marcada como resuelta');
    console.log(`Tarea ${taskId} marcada como resuelta`);
  }
}

/**
 * Marcar tarea como pendiente (deshacer resolución)
 * @param {string} taskId
 */
async function unresolveTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = 'pending';
    await saveTasks();
    renderTasks();
    console.log(`Tarea ${taskId} marcada como pendiente`);
  }
}

/**
 * Eliminar tarea
 * @param {string} taskId
 */
async function deleteTask(taskId) {
  tasks = tasks.filter(t => t.id !== taskId);
  await saveTasks();
  renderTasks();
  console.log(`Tarea ${taskId} eliminada`);
}

/**
 * Manejar clic en el botón de auditoría
 * Validates: Requirements 1 (Escaneo de Elementos)
 * Validates: Requirements 2 (Manejo de Errores y Validaciones)
 * Validates: Requirements 3 (Ciclo de Vida y Hooks - Estados de carga granulares)
 */
async function handleAuditClick() {
  console.log('Botón de auditoría clickeado');
  
  // Ocultar alertas previas
  hideAlert();
  
  // Estado 1: Extrayendo DOM
  showLoading('Extrayendo DOM...');
  auditBtn.disabled = true;
  
  try {
    // Paso 1: Enviar mensaje al background script para iniciar auditoría
    console.log('[Panel] Enviando mensaje START_AUDIT al background...');
    
    const response = await sendMessageToBackground({ type: 'START_AUDIT' });
    
    // Validar respuesta del background
    // Validates: Requirement 2 (Manejo de Errores)
    if (!response.success) {
      throw new Error(response.message || 'Error al iniciar auditoría');
    }
    
    console.log('[Panel] DOM extraído exitosamente');
    
    // Estado 2: Esperando auditoría del backend
    showLoading('Esperando auditoría...');
    
    // El background guarda el resultado en storage cuando está listo
    // Polling para verificar si hay un nuevo resultado
    const auditResult = await waitForAuditResult();
    
    if (!auditResult) {
      throw new Error('No se recibió resultado de la auditoría');
    }
    
    // Estado 3: Procesando resultados
    console.log('[Panel] Resultado de auditoría recibido:', auditResult);
    
    if (auditResult.errors && auditResult.errors.length > 0) {
      showLoading(`Procesando ${auditResult.errors.length} resultado(s)...`);
      
      // Crear una tarea por cada error encontrado
      auditResult.errors.forEach(error => {
        const task = {
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          error: error.message,
          htmlSnippet: error.htmlSnippet,
          suggestion: error.suggestion,
          status: 'pending',
          wcagCriteria: error.wcagCriteria || 'N/A',
          severity: error.severity || 'error'
        };
        
        tasks.push(task);
      });
      
      await saveTasks();
      renderTasks();
      
      console.log(`[Panel] ${auditResult.errors.length} tarea(s) creada(s)`);
    } else {
      // No se encontraron errores
      showAlert('¡Excelente! No se encontraron errores de accesibilidad en este elemento.');
    }
    
  } catch (error) {
    console.error('[Panel] Error durante la auditoría:', error);
    
    // Manejo específico de errores
    // Validates: Requirement 2 (Manejo de Errores)
    let errorMessage = 'Error durante la auditoría. Por favor, intenta de nuevo.';
    
    if (error.message.includes('NO_ELEMENT_SELECTED')) {
      errorMessage = 'Por favor, selecciona un elemento HTML en el inspector';
    } else if (error.message.includes('CONTENT_SCRIPT_ERROR')) {
      errorMessage = 'No se pudo comunicar con la página. Por favor, recarga la página e intenta de nuevo.';
    } else if (error.message.includes('ERROR_TIMEOUT') || error.message.includes('TIMEOUT')) {
      errorMessage = 'La auditoría excedió el tiempo límite. Verifica tu conexión e intenta de nuevo.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    showAlert(errorMessage);
    
  } finally {
    // Garantizar que el estado de carga se limpia en todos los escenarios
    // Validates: Requirement 3 (Limpieza correcta de estados)
    hideLoading();
    auditBtn.disabled = false;
    console.log('[Panel] Estados de carga limpiados correctamente');
  }
}

/**
 * Enviar mensaje al background script
 * Validates: Requirements 1 (Escaneo de Elementos)
 * 
 * @param {Object} message - Mensaje a enviar
 * @returns {Promise<Object>} - Respuesta del background
 */
function sendMessageToBackground(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      // Verificar si hubo un error en la comunicación
      if (chrome.runtime.lastError) {
        console.error('[Panel] Error de comunicación con background:', chrome.runtime.lastError);
        reject(new Error(`Error de comunicación: ${chrome.runtime.lastError.message}`));
        return;
      }
      
      // Verificar si se recibió respuesta
      if (!response) {
        reject(new Error('No se recibió respuesta del background script'));
        return;
      }
      
      resolve(response);
    });
  });
}

/**
 * Esperar resultado de auditoría desde storage
 * El background script guarda el resultado en chrome.storage.local
 * 
 * @returns {Promise<Object>} - Resultado de la auditoría
 */
async function waitForAuditResult() {
  const MAX_ATTEMPTS = 20; // 20 intentos
  const POLL_INTERVAL = 500; // 500ms entre intentos
  
  let attempts = 0;
  
  while (attempts < MAX_ATTEMPTS) {
    try {
      // Consultar storage por el resultado
      const result = await chrome.storage.local.get(['lastAuditResult']);
      
      if (result.lastAuditResult) {
        // Limpiar el resultado del storage
        await chrome.storage.local.remove(['lastAuditResult']);
        return result.lastAuditResult;
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      attempts++;
      
    } catch (error) {
      console.error('[Panel] Error al consultar storage:', error);
      throw error;
    }
  }
  
  // Timeout: no se recibió resultado
  throw new Error('TIMEOUT: No se recibió resultado de la auditoría en el tiempo esperado');
}

// Event Listeners
auditBtn.addEventListener('click', handleAuditClick);
alertClose.addEventListener('click', hideAlert);
successClose.addEventListener('click', hideSuccess);

// Delegación de eventos para botones de tareas (dinámicos)
tasksContainer.addEventListener('click', async (e) => {
  const target = e.target;
  
  if (target.classList.contains('accept-btn')) {
    const taskId = target.dataset.taskId;
    await resolveTask(taskId);
  }
  
  if (target.classList.contains('unresolve-btn')) {
    const taskId = target.dataset.taskId;
    await unresolveTask(taskId);
  }
  
  if (target.classList.contains('delete-btn')) {
    const taskId = target.dataset.taskId;
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      await deleteTask(taskId);
    }
  }
});

// Inicializar el panel al cargar
initializePanel();
