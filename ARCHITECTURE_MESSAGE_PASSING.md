# Arquitectura: Message Passing - Auditor ARIA

## Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USUARIO (DevTools)                                 │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
                          │ 1. Click en "Auditar"
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PANEL.JS (DevTools UI)                               │
│  - handleAuditClick()                                                       │
│  - showLoading('Extrayendo DOM...')                                         │
│  - chrome.runtime.sendMessage({ type: 'START_AUDIT' })                     │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
                          │ 2. Message: START_AUDIT
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BACKGROUND.JS (Service Worker)                           │
│  - chrome.runtime.onMessage.addListener()                                   │
│  - handleStartAudit()                                                       │
│  - chrome.tabs.query({ active: true })                                     │
│  - chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_DOM' })                │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
                          │ 3. Message: EXTRACT_DOM
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CONTENT.JS (Página Activa)                             │
│  - chrome.runtime.onMessage.addListener()                                   │
│  - handleDOMExtraction()                                                    │
│  - validateElementNotEmpty()                                                │
│  - validateElementContent()                                                 │
│  - extractElementHTML()                                                     │
│  - chrome.runtime.sendMessage({ type: 'DOM_EXTRACTED', html, ... })       │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
                          │ 4. Message: DOM_EXTRACTED
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BACKGROUND.JS (Service Worker)                           │
│  - handleDOMExtracted()                                                     │
│  - sendToBackend(payload)  [MOCK por ahora]                                │
│  - chrome.storage.local.set({ lastAuditResult: result })                   │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
                          │ 5. Guardar en Storage
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CHROME.STORAGE.LOCAL                                    │
│  - lastAuditResult: { id, errors: [...], timestamp }                       │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
                          │ 6. Polling (500ms)
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PANEL.JS (DevTools UI)                               │
│  - waitForAuditResult()                                                     │
│  - chrome.storage.local.get(['lastAuditResult'])                           │
│  - tasks.push(nuevaTarea)                                                   │
│  - saveTasks()                                                              │
│  - renderTasks()                                                            │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
                          │ 7. Renderizar UI
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USUARIO (DevTools)                                 │
│  ✓ Ve la lista de tareas con errores y sugerencias                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Componentes Implementados

### 1. panel.js (DevTools UI)
**Responsabilidades:**
- Capturar el evento de clic del usuario
- Enviar mensaje `START_AUDIT` al background
- Hacer polling en `chrome.storage.local` para obtener resultados
- Crear y renderizar tareas en la Task List UI
- Manejar estados de carga y errores

**Funciones clave:**
- `handleAuditClick()`: Orquesta todo el flujo de auditoría
- `sendMessageToBackground(message)`: Wrapper para comunicación con background
- `waitForAuditResult()`: Polling para obtener resultado desde storage
- `saveTasks()`: Persistir tareas en `chrome.storage.local`
- `renderTasks()`: Renderizar Task List UI

**Mensajes enviados:**
```javascript
{ type: 'START_AUDIT' }
```

**Mensajes recibidos:**
```javascript
{ 
  success: true/false, 
  message: string,
  html?: string,
  error?: string
}
```

### 2. background.js (Service Worker)
**Responsabilidades:**
- Actuar como puente entre panel y content script
- Obtener el tab activo de DevTools
- Enviar mensaje `EXTRACT_DOM` al content script
- Recibir HTML extraído del content script
- Enviar HTML al backend para auditoría (actualmente mock)
- Guardar resultado en `chrome.storage.local`

**Funciones clave:**
- `chrome.runtime.onMessage.addListener()`: Listener principal
- `handleStartAudit()`: Iniciar flujo de auditoría
- `handleDOMExtracted()`: Procesar HTML extraído
- `sendToBackend()`: Enviar al backend (mock por ahora)

**Mensajes recibidos:**
- `START_AUDIT`: Desde panel.js
- `DOM_EXTRACTED`: Desde content.js
- `PING`: Health check

**Mensajes enviados:**
- `EXTRACT_DOM`: Al content script
- Respuestas a panel.js y content.js

### 3. content.js (Página Activa)
**Responsabilidades:**
- Escuchar mensaje `EXTRACT_DOM` desde background
- Validar que hay un elemento seleccionado
- Validar que el elemento no está vacío
- Validar que el contenido es útil para auditoría
- Extraer HTML del elemento
- Enviar HTML al background con mensaje `DOM_EXTRACTED`

**Funciones clave:**
- `handleDOMExtraction()`: Orquesta la extracción
- `validateElementNotEmpty()`: Validación de elemento vacío
- `validateElementContent()`: Validación de contenido útil
- `extractElementHTML()`: Extracción atómica del HTML
- `extractAttributes()`: Extracción de atributos

**Mensajes recibidos:**
```javascript
{ type: 'EXTRACT_DOM' }
```

**Mensajes enviados:**
```javascript
{ 
  type: 'DOM_EXTRACTED', 
  html: string, 
  tagName: string, 
  attributes: object 
}
```

## Manejo de Errores (Requirement 2)

### Errores Validados en content.js
1. **NO_ELEMENT_SELECTED**: No hay elemento seleccionado o es body/html
2. **EMPTY_ELEMENT**: El elemento está vacío (sin texto, hijos o atributos)
3. **INSUFFICIENT_CONTENT**: El HTML extraído es demasiado corto o inválido
4. **EXTRACTION_FAILED**: Fallo al extraer el HTML
5. **COMMUNICATION_ERROR**: Error al comunicarse con el background

