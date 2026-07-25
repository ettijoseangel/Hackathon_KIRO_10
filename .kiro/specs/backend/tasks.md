# Implementation Plan — Backend

## Overview
Plan de implementación del servidor Express para Reportes Ciudadanos. Cada tarea corresponde a un commit atómico. Este documento se irá ampliando conforme avancemos — por ahora solo cubre el esqueleto inicial del servidor.

## Tasks

- [ ] 1. Inicialización del Servidor Express
  - [ ] 1.1 Crear estructura de carpetas, package.json e instalar dependencias base
    - Crear rama `feature/backend-setup`
    - Crear `server/package.json` con scripts `dev` (nodemon) y `start` (node)
    - Instalar express, cors, dotenv como dependencias de producción
    - Instalar nodemon como dependencia de desarrollo
    - Crear `server/.env.example` con las variables necesarias (sin valores reales)
    - Agregar `server/.env` al `.gitignore` del proyecto raíz
    - _Requirements: Req 1_

  - [ ] 1.2 Crear entry point (index.js) y configuración de app (app.js) con endpoint /api/health
    - Crear `server/src/index.js` que importa app y escucha en PORT (default 3001)
    - Crear `server/src/app.js` con middleware (cors, json) y ruta GET /api/health
    - Verificar que el servidor levanta y responde `{ "status": "ok" }` en /api/health
    - _Requirements: Req 1_

## Tareas Futuras (se agregarán cuando sea momento)

- Conexión con Supabase (cliente con service_role key)
- Endpoints CRUD de reportes (POST, GET, GET/:codigo, PATCH)
- Manejo de errores global
- Clasificación con IA (iaClassifier)
- Proxy de Vite para desarrollo
- Servir frontend en producción
- Tests unitarios y de integración

## Notes

- Cada tarea = un commit atómico con su propio mensaje descriptivo.
- NO se tocará ningún archivo .env con valores reales — solo el .env.example como plantilla.
- El código debe seguir principios SOLID/DRY desde el inicio.
- La estructura de carpetas debe ser escalable para agregar rutas, servicios y tests después.
- El frontend NO se modifica en este spec.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] }
  ]
}
```
