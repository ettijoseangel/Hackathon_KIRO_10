# Implementacion de la Capa de Acceso a Datos

## Resumen

Se implemento la capa completa de acceso a datos para la aplicacion de Reportes Ciudadanos de Monterrey, utilizando **Prisma ORM** como interfaz principal con la base de datos PostgreSQL hospedada en Supabase.

La arquitectura sigue una separacion clara en capas:

```
Rutas → Controladores → Servicios → Modelos → Prisma → PostgreSQL (Supabase)
```

---

## Partes de basedatos.md utilizadas

| Seccion de basedatos.md | Uso en la implementacion |
|---|---|
| Schema de Prisma (modelos, enums, relaciones) | `prisma/schema.prisma` — estructura completa |
| Seccion 2: `src/db/prisma.js` | `src/db/prisma.js` — singleton de PrismaClient |
| Seccion 1: Estructura de carpetas | Organizacion en `models/`, `services/`, `controllers/`, `routes/` |
| Seccion 3: Variables de entorno | `.env.example` con DATABASE_URL y DIRECT_URL |
| Seccion 6: Scripts de conveniencia | `package.json` con db:migrate, db:deploy, etc. |

### Extensiones explicitas a basedatos.md

Se agregaron dos campos al modelo `Reporte` que **no estaban en basedatos.md** pero son requeridos por `requirements.md` (Req 3):

- `justificacion_ia` (String?) — justificacion de la clasificacion de la IA
- `clasificado_por_ia` (Boolean, default: false) — indica si la prioridad fue asignada por IA

### Enums adaptados

basedatos.md indica: "Los enums tienen valores de ejemplo. Reemplazalos por los reales del proyecto antes de migrar."

Se mantuvieron los valores de basedatos.md ya que representan el dominio real:
- `AreaServicio`: AGUA, ALUMBRADO, BACHEO, RECOLECCION_BASURA, DRENAJE, OTRO
- `CategoriaReporte`: INFRAESTRUCTURA, SEGURIDAD, LIMPIEZA, SERVICIOS_PUBLICOS, OTRO
- `PrioridadReporte`: BAJA, MEDIA, ALTA, URGENTE
- `EstadoReporte`: PENDIENTE, EN_PROCESO, RESUELTO, CANCELADO
- `TipoUbicacion`: PUNTO, AREA

---

## Estructura de archivos creados

```
server/
├── prisma/
│   └── schema.prisma              # Modelos, enums, datasource
├── src/
│   ├── db/
│   │   └── prisma.js              # Instancia singleton de PrismaClient
│   ├── models/
│   │   ├── reporte.model.js       # CRUD puro de reportes
│   │   └── historialEstado.model.js # Consultas de historial
│   ├── services/
│   │   ├── reporte.service.js     # Logica de negocio (validacion + orquestacion)
│   │   └── iaClassifier.js        # Clasificacion de prioridad con Anthropic
│   ├── controllers/
│   │   └── reporte.controller.js  # Handlers HTTP
│   ├── routes/
│   │   └── reportes.js            # Definicion de rutas Express
│   ├── config/
│   │   └── supabaseClients.js     # Cliente Supabase JS (uso secundario)
│   ├── app.js                     # Configuracion Express (middleware, rutas, error handler)
│   └── index.js                   # Entry point
├── .env.example                   # Variables de entorno requeridas
└── package.json                   # Scripts y dependencias
```

---

## Endpoints implementados

| Metodo | Ruta | Descripcion | Req |
|--------|------|-------------|-----|
| GET | `/api/health` | Health check | Req 1 |
| POST | `/api/reportes` | Crear reporte (con clasificacion IA) | Req 2, 3 |
| GET | `/api/reportes` | Listar reportes (filtros opcionales) | Req 4 |
| GET | `/api/reportes/:codigo` | Buscar por codigo de seguimiento | Req 5 |
| PATCH | `/api/reportes/:id/estado` | Actualizar estado | Req 6 |

---

## Detalle por capa

### prisma/schema.prisma

- Dos modelos: `Reporte` y `HistorialEstado`
- Relacion 1:N (un reporte tiene muchas entradas de historial)
- Mapeo a tablas `reportes` y `historial_estados` (snake_case en BD)
- Campos mapeados con `@map()` para mantener camelCase en JS y snake_case en BD

### src/db/prisma.js

- Patron singleton para evitar multiples conexiones en hot-reload (desarrollo con nodemon)
- Logging configurado: queries + errors en desarrollo, solo errors en produccion

### src/models/reporte.model.js

