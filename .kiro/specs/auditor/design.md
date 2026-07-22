# Design Document

## Overview
La extensión funciona como un puente ligero entre las herramientas de desarrollador nativas de Chrome y el backend de auditoría, enfocándose en la velocidad de UI y el manejo seguro del DOM.

## Architecture
El flujo de datos sigue un patrón unidireccional:
DevTools Panel -> solicita DOM -> Content Script -> extrae HTML -> Background Script -> envía a Backend.

## Components and Interfaces
1. `devtools.html`: Vista de la Task List UI.
2. `panel.js`: Controlador de la UI y Local Storage.
3. `content.js`: Extractor aislado del DOM.
4. `background.js`: Gestor de peticiones asíncronas.

## Data Models
- **TaskItem:** `{ id: string, error: string, htmlSnippet: string, suggestion: string, status: 'pending' | 'resolved' }`

## Error Handling
- Si no hay nodo seleccionado: se intercepta en el panel y se muestra alerta en la UI.
- Si la red falla: el Service Worker captura la excepción y envía un mensaje de tipo `ERROR_TIMEOUT` al panel.

## Correctness Properties

### Property 1: Aislamiento
El content script no debe interferir con el CSS o JS de la página web que está siendo auditada.
**Validates: Requirements 1**

### Property 2: Persistencia
Si el panel de DevTools se cierra accidentalmente, el estado de la lista de tareas debe recuperarse íntegramente desde `chrome.storage.local`.
**Validates: Requirements 4**

### Property 3: Rendimiento
Las peticiones de extracción del DOM deben ser atómicas (solo el elemento seleccionado) para evitar bloqueos por sobrecarga de memoria en el navegador.
**Validates: Requirements 1**

## Testing Strategy
Se validará manualmente que la extensión cargue en `chrome://extensions` sin errores de Manifest. Las interfaces de paso de mensajes entre el Service Worker y el panel se probarán verificando los logs de red y de consola nativos del modo desarrollador de Chrome.