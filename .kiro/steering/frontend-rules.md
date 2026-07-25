---
inclusion: fileMatch
fileMatchPattern: "src/**"
---

# Steering: Reglas del Frontend

## Stack Técnico
- **Core:** React 19 + Vite + TypeScript
- **Estilos y UI:** Tailwind CSS y shadcn/ui para componentes prearmados.
- **Estado y Fetching:** `fetch` nativo para interactuar con la API del backend.
- **Routing:** React Router DOM.
- **Restricción Crítica:** El frontend NO debe contener lógica de negocio compleja (como decidir prioridades o reglas de estado). Su única responsabilidad es renderizar la UI y comunicarse con el contrato de la API (JSON).

## Arquitectura
1. **Interfaz de Ciudadano:** Formularios de captura de datos (texto, fotos, ubicación) y línea de tiempo de seguimiento.
2. **Dashboard de Administración:** Tablas de datos filtrables por prioridad y estado, con controles para actualizar el estado del reporte.

## Flujo de Trabajo por Módulo
- (Por definir cuando se inicie la integración del frontend con el backend real)
- Se espera un flujo similar al backend: implementar → validar visualmente → tests → commit.

## Testing
- Vitest + Testing Library + jsdom (ya configurado en el proyecto).
- Tests de componentes con interacciones de usuario.
- (Reglas específicas se definirán al iniciar la fase de integración)

## Seguridad
- Solo la `anon key` de Supabase se usa en el frontend (para Storage).
- Nunca exponer la `service_role key` en código del lado del cliente.
- El agente NO debe intentar leer ni modificar archivos `.env`.
