# Steering: Frontend - Auditor ARIA (Chrome Extension)

## Product Context
Extensión de Chrome orientada al panel de DevTools para auditar accesibilidad (WCAG) bajo demanda. Actúa como un asistente de remediación que identifica errores (como falta de atributos aria o contrastes) y devuelve sugerencias de código en formato de Task List UI interactiva.

## Tech Stack Obligatorio
- **Core:** Vanilla TypeScript (o JavaScript moderno) y HTML5.
- **Estilos:** Tailwind CSS (configuración minimalista/estática para no sobrecargar la extensión).
- **Entorno:** Chrome Extensions API bajo **Manifest V3** (Estricto).
- **Restricción Crítica:** NO usar frameworks reactivos pesados (React, Vue, Angular, etc.). La interfaz debe ser ultraligera para no impactar el rendimiento del navegador.

## Architecture & Structure
1. **DevTools Page (`devtools.html` / `panel.js`):** La interfaz principal. Renderiza la matriz de errores como tareas y gestiona el Contexto Persistente apoyándose en `chrome.storage.local`.
2. **Content Script (`content.js`):** Se inyecta en la página objetivo. Su única responsabilidad es escuchar eventos de inspección, extraer fragmentos precisos del DOM (etiquetas específicas) y enviarlas al background.
3. **Service Worker (`background.js`):** El puente central. Maneja la comunicación asíncrona mediante mensajes (Message Passing) y ejecuta las llamadas `fetch` hacia el backend/API para evitar bloqueos por CORS.

## Rules & Constraints
- Respetar estrictamente las políticas de seguridad de contenido (CSP) de Manifest V3 (no usar `eval()` ni código inline peligroso).
- Kiro no debe alucinar ni proponer la instalación de librerías externas (NPM) a menos que se solicite explícitamente en una tarea. Todo debe resolverse con código nativo y las APIs de Chrome.

## Language Rules
- **Regla Estricta:** Toda la documentación interna, la redacción de requerimientos, los planes de tareas, el diseño y las respuestas generadas por Kiro DEBEN estar exclusivamente en **Español**.
- **Excepción:** Únicamente las palabras clave de la metodología EARS (WHEN, THE SYSTEM SHALL, IF, etc.) y la sintaxis pura del código (variables, funciones, HTML) permanecerán en inglés.