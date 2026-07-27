# Requirements Document

## Introduction
Integración completa del frontend React con el backend Express ya funcional. Se rediseña la UI según los mockups de Figma (Variante B) y se conectan todos los componentes con las APIs reales. El objetivo es un producto funcional end-to-end para la demo del hackathon.

## Requirements

### Requirement 1: Infraestructura de Conexión
WHEN el frontend necesite comunicarse con el backend, THE SYSTEM SHALL usar un cliente HTTP centralizado que maneje URL base, errores y estados de carga de forma consistente.

### Requirement 2: Landing Page
THE SYSTEM SHALL mostrar una landing page con hero, buscador de folio, áreas de servicio, sección "cómo funciona", reportes recientes (datos reales del backend) y CTA para crear reporte.

### Requirement 3: Formulario de Reporte
WHEN el ciudadano quiera crear un reporte, THE SYSTEM SHALL presentar un formulario con título, descripción, urgencia, categoría por área de servicio, ubicación (GPS + mapa interactivo), evidencia fotográfica y datos de contacto opcionales. Al enviar, THE SYSTEM SHALL llamar al POST real y mostrar modal con folio.

### Requirement 4: Consulta de Folio
WHEN el ciudadano ingrese un folio, THE SYSTEM SHALL buscar el reporte via API y mostrar su estado, datos y orientación institucional generada por IA.

### Requirement 5: Kit de Reporte (Orientación IA)
WHEN se consulte un reporte existente, THE SYSTEM SHALL mostrar la ficha completa, progress tracker de estado, orientación institucional (nombre, teléfono, sitio web), script sugerido para el operador y lista de próximos pasos.

### Requirement 6: Mapa de Incidencias
THE SYSTEM SHALL mostrar un mapa interactivo con pines de reportes activos, coloreados por categoría, con filtros y popup con opción "A mí también me afecta".
