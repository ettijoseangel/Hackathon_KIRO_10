# Requirements Document

## Introduction
Servidor backend en Express que expone una API REST para la plataforma de Reportes Ciudadanos de Monterrey. Se conecta a Supabase (Postgres) para persistir reportes y su historial de estados. Incluye un módulo de IA, agnósticos al proveedor (Anthropic, OpenAI, Google, un modelo self-hosted, etc.), integrados detrás de una interfaz común:
1. **Orientación institucional** (institución competente, medios de contacto, próximos pasos), que también se genera durante la creación del reporte y se persiste para consulta posterior.

El proveedor de IA concreto se selecciona por configuración (variable de entorno), no está hardcodeado en la lógica de negocio; ver Requirement 9.

## Glossary
- **Express**: Framework de Node.js para crear servidores HTTP.
- **Supabase**: Plataforma BaaS (Backend as a Service) basada en Postgres.
- **service_role key**: Llave de Supabase con permisos administrativos que salta RLS.
- **anon key**: Llave pública de Supabase con permisos restringidos por RLS.
- **RLS**: Row Level Security — políticas de acceso a nivel de fila en Postgres.
- **IA Classifier**: Módulo que llama al proveedor de IA configurado para clasificar la prioridad del reporte.
- **Orientación IA**: Módulo que llama al proveedor de IA configurado para identificar la institución competente, sus medios de contacto y los próximos pasos a seguir para un reporte. Se persiste en la tabla `orientacion_ia`.
- **Proveedor de IA**: Servicio externo de modelos de lenguaje (ej. Anthropic, OpenAI, Google, o un modelo self-hosted) que resuelve las llamadas de clasificación y orientación. Es intercambiable vía configuración; el resto del sistema no depende de un proveedor específico.
- **Adaptador de IA**: Capa de código que traduce entre la interfaz interna del sistema (`clasificarPrioridad`, `generarOrientacion`) y el formato específico de la API de cada proveedor de IA.
- **Fallback**: Comportamiento por defecto cuando la IA falla (prioridad = "Media"; orientación = `requiere_mas_informacion: true`).
- **codigo_seguimiento**: Identificador público del reporte (REP-001, REP-002...) generado por trigger en la BD.
- **historial_estados**: Tabla que registra automáticamente cada cambio de estado de un reporte.
- **orientacion_ia**: Tabla que persiste el resultado del módulo de Orientación IA para cada reporte (relación 1:1 con `reportes`).

## Requirements

### Requirement 1: Inicialización del Servidor

**User Story:** Como equipo de desarrollo, queremos un servidor Express configurado correctamente, para poder agregar rutas y middleware de forma incremental.

#### Acceptance Criteria

1. THE SYSTEM SHALL escuchar en el puerto definido por la variable de entorno `PORT` (default: 3001).
2. THE SYSTEM SHALL responder con `{ "status": "ok" }` en `GET /api/health` para verificar que el servidor está corriendo.
3. THE SYSTEM SHALL parsear JSON del body de las peticiones entrantes (`express.json()`).
4. THE SYSTEM SHALL configurar CORS para permitir peticiones desde `CLIENT_ORIGIN`.
5. THE SYSTEM SHALL exponer únicamente la API (`/api/...`) — **el frontend estático NO lo sirve Express**; en producción lo sirve el contenedor `nginx` (montando `client/dist` como volumen de solo lectura), tal como se define en el design document de despliegue (EC2 + Docker Compose).

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
8. WHEN el reporte se inserta exitosamente, THE SYSTEM SHALL invocar además el módulo de **Orientación IA** (Requirement 8) y persistir su resultado en `orientacion_ia`, asociado al `id` del reporte recién creado.

### Requirement 3: Clasificación de Prioridad con IA

**User Story:** Como plataforma, quiero recibir automáticamente la orientacion institucional de cada reporte, para saber como proceder y a donde hacer mi queja.

#### Acceptance Criteria

1. WHEN se recibe un POST para crear reporte, THE SYSTEM SHALL llamar al módulo de IA despues de insertar en la base de datos, enviando los parametros que necesita (ver implementacioIA.md).
2. THE SYSTEM SHALL recibir de la IA un objeto con (ver implementacioIA.md).
3. IF la API de IA no responde en menos de 10 segundos, THEN THE SYSTEM SHALL usar el fallback: `{ Error: "En este momento no tenemos esta institucion. }`.
4. IF la API de IA retorna un error o un formato inesperado, THEN THE SYSTEM SHALL usar el fallback sin interrumpir la creación del reporte.
5. THE SYSTEM SHALL guardar el objeto en la tabla `OrientacionIA`.
6. IF no hay credenciales configuradas para el proveedor de IA activo (ej. `AI_PROVIDER_API_KEY`), THEN THE SYSTEM SHALL usar el fallback directamente sin intentar llamar a la IA.

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

