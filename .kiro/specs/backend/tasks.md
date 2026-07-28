# Implementation Plan — Backend

## Overview
Plan de implementación del servidor Express para Reportes Ciudadanos. Cada tarea corresponde a un commit atómico. El estado refleja el progreso real del código existente al 26/07/2026.

## Tasks

- [x] 1. Inicialización del Servidor Express
  - [x] 1.1 Crear estructura de carpetas, package.json e instalar dependencias base
    - Crear `server/package.json` con scripts `dev`, `start`, `db:migrate`, `db:deploy`, `db:studio`, `db:generate`, `db:reset`
    - Instalar express, cors, dotenv, @prisma/client como dependencias de producción
    - Instalar nodemon, prisma como dependencias de desarrollo
    - Crear `server/.env.example` con las variables necesarias
    - _Requirements: Req 1_

  - [x] 1.2 Crear entry point (index.js) y configuración de app (app.js) con endpoint /api/health
    - `server/src/index.js` — importa app y escucha en PORT (default 3001)
    - `server/src/app.js` — middleware (cors, json), ruta GET /api/health, routers montados, error handler global
    - _Requirements: Req 1, Req 7_

- [x] 2. Configuración de Prisma y Base de Datos
  - [x] 2.1 Crear schema de Prisma con modelos y enums
    - `server/prisma/schema.prisma` con modelos Reporte, HistorialEstado, OrientacionIA
    - Enums: AreaServicio, CategoriaReporte, PrioridadReporte, EstadoReporte, TipoUbicacion
    - Campos de IA agregados: justificacion_ia, clasificado_por_ia
    - _Requirements: Req 2, Req 3, Req 8_ | _Fuente: basedatos.md_

  - [x] 2.2 Crear instancia singleton de PrismaClient
    - `server/src/db/prisma.js` — evita múltiples conexiones en hot-reload
    - _Fuente: basedatos.md sección 2_

- [x] 3. Capa de Modelos (acceso a datos)
  - [x] 3.1 Modelo de Reportes
    - `server/src/models/reporte.model.js` — crearReporte, listarReportes, buscarPorCodigo, buscarPorId, actualizarEstado (con transacción)
    - Generación secuencial de código de seguimiento (REP-001, REP-002...)
    - _Requirements: Req 2, Req 4, Req 5, Req 6_

  - [x] 3.2 Modelo de Historial de Estados
    - `server/src/models/historialEstado.model.js` — obtenerHistorialPorReporte, crearEntradaHistorial
    - _Requirements: Req 5, Req 6_

  - [x] 3.3 Modelo de Orientación IA
    - `server/src/models/orientacionIA.model.js` — crearOrientacion, buscarPorReporteId
    - _Requirements: Req 8_

- [x] 4. Módulo de IA (arquitectura de adaptadores)
  - [x] 4.1 Interfaz común de IA
    - `server/src/ia/iaInteraface.js` — validarAdapter() que verifica que un adaptador implemente clasificarPrioridad y generarOrientacion
    - _Requirements: Req 9.1_

  - [x] 4.2 Fallbacks centralizados
    - `server/src/ia/fallbacks.js` — CLASIFICACION_FALLBACK y ORIENTACION_FALLBACK
    - _Requirements: Req 3.3, 3.4, 8.4, 8.5, 9.6_

  - [x] 4.3 Adaptador de Anthropic
    - `server/src/ia/anthropicAdapter.js` — clasificarPrioridad() y generarOrientacion() usando Claude claude-sonnet-4-20250514
    - Timeout 10s, parseo JSON, retorna null para que la capa superior aplique fallback
    - _Requirements: Req 3, Req 8, Req 9.3_

  - [x] 4.4 Factory/Registry de proveedores
    - `server/src/ia/index.js` — selección por AI_PROVIDER env var, fallback automático
    - _Requirements: Req 9.2, 9.5, 9.6_

- [x] 5. Capa de Servicios (lógica de negocio)
  - [x] 5.1 Servicio de Reportes
    - `server/src/services/reporte.service.js` — validaciones, orquestación crearReporte, listarReportes, buscarPorCodigo, actualizarEstado
    - _Requirements: Req 2, Req 4, Req 5, Req 6_

  - [x] 5.2 Servicio de Orientación IA
    - `server/src/services/orientacionIA.service.js` — generarYPersistirOrientacion, obtenerOrientacionPorReporte
    - _Requirements: Req 8_

  - [x] 5.3 Servicio clasificador (wrapper)
    - `server/src/services/iaClassifier.js` — delega a ia/index.js
    - _Requirements: Req 3, Req 9_

