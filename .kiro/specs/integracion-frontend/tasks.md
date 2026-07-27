# Implementation Plan — Integración Frontend

## Overview
Rediseño completo del frontend e integración con el backend real. Cada tarea es un commit atómico. Se valida visualmente en el navegador después de cada módulo.

## Tasks

### Fase 0 — Infraestructura de Conexión
- [ ] 0.1 Configurar proxy de Vite (/api → localhost:3001)
- [ ] 0.2 Crear cliente HTTP base (client/src/services/apiClient.ts)
- [ ] 0.3 Crear reporteService.ts (crearReporte, buscarPorCodigo, listarReportes, actualizarEstado)
- [ ] 0.4 Crear orientacionService.ts (obtenerGuiaIA)

### Fase 2 — Formulario de Reporte (core del producto)
- [ ] 2.1 Crear layout base del formulario (dos columnas, sidebar con progreso)
- [ ] 2.2 Implementar campos principales (título con contador, descripción, urgencia)
- [ ] 2.3 Implementar selector de categorías (acordeón por área de servicio)
- [ ] 2.4 Implementar ubicación (GPS + input + mapa Leaflet/OpenStreetMap)
- [ ] 2.5 Implementar subida de fotos (drag & drop, preview, max 4)
- [ ] 2.6 Implementar datos de contacto (colapsable, opcional)
- [ ] 2.7 Conectar con POST /api/reportes real
- [ ] 2.8 Implementar modal de confirmación (folio, copiar, consultar)

### Fase 3 — Consultar Folio + Kit de Reporte
- [ ] 3.1 Crear vista consultar folio (buscador + card resultado)
- [ ] 3.2 Crear vista detalle reporte (ficha + progress tracker)
- [ ] 3.3 Implementar sección orientación IA (institución, teléfono, sitio web)
- [ ] 3.4 Implementar script sugerido (recuadro copiable)
- [ ] 3.5 Implementar próximos pasos (lista numerada)
- [ ] 3.6 Conectar con GET /api/reportes/:codigo + GET /api/v1/reportes/:id/guia-ia

### Fase 1 — Landing Page
- [ ] 1.1 Crear hero + buscador de folio
- [ ] 1.2 Crear sección áreas de servicio (3 cards con categorías)
- [ ] 1.3 Crear sección "Cómo funciona" (3 pasos)
- [ ] 1.4 Crear tabla reportes recientes (conectar con GET /api/reportes)
- [ ] 1.5 Crear CTA + footer
- [ ] 1.6 Crear navbar global

### Fase 4 — Mapa de Incidencias
- [ ] 4.1 Instalar Leaflet + react-leaflet
- [ ] 4.2 Crear vista mapa con pines por categoría
- [ ] 4.3 Implementar panel de filtros (área, estado)
- [ ] 4.4 Implementar popup de pin con "A mí también me afecta"
- [ ] 4.5 Conectar con GET /api/reportes (filtrar por coordenadas)

### Fase 5 — Limpieza y Rutas
- [ ] 5.1 Configurar React Router con vistas finales
- [ ] 5.2 Eliminar Dashboard viejo y mocks
- [ ] 5.3 Verificar responsive en mobile
- [ ] 5.4 Lint final del frontend

## Notes
- Orden de ejecución: Fase 0 → Fase 2 → Fase 3 → Fase 1 → Fase 4 → Fase 5
- Cada tarea = un commit atómico.
- Validar visualmente en navegador después de cada módulo.
- Sin menciones a "Monterrey" en el branding — solo "Reportes Ciudadanos".
- Leaflet + OpenStreetMap para mapas (gratis, sin API key).
- El backend ya está funcional y validado en Postman.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["0.1", "0.2", "0.3", "0.4"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3"] },
    { "id": 3, "tasks": ["2.4", "2.5", "2.6"] },
    { "id": 4, "tasks": ["2.7", "2.8"] },
    { "id": 5, "tasks": ["3.1", "3.2"] },
    { "id": 6, "tasks": ["3.3", "3.4", "3.5"] },
    { "id": 7, "tasks": ["3.6"] },
    { "id": 8, "tasks": ["1.1", "1.6"] },
    { "id": 9, "tasks": ["1.2", "1.3"] },
    { "id": 10, "tasks": ["1.4", "1.5"] },
    { "id": 11, "tasks": ["4.1"] },
    { "id": 12, "tasks": ["4.2", "4.3"] },
    { "id": 13, "tasks": ["4.4", "4.5"] },
    { "id": 14, "tasks": ["5.1", "5.2", "5.3", "5.4"] }
  ]
}
```