**User Story:** Como usuario, quiero cambiar el estado de un reporte, para reflejar el progreso de su atención.

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

### Requirement 8: Orientación IA (institución, medios de contacto, próximos pasos)

**User Story:** Como ciudadano, quiero que la plataforma me indique qué institución atiende mi reporte y cómo contactarla, para saber cómo darle seguimiento fuera de la plataforma.

#### Acceptance Criteria

1. WHEN se crea un reporte exitosamente (Requirement 2), THE SYSTEM SHALL invocar el módulo de Orientación IA enviando título, descripción, categoría y ubicación del reporte, **antes o inmediatamente después** de la inserción del reporte (en la misma operación de creación, no en una llamada separada del cliente).
2. THE SYSTEM SHALL recibir de la IA un objeto con: institución identificada (nombre, descripción, sitio web, nivel de confianza), medios de contacto (tipo, valor, horario) y próximos pasos (orden, título, descripción).
3. THE SYSTEM SHALL persistir ese resultado en la tabla `orientacion_ia`, asociado por `reporte_id` (relación 1:1).
4. IF la IA no logra identificar una institución con suficiente certeza, THEN THE SYSTEM SHALL guardar `requiere_mas_informacion: true` junto con un `mensaje_fallback` explicativo, sin interrumpir la creación del reporte.
5. IF la API de IA no responde o falla por cualquier razón, THEN THE SYSTEM SHALL continuar con la creación del reporte (no bloqueante) y dejar `orientacion_ia` sin registro o con `requiere_mas_informacion: true`, según se defina en `implementacionIA.md`.
6. THE SYSTEM SHALL exponer `POST /api/v1/reportes/:reporte_id/guia-ia` como endpoint de **solo lectura**: retorna el registro de `orientacion_ia` ya guardado para ese reporte. **No vuelve a invocar a la IA.**
7. THE SYSTEM SHALL exponer `GET /api/v1/reportes/:reporte_id/guia-ia` **sin autenticación** (no requiere Bearer Token / JWT).
8. IF no existe un registro de `orientacion_ia` para el `reporte_id` indicado, THEN THE SYSTEM SHALL responder con status `404`.
9. IF el `reporte_id` no corresponde a ningún reporte existente, THEN THE SYSTEM SHALL responder con status `404`.
10. THE SYSTEM SHALL seguir el detalle de implementación (schemas exactos de entrada/salida de la IA, prompts, manejo de casos ambiguos) definido en `implementacionIA.md`, el cual es la fuente de verdad sobre el comportamiento del módulo de Orientación IA.

### Requirement 9: Independencia del Proveedor de IA

**User Story:** Como equipo de desarrollo, queremos poder cambiar de proveedor de IA (Anthropic, OpenAI, Google, un modelo self-hosted, etc.) sin reescribir la lógica de negocio, para no quedar atados a un solo vendor ni a los costos/disponibilidad de uno en particular.

#### Acceptance Criteria

1. THE SYSTEM SHALL definir una interfaz interna única para IA (ej. `clasificarPrioridad(...)`, `generarOrientacion(...)`) que no exponga detalles del proveedor concreto (nombres de modelo, formato de request/response propietario, SDKs específicos) al resto del código (rutas, controllers, servicios de negocio).
2. THE SYSTEM SHALL seleccionar el proveedor de IA activo mediante una variable de entorno (ej. `AI_PROVIDER=anthropic|openai|google|otro`), sin requerir cambios de código para alternar entre proveedores ya soportados.
3. THE SYSTEM SHALL aislar en un módulo "adaptador" por proveedor (ej. `services/ia/anthropicAdapter.js`, `services/ia/openaiAdapter.js`) todo lo específico de esa API: autenticación, nombre de modelo, formato del prompt, parseo de la respuesta.
4. THE SYSTEM SHALL mantener el mismo contrato de salida (`{ prioridad, justificacion, clasificado_por_ia }` para el clasificador; el schema de orientación descrito en Requirement 8) sin importar qué proveedor esté activo.
5. IF se agrega un nuevo proveedor de IA, THEN THE SYSTEM SHALL requerir únicamente: (a) un nuevo adaptador que implemente la interfaz interna, y (b) su registro en la configuración — sin modificar rutas, controllers, ni la lógica de persistencia en `reportes` u `orientacion_ia`.
6. THE SYSTEM SHALL aplicar el mismo comportamiento de fallback y timeout (Requirement 3.3–3.4, Requirement 8.5) independientemente del proveedor configurado; el fallback no es responsabilidad de cada adaptador individual, sino de la capa que los invoca.
7. THE SYSTEM SHALL documentar en `implementacionIA.md` qué proveedores están soportados actualmente y cómo agregar uno nuevo, manteniendo ese documento como fuente de verdad sobre la configuración vigente.