Funciones exportadas:
- `crearReporte(datos)` — INSERT con generacion de codigo_seguimiento secuencial
- `listarReportes(filtros)` — SELECT con WHERE dinamico + count
- `buscarPorCodigo(codigo)` — SELECT + JOIN con historial
- `buscarPorId(id)` — SELECT simple por UUID
- `actualizarEstado(id, nuevoEstado)` — UPDATE + INSERT historial en transaccion

### src/models/historialEstado.model.js

Funciones exportadas:
- `obtenerHistorialPorReporte(reporteId)` — SELECT ordenado cronologicamente
- `crearEntradaHistorial(datos)` — INSERT manual (uso excepcional)

### src/services/iaClassifier.js

- Llama a la API de Anthropic (Claude claude-sonnet-4-20250514)
- Timeout de 10 segundos con AbortController
- Fallback automatico: `{ prioridad: 'MEDIA', clasificadoPorIa: false }`
- Si no hay ANTHROPIC_API_KEY → fallback inmediato sin llamada HTTP
- Valida que la respuesta contenga una prioridad del enum valido

### src/services/reporte.service.js

- Validacion completa de campos obligatorios y enums
- Validacion condicional de ubicacion (PUNTO requiere lat/lng, AREA requiere direccion)
- Orquesta clasificacion IA → insercion en BD
- Valida filtros de listado contra enums validos
- Validacion de UUID para actualizacion de estado

### src/controllers/reporte.controller.js

- 4 handlers: `crearReporte`, `listarReportes`, `buscarPorCodigo`, `actualizarEstado`
- Delega toda la logica a la capa de servicios
- Manejo de errores con `next(error)` para el error handler global
- Distingue entre HTTP 400 (validacion) y 404 (no encontrado)

### src/routes/reportes.js

- Router de Express montado en `/api/reportes`
- 4 rutas definidas

### src/app.js

- CORS configurado con CLIENT_ORIGIN
- Body parser JSON
- Router de reportes montado
- Servido de frontend estatico en produccion
- Error handler global (Req 7): loggea internamente, responde `{ error: "..." }` generico

---

## Variables de entorno requeridas

| Variable | Uso | Obligatoria |
|----------|-----|-------------|
| `DATABASE_URL` | Conexion Prisma (pooler, puerto 6543) | Si |
| `DIRECT_URL` | Migraciones Prisma (directa, puerto 5432) | Si (solo migraciones) |
| `SUPABASE_URL` | Cliente Supabase JS | No (uso secundario) |
| `SUPABASE_SECRET_KEY` | service_role key para Supabase JS | No (uso secundario) |
| `ANTHROPIC_API_KEY` | Clasificacion IA | No (usa fallback si falta) |
| `PORT` | Puerto del servidor (default: 3001) | No |
| `CLIENT_ORIGIN` | CORS origin (default: http://localhost:5173) | No |
| `NODE_ENV` | Entorno (development/production) | No |

---

## Comandos para poner en marcha

```bash
# 1. Instalar dependencias
cd server
npm install

# 2. Configurar variables de entorno
# Crear server/.env con DATABASE_URL y DIRECT_URL

# 3. Ejecutar primera migracion (crea tablas en Supabase)
npx prisma migrate dev --name init

# 4. Iniciar servidor en desarrollo
npm run dev
```

---

## Posibles mejoras futuras

1. **Paginacion**: Agregar limit/offset al listado de reportes para manejar grandes volumenes
2. **Indices**: Agregar indices en `area_servicio`, `estado`, `prioridad` para optimizar filtros frecuentes
3. **Rate limiting**: Proteger endpoint POST contra abuso
4. **Upload de fotos**: Integrar Supabase Storage para subir imagenes (usando supabaseClients.js)
5. **Autenticacion**: Agregar middleware de auth para el endpoint PATCH (solo admins)
6. **Websockets**: Notificaciones en tiempo real cuando cambia el estado de un reporte
7. **Cache**: Redis o cache en memoria para el listado de reportes (si el trafico lo amerita)
8. **Soft delete**: Cambiar eliminacion por un campo `deleted_at` si se necesita en el futuro

---

## Riesgos y consideraciones

1. **Generacion de codigo_seguimiento**: Actualmente es secuencial consultando el ultimo registro. En alta concurrencia podria haber colisiones. Considerar una secuencia de PostgreSQL (`SERIAL`) o un trigger en la BD para mayor robustez.
2. **Sin autenticacion**: Los endpoints son publicos. El PATCH deberia estar protegido para que solo admins cambien estados.
3. **Dependencia de Anthropic**: Si la API de Anthropic tiene downtime prolongado, todos los reportes se clasificaran como MEDIA. Considerar un sistema de reclasificacion posterior.
4. **Tamanio del pool de conexiones**: El pooler de Supabase tiene limites. Monitorear conexiones activas en produccion.
