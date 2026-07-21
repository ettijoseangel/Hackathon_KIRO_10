# Requirements Document

## Introduction
Como desarrollador frontend, quiero poder escanear un fragmento de código HTML desde el panel de DevTools para recibir una lista de tareas con errores de accesibilidad y sugerencias de código corregido, sin perder mi progreso si cierro el panel.

## Requirements

### 1. Escaneo de Elementos (Event-driven)
- **WHEN** el usuario hace clic en el botón "Auditar componente seleccionado" en la interfaz de DevTools, **THE SYSTEM SHALL** extraer el HTML del nodo actualmente inspeccionado y enviarlo al Service Worker.

### 2. Manejo de Errores y Validaciones (Unwanted behavior)
- **IF** el usuario intenta auditar pero no hay ningún elemento seleccionado en el panel de elementos, **THE SYSTEM SHALL** bloquear la acción y mostrar el mensaje de error "Por favor, selecciona un elemento HTML en el inspector".
- **IF** el Service Worker devuelve un error de timeout o fallo de red, **THE SYSTEM SHALL** renderizar una alerta visual en la interfaz indicando el fallo, permitiendo reintentar la acción.

### 3. Ciclo de Vida y Hooks (Ubiquitous)
- **The system shall** renderizar estados de carga granulares (ej. "Extrayendo DOM...", "Esperando auditoría...") en la Task List UI mientras espera la respuesta del backend.

### 4. Contexto Persistente (State-driven)
- **WHEN** el panel de DevTools se inicializa, **THE SYSTEM SHALL** consultar `chrome.storage.local` para restaurar y renderizar la última sesión de auditoría (lista de tareas previas).

### 5. Interacción de la Task List UI (Event-driven)
- **WHEN** el usuario hace clic en el botón "Aceptar corrección" de un ítem de la lista, **THE SYSTEM SHALL** marcar la tarea como completada visualmente y actualizar su estado en el almacenamiento local.

## Glossary
- **EARS**: Easy Approach to Requirements Syntax.
- **Task List UI**: Interfaz gráfica en el panel de DevTools que renderiza cada error de accesibilidad como una tarea gestionable.
- **Service Worker**: Script de fondo en la extensión de Chrome encargado de realizar las peticiones al backend.