- [x] 6. Capa de Controladores
  - [x] 6.1 Controlador de Reportes
    - `server/src/controllers/reporte.controller.js` — crearReporte, listarReportes, buscarPorCodigo, actualizarEstado
    - _Requirements: Req 2, Req 4, Req 5, Req 6_

  - [x] 6.2 Controlador de Guía IA
    - `server/src/controllers/guiaIA.controller.js` — obtenerGuiaIA (solo lectura, status 200/206/400/404)
    - _Requirements: Req 8.6, 8.7, 8.8, 8.9_

- [x] 7. Rutas y app.js
  - [x] 7.1 Rutas de Reportes
    - `server/src/routes/reportes.js` — POST /, GET /, GET /:codigo, PATCH /:id/estado
    - _Requirements: Req 2, Req 4, Req 5, Req 6_

  - [x] 7.2 Rutas de Guía IA
    - `server/src/routes/guiaIa.js` — GET /reportes/:reporteId/guia-ia
    - _Requirements: Req 8.6_

  - [x] 7.3 Integración en app.js
    - Routers montados en /api/reportes y /api/v1
    - Middleware de error global (Req 7)
    - _Requirements: Req 1, Req 7_

- [x] 8. Fixes críticos (3 errores de import que impiden compilación)
  - [x] 8.1 Corregir `src/services/iaClassifier.js`
    - Cambiar import path de `'./ia/index.js'` a `'../ia/index.js'`
    - Completar la función exportada `clasificarPrioridad`
  - [x] 8.2 Corregir `src/services/reporte.service.js`
    - Agregar `import { generarYPersistirOrientacion } from './orientacionIA.service.js'`
  - [x] 8.3 Corregir `src/services/orientacionIA.service.js`
    - Cambiar import path de `'./ia/index.js'` a `'../ia/index.js'`

- [x] 9. Migración de base de datos
  - [x] 9.1 Ejecutar primera migración de Prisma
    - Configurar DATABASE_URL y DIRECT_URL en `server/.env`
    - Ejecutar `npx prisma migrate dev --name init`
    - Verificar que las tablas se crearon en Supabase
    - _Requirements: Req 2_ | _Fuente: basedatos.md sección 4_

- [x] 10. Validación manual (Postman)
  - [x] 10.1 Verificar GET /api/health
  - [x] 10.2 Verificar POST /api/reportes (crear reporte con clasificación IA)
  - [x] 10.3 Verificar GET /api/reportes (listar con/sin filtros)
  - [x] 10.4 Verificar GET /api/reportes/:codigo (con historial)
  - [x] 10.5 Verificar PATCH /api/reportes/:id/estado
  - [x] 10.6 Verificar GET /api/v1/reportes/:reporteId/guia-ia

- [x] 11. Tests
  - [x] 11.1 Configurar framework de testing (vitest o jest)
  - [x] 11.2 Tests unitarios para servicios (iaClassifier, reporte.service, orientacionIA.service)
  - [x] 11.3 Tests de integración para los 5 endpoints

- [x] 12. Docker y Deployment
  - [x] 12.1 Crear `server/Dockerfile` (producción)
  - [x] 12.2 Crear `server/Dockerfile.dev` (desarrollo con nodemon)
  - [x] 12.3 Crear `docker-compose.yml` (base)
  - [x] 12.4 Crear `docker-compose.override.yml` (desarrollo)
  - [x] 12.5 Crear `nginx/` con Dockerfile y conf.d/default.conf
  - [x] 12.6 Crear `deploy/deploy.sh`
  - _Requirements: design.md (Deploy en AWS EC2 con Docker Compose)_

## Notes

- Cada tarea = un commit atómico con su propio mensaje descriptivo.
- NO se tocará ningún archivo .env con valores reales — solo el .env.example como plantilla.
- El código sigue principios SOLID/DRY.
- La tarea 8 es bloqueante: sin esos fixes el servidor no compila.
- Las tareas 10 y 11 siguen la regla de avance estricta del backend-rules: no avanzar sin validación manual y tests.
- El frontend NO se modifica en este spec.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1", "3.2", "3.3"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3", "4.4"] },
    { "id": 4, "tasks": ["5.1", "5.2", "5.3"] },
    { "id": 5, "tasks": ["6.1", "6.2"] },
    { "id": 6, "tasks": ["7.1", "7.2", "7.3"] },
    { "id": 7, "tasks": ["8.1", "8.2", "8.3"] },
    { "id": 8, "tasks": ["9.1"] },
    { "id": 9, "tasks": ["10.1", "10.2", "10.3", "10.4", "10.5", "10.6"] },
    { "id": 10, "tasks": ["11.1", "11.2", "11.3"] },
    { "id": 11, "tasks": ["12.1", "12.2", "12.3", "12.4", "12.5", "12.6"] }
  ]
}```

