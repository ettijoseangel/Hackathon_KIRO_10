---
inclusion: fileMatch
fileMatchPattern: "client/**"
---

# Steering: Reglas del Frontend

## Stack Técnico
- **Core:** React 19 + Vite + TypeScript
- **Estilos y UI:** Tailwind CSS y shadcn/ui para componentes prearmados.
- **Mapas:** Leaflet + react-leaflet + OpenStreetMap (gratis, sin API key).
- **Geocoding:** Nominatim (OpenStreetMap, gratis).
- **Estado y Fetching:** `fetch` nativo centralizado en servicios.
- **Routing:** React Router DOM.

## Arquitectura del Frontend
```
client/src/
├── components/       ← Componentes reutilizables (UI, Layout, Navbar)
├── pages/            ← Vistas completas (Landing, ReportForm, ConsultarFolio, DetalleReporte, Mapa)
├── services/         ← Comunicación HTTP (apiClient, reporteService, orientacionService)
├── types/            ← Interfaces TypeScript
├── lib/              ← Utilidades (cn, helpers)
└── assets/           ← Imágenes, íconos
```

## Reglas de Integración con Backend
- **NUNCA** poner URLs de API hardcodeadas en componentes.
- Toda comunicación HTTP vive en `src/services/`.
- Usar variable `VITE_API_URL` para la URL base (o proxy de Vite en desarrollo).
- Los componentes solo manejan UI y estado local — la lógica HTTP está en servicios.
- Manejar consistentemente 3 estados: carga (loading), éxito (data), error (mensaje).
- El frontend NO contiene lógica de negocio (prioridades, clasificación, reglas de estado).

## Flujo de Trabajo por Módulo
1. Leer el código relevante existente.
2. Planificar el cambio (explicar qué se va a hacer).
3. Implementar el cambio mínimo necesario.
4. Verificar que compila y se visualiza correctamente en el navegador.
5. Commit atómico del código.
6. Pasar a la siguiente tarea.

## Diseño Visual (Variante B de Figma)
- Paleta: violeta/índigo (#6366F1, #4F46E5) como primario, fondo claro (slate-50/white).
- Cards con bordes redondeados (rounded-xl), sombras suaves.
- Tipografía sans-serif limpia.
- Mobile-first, responsivo.
- Sin menciones a "Monterrey" ni a ninguna ciudad específica — el branding es "Reportes Ciudadanos".
- Navbar: logo + "Reportes Ciudadanos", links (Inicio, Mis reportes, Mapa), botón CTA "Crear reporte".

## Seguridad
- Solo la `anon key` de Supabase se usa en el frontend (para Storage si se necesita).
- Nunca exponer `service_role key` ni credenciales privadas.
- El agente NO debe intentar leer ni modificar archivos `.env`.
- Validar inputs del lado del cliente antes de enviar (UX), pero confiar en la validación del backend como fuente de verdad.

## Testing
- Vitest + Testing Library + jsdom (ya configurado).
- Tests de componentes con interacciones de usuario.
- Se aplica testing a componentes con lógica compleja, no a layouts estáticos.
