# Testing: Message Passing - Auditor ARIA

## Descripción
Documento de pruebas para validar el flujo de comunicación entre panel.js, background.js y content.js.

## Arquitectura Implementada

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   panel.js      │────────>│  background.js   │────────>│   content.js    │
│  (DevTools UI)  │ START_  │ (Service Worker) │ EXTRACT_│ (Página activa) │
│                 │ AUDIT   │                  │ DOM     │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        ^                            │                            │
        │                            │                            │
        │        chrome.storage      │         DOM_EXTRACTED      │
        └────────────────────────────┴────────────────────────────┘
```

## Flujo de Comunicación

### 1. Usuario hace clic en "Auditar componente seleccionado"
- **Archivo:** `panel.js`
- **Función:** `handleAuditClick()`
- **Mensaje enviado:** `{ type: 'START_AUDIT' }`
- **Destino:** background.js

### 2. Background recibe solicitud y contacta content script
- **Archivo:** `background.js`
- **Función:** `handleStartAudit()`
- **Acciones:**
  1. Obtiene el tab activo con `chrome.tabs.query()`
  2. Envía mensaje al content script: `{ type: 'EXTRACT_DOM' }`
  3. Espera respuesta del content script

### 3. Content script extrae el DOM
- **Archivo:** `content.js`
- **Función:** `handleDOMExtraction()`
- **Validaciones:**
  - Verifica que hay un elemento seleccionado
  - Valida que el elemento no esté vacío
  - Valida que el contenido sea útil para auditoría
- **Mensaje enviado:** `{ type: 'DOM_EXTRACTED', html, tagName, attributes }`
- **Destino:** background.js

### 4. Background procesa DOM y envía al backend
- **Archivo:** `background.js`
- **Función:** `handleDOMExtracted()` y `sendToBackend()`
- **Acciones:**
  1. Recibe HTML del content script
  2. Prepara payload para el backend
  3. Envía al backend (actualmente mock)
  4. Guarda resultado en `chrome.storage.local`

### 5. Panel consulta resultado y renderiza tareas
- **Archivo:** `panel.js`
- **Función:** `waitForAuditResult()`
- **Acciones:**
  1. Polling en `chrome.storage.local` cada 500ms
  2. Recupera resultado cuando está disponible
  3. Crea tareas a partir de los errores encontrados
  4. Renderiza en la Task List UI

## Tipos de Mensajes

### Panel → Background
```javascript
{
  type: 'START_AUDIT'
}
```

### Background → Content Script
```javascript
{
  type: 'EXTRACT_DOM'
}
```

### Content Script → Background
```javascript
{
  type: 'DOM_EXTRACTED',
  html: '<button>Texto</button>',
  tagName: 'button',
  attributes: { class: 'btn', id: 'submit' }
}
```

### Respuestas de Error
```javascript
{
  success: false,
  error: 'NO_ELEMENT_SELECTED' | 'CONTENT_SCRIPT_ERROR' | 'ERROR_TIMEOUT' | 'UNEXPECTED_ERROR',
  message: 'Descripción del error'
}
```

## Manejo de Errores Implementado

### Requirement 2: Validaciones
1. **NO_ELEMENT_SELECTED:** Se detecta en content.js y se muestra en panel.js con mensaje específico
2. **EMPTY_ELEMENT:** Se valida que el elemento tenga contenido
3. **INSUFFICIENT_CONTENT:** Se valida que el HTML sea útil para auditoría
4. **CONTENT_SCRIPT_ERROR:** Se maneja cuando no se puede comunicar con la página
5. **ERROR_TIMEOUT:** Se detecta cuando la red falla o hay timeout
6. **UNEXPECTED_ERROR:** Catch-all para errores no previstos

## Testing Manual

### Pre-requisitos
1. Cargar la extensión en `chrome://extensions/` (modo desarrollador)
2. Activar "Service worker" en la extensión
3. Abrir DevTools en cualquier página web
4. Seleccionar un elemento HTML en el panel "Elements"
5. Navegar a la pestaña "Auditor ARIA" en DevTools

### Caso de Prueba 1: Flujo exitoso
1. Seleccionar un botón con el inspector de elementos
2. Hacer clic en "Auditar componente seleccionado"
3. **Resultado esperado:**
   - Loading: "Extrayendo DOM..."
   - Loading: "Esperando auditoría..."
   - Se crea una tarea con error y sugerencia
   - La tarea aparece en la lista

### Caso de Prueba 2: Sin elemento seleccionado
1. No seleccionar ningún elemento (o seleccionar body/html)
2. Hacer clic en "Auditar componente seleccionado"
3. **Resultado esperado:**
   - Alerta: "Por favor, selecciona un elemento HTML en el inspector"

### Caso de Prueba 3: Elemento vacío
1. Seleccionar un `<div></div>` vacío
2. Hacer clic en "Auditar componente seleccionado"
3. **Resultado esperado:**
   - Alerta con mensaje descriptivo sobre elemento vacío

### Caso de Prueba 4: Persistencia
1. Realizar una auditoría exitosa
2. Cerrar el panel de DevTools
3. Reabrir el panel de DevTools
4. **Resultado esperado:**
   - Las tareas previas se cargan desde `chrome.storage.local`
   - El estado se mantiene intacto

## Logs de Consola para Debugging

### Panel (DevTools Console)
```
[Panel] Enviando mensaje START_AUDIT al background...
[Panel] DOM extraído exitosamente
[Panel] Resultado de auditoría recibido: {...}
[Panel] 1 tarea(s) creada(s)
```

### Background (Service Worker Console - en chrome://extensions/)
```
[Background] Service Worker inicializado
[Background] Mensaje recibido: START_AUDIT {...}
[Background] Iniciando auditoría...
[Background] Tab activo: 123
[Background] Solicitando extracción de DOM al content script...
[Background] DOM extraído exitosamente
[Background] Procesando DOM extraído...
[Background] Enviando al backend de auditoría...
[Background] NOTA: Usando datos mock...
[Background] Auditoría completada, enviando resultado al panel...
```

### Content Script (Page Console)
```
[Content Script] Auditor ARIA - Content script cargado correctamente
[Content Script] Error al extraer DOM: ... (solo si hay error)
```

## Próximos Pasos (Tareas Futuras)

1. **Tarea 3.2:** Integrar backend real reemplazando la función `sendToBackend()` mock
2. **Tarea 3.3:** Implementar timeout configurable y retry logic
3. **Tarea 3.4:** Agregar telemetría y métricas de performance
4. **Tarea 3.5:** Implementar inspección visual en la página (highlight de elementos)

## Notas de Implementación

- **Manifest V3:** Se usa Service Worker persistente con `chrome.runtime.onMessage`
- **Async/Await:** Todas las comunicaciones son asíncronas con Promises
- **CSP Compliance:** No se usa `eval()` ni código inline
- **Storage:** Se usa `chrome.storage.local` para persistencia y comunicación
- **Polling:** El panel hace polling cada 500ms (máximo 20 intentos = 10 segundos)

## Limitaciones Conocidas

1. **Inspección limitada:** El content script necesita que se marque el elemento con `data-inspected="true"` o que se use `document.activeElement`. Una mejora futura sería usar la API de DevTools `chrome.devtools.inspectedWindow`.

2. **Backend mock:** La función `sendToBackend()` retorna datos de prueba. Debe reemplazarse con fetch real al backend.

3. **Polling ineficiente:** El panel hace polling a storage. Una mejora sería usar `chrome.runtime.sendMessage` directo desde background a panel cuando el resultado esté listo.
