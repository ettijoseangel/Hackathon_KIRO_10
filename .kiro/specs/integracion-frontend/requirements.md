# Requirements Document

## Introduction
Integración completa del frontend React con el backend Express ya funcional. Se rediseña la UI según los mockups de Figma (Variante B) y se conectan todos los componentes con las APIs reales. El objetivo es un producto funcional end-to-end para la demo del hackathon.

## Requirements

### Requirement 1: Infraestructura de Conexión

#### Acceptance Criteria
1. WHEN el frontend necesite comunicarse con el backend, THE SYSTEM SHALL usar un cliente HTTP centralizado (`apiClient.ts`) que maneje URL base, errores y estados de carga.
2. THE SYSTEM SHALL centralizar las llamadas en servicios (`reporteService.ts`, `orientacionService.ts`), nunca directamente en componentes.
3. THE SYSTEM SHALL usar el proxy de Vite (`/api` → `localhost:3001`) en desarrollo.

### Requirement 2: Landing Page

#### Acceptance Criteria
1. THE SYSTEM SHALL mostrar una landing page con hero, buscador de folio, estadísticas fijas, áreas de servicio con categorías y CTA para crear reporte.
2. THE SYSTEM SHALL mostrar una tabla de reportes recientes con datos reales del backend (folio, área, colonia, estatus, tiempo).
3. THE SYSTEM SHALL incluir navbar con links a Inicio, Mis reportes, Mapa, Ayuda y botón "Crear reporte".

### Requirement 3: Formulario de Reporte

#### Acceptance Criteria
1. WHEN el ciudadano quiera crear un reporte, THE SYSTEM SHALL presentar un formulario con título (0/120), descripción (0/600), nivel de urgencia, categoría por área con acordeón, ubicación (GPS + mapa interactivo con pin clicable), evidencia fotográfica y datos de contacto opcionales.
2. THE SYSTEM SHALL mostrar un sidebar con progreso del reporte, vista previa e info de seguimiento.
3. WHEN el usuario haga clic en el mapa, THE SYSTEM SHALL mover el pin y actualizar las coordenadas.
4. WHEN el formulario se envíe exitosamente, THE SYSTEM SHALL mostrar modal con folio de seguimiento.

### Requirement 4: Consulta de Folio

#### Acceptance Criteria
1. WHEN el ciudadano ingrese un folio, THE SYSTEM SHALL buscar el reporte via `GET /api/reportes/:codigo` y mostrar su estado con progress tracker.
2. IF el folio no existe, THEN THE SYSTEM SHALL mostrar mensaje de error claro.

### Requirement 5: Kit de Reporte (Orientación IA)

#### Acceptance Criteria
1. WHEN se consulte un reporte existente, THE SYSTEM SHALL mostrar la ficha completa con progress tracker (Pendiente → En Proceso → Resuelto).
2. THE SYSTEM SHALL consultar `GET /api/v1/reportes/:id/guia-ia` y mostrar orientación institucional (nombre, teléfono, sitio web).
3. THE SYSTEM SHALL mostrar un guión copiable para el operador y lista de próximos pasos.
4. IF no hay orientación disponible, THEN THE SYSTEM SHALL mostrar fallback con número 072.

### Requirement 6: Mapa de Incidencias

#### Acceptance Criteria
1. THE SYSTEM SHALL mostrar un mapa Leaflet/OpenStreetMap con pines de reportes activos que tengan coordenadas GPS.
2. THE SYSTEM SHALL colorear pines por área de servicio (azul agua, amarillo electricidad, rojo municipal).
3. THE SYSTEM SHALL incluir panel lateral con filtros por área y estado, y lista de reportes.
4. WHEN el usuario haga clic en un pin, THE SYSTEM SHALL mostrar popup con folio, título y estado.
