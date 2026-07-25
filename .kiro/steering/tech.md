# Steering: Frontend - Reportes Ciudadanos

## Product Context
Plataforma web para registrar ciudadanamente problemas comunitarios (baches, luminarias, fugas) y permitir a las autoridades gestionar su estado. El frontend se enfoca en capturar datos limpios para facilitar su posterior análisis y en mostrar tableros de seguimiento claros.

## Tech Stack Obligatorio
- **Core:** React y Vite.
- **Estilos y UI:** Tailwind CSS y shadcn/ui para componentes prearmados rápidos.
- **Estado y Fetching:** `fetch` nativo o `axios` para interactuar con la API del backend.
- **Restricción Crítica:** El frontend NO debe contener lógica de negocio compleja (como decidir prioridades o reglas de estado). Su única responsabilidad es renderizar la UI y comunicarse con el contrato de la API (JSON).

## Architecture & Structure
1. **Interfaz de Ciudadano:** Formularios de captura de datos (texto, fotos, ubicación) y línea de tiempo de seguimiento.
2. **Dashboard de Administración:** Tablas de datos filtrables por prioridad y estado, con controles para actualizar el estado del reporte.

## Security & Secrets
- Respetar el principio de mínimo privilegio.
- El agente NO debe intentar leer ni modificar archivos `.env`. Toda variable sensible de AWS o credencial se manejará fuera del alcance de Kiro.

## Language Rules
- **Regla Estricta:** Toda la documentación interna, la redacción de requerimientos, los planes de tareas, el diseño y las respuestas generadas por Kiro DEBEN estar exclusivamente en **Español**.
- **Excepción:** Únicamente las palabras clave de la metodología EARS (WHEN, THE SYSTEM SHALL, IF, etc.) y la sintaxis pura del código (variables, funciones, HTML) permanecerán en inglés.