### Errores Validados en background.js
1. **NO_ACTIVE_TAB**: No hay pestaña activa
2. **CONTENT_SCRIPT_ERROR**: No se puede comunicar con el content script
3. **HTML_MISSING**: No se recibió HTML del content script
4. **ERROR_TIMEOUT**: Timeout de red o backend
5. **PROCESSING_ERROR**: Error general de procesamiento
6. **UNKNOWN_MESSAGE_TYPE**: Tipo de mensaje no reconocido

### Errores Manejados en panel.js
- **NO_ELEMENT_SELECTED** → "Por favor, selecciona un elemento HTML en el inspector"
- **CONTENT_SCRIPT_ERROR** → "No se pudo comunicar con la página. Por favor, recarga la página e intenta de nuevo."
- **ERROR_TIMEOUT** → "La auditoría excedió el tiempo límite. Verifica tu conexión e intenta de nuevo."
- **Otros** → Mensaje de error personalizado o genérico

## Estados de Carga (Requirement 3)

El panel muestra estados de carga granulares:

1. **"Extrayendo DOM..."**: Panel envía START_AUDIT al background
2. **"Esperando auditoría..."**: DOM extraído, esperando resultado del backend

## Persistencia (Requirement 4)

### Datos Guardados en chrome.storage.local

```javascript
{
  // Lista de tareas (persiste entre sesiones)
  auditTasks: [
    {
      id: string,
      error: string,
      htmlSnippet: string,
      suggestion: string,
      status: 'pending' | 'resolved',
      wcagCriteria: string,
      severity: string
    }
  ],
  
  // Resultado temporal de auditoría (comunicación panel ← background)
  lastAuditResult: {
    id: string,
    errors: [...],
    timestamp: number
  },
  
  // Metadatos de instalación
  installDate: number
}
```

### Flujo de Persistencia

1. **Inicialización del panel:**
   - `initializePanel()` lee `auditTasks` de storage
   - Renderiza tareas previas si existen

2. **Nueva auditoría:**
   - Background guarda `lastAuditResult` en storage
   - Panel hace polling y lee `lastAuditResult`
   - Panel crea nuevas tareas y las agrega a `auditTasks`
   - `saveTasks()` persiste `auditTasks` en storage

3. **Acciones del usuario:**
   - Marcar como resuelto/pendiente
   - Eliminar tarea
   - Cada acción llama a `saveTasks()`

## Comunicación Asíncrona

Todas las comunicaciones usan Promises y async/await:

```javascript
// Panel → Background
const response = await sendMessageToBackground({ type: 'START_AUDIT' });

// Background → Content Script
chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_DOM' }, (response) => {
  // Callback asíncrono
});

// Content Script → Background
chrome.runtime.sendMessage({ type: 'DOM_EXTRACTED', ... }, (response) => {
  // Callback asíncrono
});

// Polling en Panel
while (attempts < MAX_ATTEMPTS) {
  const result = await chrome.storage.local.get(['lastAuditResult']);
  if (result.lastAuditResult) break;
  await sleep(500);
  attempts++;
}
```

## Seguridad y CSP (Manifest V3)

- **No se usa `eval()`**: Todo el código es estático
- **No hay inline scripts**: Scripts cargados desde archivos
- **Service Worker**: Background se ejecuta como Service Worker (no persistent page)
- **Validación de inputs**: Se escapan strings antes de insertar en HTML
- **Permissions mínimos**: Solo `storage`, `activeTab`, `scripting`

## Próximas Mejoras

1. **Comunicación directa**: Eliminar polling y usar mensajes directos desde background a panel
2. **DevTools API**: Usar `chrome.devtools.inspectedWindow.$0` para obtener elemento seleccionado
3. **Backend real**: Reemplazar mock con fetch al backend de auditoría
4. **Retry logic**: Implementar reintentos automáticos en caso de fallo de red
5. **Telemetría**: Agregar métricas de performance y uso

## Validación de Requirements

✅ **Requirement 1 (Escaneo de Elementos)**: 
- Panel envía START_AUDIT cuando usuario hace clic
- Background obtiene tab activo y solicita extracción a content script
- Content script extrae HTML del elemento inspeccionado
- Background envía HTML al backend

✅ **Requirement 2 (Manejo de Errores)**:
- Validación de elemento vacío en content.js
- Validación de contenido insuficiente
- Manejo de errores de comunicación
- Detección de timeout de red
- Mensajes de error descriptivos en la UI

✅ **Requirement 3 (Ciclo de Vida y Hooks)**:
- Estados de carga granulares: "Extrayendo DOM...", "Esperando auditoría..."
- Loading spinner visible durante el proceso

✅ **Requirement 4 (Contexto Persistente)**:
- Tareas se guardan en `chrome.storage.local`
- Al inicializar, panel restaura tareas previas
- Persistencia automática en cada acción del usuario

⚠️ **Requirement 5 (Interacción Task List UI)**:
- Botón "Aceptar corrección" marca tarea como resuelta (implementado en tarea anterior)
- Estado se actualiza en storage local
