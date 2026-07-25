# Requirements Document

## Introduction
Servidor backend en Express que expone una API REST para la plataforma de Reportes Ciudadanos de Monterrey. Se conecta a Supabase (Postgres) para persistir reportes y su historial de estados. Incluye un módulo de clasificación de prioridad con IA (Claude/Anthropic) que opera de forma no bloqueante.

## Glossary
- **Express**: Framework de Node.js para crear servidores HTTP.
- **Supabase**: Plataforma BaaS (Backend as a Service) basada en Postgres.
- **service_role key**: Llave de Supabase con permisos administrativos que salta RLS.
- **anon key**: Llave pública de Supabase con permisos restringidos por RLS.
- **RLS**: Row Level Security — políticas de acceso a nivel de fila en Postgres.
- **IA Classifier**: Módulo que llama a la API de Anthropic (Claude) para clasificar la prioridad del reporte.
- **Fallback**: Comportamiento por defecto cuando la IA falla (prioridad = "Media").
- **codigo_seguimiento**: Identificador público del reporte (REP-001, REP-002...) generado por trigger en la BD.
- **historial_estados**: Tabla que registra automáticamente cada cambio de estado de un reporte.

## Requirements

### Requirement 1: Inicialización del Servidor

**User Story:** Como equipo de desarrollo, queremos un servidor Express configurado correctamente, para poder agregar rutas y middleware de forma incremental.

#### Acceptance Criteria

1. THE SYSTEM SHALL escuchar en el puerto definido por la variable de entorno `PORT` (default: 3001).
2. THE SYSTEM SHALL responder con `{ "status": "ok" }` en `GET /api/health` para verificar que el servidor está corriendo.
3. THE SYSTEM SHALL parsear JSON del body de las peticiones entrantes (`express.json()`).
4. THE SYSTEM SHALL configurar CORS para permitir peticiones desde `CLIENT_ORIGIN` durante desarrollo.
5. THE SYSTEM SHALL servir el build estático del frontend (`../dist`) cuando `NODE_ENV=production`.

### Requirement 2: Creación de Reportes (POST /api/reportes)

**User Story:** Como ciudadano, quiero enviar mi reporte al backend y recibir un código de seguimiento, para poder consultar su estado después.

#### Acceptance Criteria

1. WHEN el backend recibe un POST con campos válidos (titulo, area_servicio, categoria, tipo_ubicacion + ubicación correspondiente), THE SYSTEM SHALL insertar el reporte en Supabase y responder con status `201` y el reporte completo incluyendo `codigo_seguimiento`.
2. IF faltan campos obligatorios (titulo, area_servicio, categoria, tipo_ubicacion), THEN THE SYSTEM SHALL responder con status `400` y un mensaje indicando qué campos faltan.
3. IF `tipo_ubicacion` es `gps` y faltan `latitud` o `longitud`, THEN THE SYSTEM SHALL responder con status `400`.
4. IF `tipo_ubicacion` es `manual` y falta `direccion`, THEN THE SYSTEM SHALL responder con status `400`.
5. IF `categoria` no es un valor válido del enum, THEN THE SYSTEM SHALL responder con status `400` listando las categorías permitidas.
6. THE SYSTEM SHALL aceptar `foto_url`, `descripcion`, `colonia`, `contacto_email` y `contacto_telefono` como campos opcionales.
7. WHEN el reporte se inserta exitosamente, THE SYSTEM SHALL retornar también los campos `justificacion_ia` y `clasificado_por_ia` en la respuesta.

### Requirement 3: Clasificación de Prioridad con IA

**User Story:** Como plataforma, quiero clasificar automáticamente la prioridad de cada reporte, para que los más urgentes se atiendan primero sin intervención manual.

#### Acceptance Criteria

1. WHEN se recibe un POST para crear reporte, THE SYSTEM SHALL llamar al módulo de IA antes de insertar en la base de datos, enviando título + descripción + categoría.
2. THE SYSTEM SHALL recibir de la IA un objeto con `prioridad` (Alta/Media/Baja) y `justificacion` (string corto).
3. IF la API de IA no responde en menos de 10 segundos, THEN THE SYSTEM SHALL usar el fallback: `{ prioridad: "Media", clasificado_por_ia: false }`.
4. IF la API de IA retorna un error o un formato inesperado, THEN THE SYSTEM SHALL usar el fallback sin interrumpir la creación del reporte.
5. THE SYSTEM SHALL guardar `justificacion_ia` y `clasificado_por_ia` en la tabla `reportes`.
6. IF la variable `ANTHROPIC_API_KEY` no está configurada, THEN THE SYSTEM SHALL usar el fallback directamente sin intentar llamar a la IA.

### Requirement 4: Listado de Reportes (GET /api/reportes)

**User Story:** Como administrador, quiero obtener la lista de reportes con filtros opcionales, para gestionar y priorizar la atención.

#### Acceptance Criteria

1. WHEN el backend recibe un GET sin query params, THE SYSTEM SHALL retornar todos los reportes ordenados por `created_at` descendente.
2. THE SYSTEM SHALL aceptar filtros opcionales por query string: `estado`, `prioridad`, `area_servicio`, `categoria`.
3. THE SYSTEM SHALL responder con `{ total: number, reportes: Report[] }`.
4. IF no hay reportes que coincidan con los filtros, THE SYSTEM SHALL responder con `{ total: 0, reportes: [] }` (status 200, no 404).

### Requirement 5: Búsqueda por Código de Seguimiento (GET /api/reportes/:codigo)

**User Story:** Como ciudadano, quiero buscar mi reporte por folio, para ver su estado actual y su historial de cambios.

#### Acceptance Criteria

1. WHEN el backend recibe un GET con un código válido (ej: REP-001), THE SYSTEM SHALL retornar el reporte completo junto con su `historial` de estados ordenado cronológicamente.
2. IF el código no existe en la base de datos, THEN THE SYSTEM SHALL responder con status `404` y un mensaje claro.
3. THE SYSTEM SHALL incluir en `historial` un array de objetos con: `estado_anterior`, `estado_nuevo`, `changed_at`.

### Requirement 6: Actualización de Estado (PATCH /api/reportes/:id/estado)

**User Story:** Como administrador, quiero cambiar el estado de un reporte, para reflejar el progreso de su atención.

#### Acceptance Criteria

1. WHEN el backend recibe un PATCH con un `id` (uuid) válido y un `estado` válido, THE SYSTEM SHALL actualizar el reporte y responder con status `200` y el reporte actualizado.
2. IF el `estado` enviado no es uno de los valores válidos del enum, THEN THE SYSTEM SHALL responder con status `400`.
3. IF el `id` no existe, THEN THE SYSTEM SHALL responder con status `404`.
4. THE SYSTEM SHALL confiar en que el trigger de la BD registra automáticamente el cambio en `historial_estados` — no necesita hacerlo manualmente.

### Requirement 7: Manejo de Errores Global

**User Story:** Como equipo de desarrollo, quiero un manejo de errores consistente, para que el frontend siempre reciba respuestas predecibles.

#### Acceptance Criteria

1. THE SYSTEM SHALL responder siempre en formato JSON: `{ "error": "mensaje" }` para errores.
2. THE SYSTEM SHALL loggear errores internos en console pero NUNCA exponer stack traces al cliente.
3. IF ocurre un error inesperado en cualquier ruta, THE SYSTEM SHALL responder con status `500` y un mensaje genérico.
