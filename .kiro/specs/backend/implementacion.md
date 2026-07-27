# Implementacion General (Documentacion del Backend)

## Resumen

Se implemento la API REST completa para la aplicacion de **Reportes Ciudadanos de Monterrey**, incluyendo:

- Capa de datos con **Prisma ORM** contra PostgreSQL (Supabase)
- Modulo de IA con arquitectura de adaptadores (Anthropic Claude)
- Orientacion institucional automatica al crear reportes
- Tests unitarios y de integracion con Vitest
- Infraestructura Docker completa para deploy en AWS EC2

La arquitectura sigue una separacion clara en capas:

```
Rutas → Controladores → Servicios → Modelos → Prisma → PostgreSQL (Supabase)
                                  → ia/ (adaptadores) → Anthropic API
```

---

## Estructura de Archivos

```
server/
├── prisma/
│   ├── schema.prisma                   # Modelos, enums, datasource
│   └── migrations/
│       └── 20260726200916_init/        # Migracion inicial
├── src/
│   ├── index.js                        # Entry point (dotenv + listen)
│   ├── app.js                          # Config Express (CORS, rutas, error handler)
│   ├── db/
│   │   └── prisma.js                   # Singleton de PrismaClient
│   ├── models/
│   │   ├── reporte.model.js            # CRUD de reportes
│   │   ├── historialEstado.model.js    # Consultas de historial
│   │   └── orientacionIA.model.js      # CRUD de orientacion IA
│   ├── services/
│   │   ├── reporte.service.js          # Logica de negocio de reportes
│   │   ├── iaClassifier.js             # Wrapper de clasificacion (delega a ia/)
│   │   └── orientacionIA.service.js    # Logica de orientacion IA
│   ├── ia/
│   │   ├── iaInterface.js             # Contrato/interfaz de adaptadores
│   │   ├── anthropicAdapter.js        # Adaptador Anthropic (Claude)
│   │   ├── fallbacks.js               # Fallbacks centralizados
│   │   └── index.js                   # Factory/Registry de proveedores
│   ├── controllers/
│   │   ├── reporte.controller.js      # Handlers HTTP de reportes
│   │   └── guiaIA.controller.js       # Handler HTTP de guia IA
│   ├── routes/
│   │   ├── reportes.js                # Rutas /api/reportes
│   │   └── guiaIa.js                  # Rutas /api/v1/reportes/:id/guia-ia
│   ├── config/
│   │   └── supabaseClients.js         # Cliente Supabase JS (uso secundario)
│   └── __tests__/
│       ├── setup.test.js              # Configuracion de tests
│       ├── services/
│       │   ├── iaClassifier.test.js
│       │   ├── reporte.service.test.js
│       │   └── orientacionIA.service.test.js
│       └── integration/
│           └── endpoints.test.js      # Tests de integracion (5 endpoints)
├── Dockerfile                          # Imagen de produccion
├── Dockerfile.dev                      # Imagen de desarrollo (nodemon)
├── .env.example                        # Plantilla de variables
└── package.json                        # Scripts y dependencias

nginx/
├── Dockerfile                          # nginx:1.27-alpine + config
└── conf.d/
    └── default.conf                    # Reverse proxy + SPA

deploy/
└── deploy.sh                           # Script de deploy para EC2

docker-compose.yml                      # Base produccion
docker-compose.override.yml             # Override desarrollo local
```

---

## Endpoints Implementados

| Metodo | Ruta | Descripcion | Req |
|--------|------|-------------|-----|
| GET | `/api/health` | Health check | Req 1 |
| POST | `/api/reportes` | Crear reporte (con clasificacion IA + orientacion IA) | Req 2, 3, 8 |
| GET | `/api/reportes` | Listar reportes (filtros opcionales) | Req 4 |
| GET | `/api/reportes/:codigo` | Buscar por codigo de seguimiento (con historial) | Req 5 |
| PATCH | `/api/reportes/:id/estado` | Actualizar estado (con historial) | Req 6 |
| GET | `/api/v1/reportes/:reporteId/guia-ia` | Consultar orientacion IA (solo lectura) | Req 8 |

---

## Modelos de Datos (Prisma)

### Reporte
- Campos principales: titulo, descripcion, areaServicio, categoria, prioridad, estado
- Campos de ubicacion: tipoUbicacion, latitud, longitud, direccion, colonia, municipio
- Campos de IA: justificacionIa (String?), clasificadoPorIa (Boolean)
- Campos de contacto: contactoEmail, contactoTelefono
- Relaciones: 1:N con HistorialEstado, 1:1 con OrientacionIA

### HistorialEstado
- Registra cada cambio de estado con estadoAnterior, estadoNuevo, comentario
- Ordenado cronologicamente por changedAt

### OrientacionIA
- Relacion 1:1 con Reporte (se crea automaticamente al crear el reporte)
- Campos: institucionNombre, institucionDescripcion, institucionSitioWeb, confianza
- Campos JSON: mediosContacto, proximosPasos
- Campos de control: requiereMasInformacion, mensajeFallback, modeloIA, promptVersion

### Enums
- `AreaServicio`: AGUA, ALUMBRADO, BACHEO, RECOLECCION_BASURA, DRENAJE, OTRO
- `CategoriaReporte`: INFRAESTRUCTURA, SEGURIDAD, LIMPIEZA, SERVICIOS_PUBLICOS, OTRO
- `PrioridadReporte`: BAJA, MEDIA, ALTA, URGENTE
- `EstadoReporte`: PENDIENTE, EN_PROCESO, RESUELTO, CANCELADO
- `TipoUbicacion`: PUNTO, AREA

---

## Modulo de IA (src/ia/)

### Arquitectura de Adaptadores (Req 9)

```
ia/index.js (Factory/Registry)
├── iaInterface.js       → Contrato: clasificarPrioridad + generarOrientacion
├── anthropicAdapter.js  → Implementacion concreta (Claude claude-sonnet-4-20250514)
└── fallbacks.js         → CLASIFICACION_FALLBACK + ORIENTACION_FALLBACK
```

### Comportamiento
- **Factory** selecciona adaptador segun `AI_PROVIDER` (default: anthropic)
- **Fallbacks automaticos**: si no hay API key, timeout, o error → fallback sin excepcion
- **Timeout**: 10 segundos con AbortController
- **Clasificacion fallback**: `{ prioridad: 'MEDIA', justificacion: null, clasificadoPorIa: false }`
- **Orientacion fallback**: requiereMasInformacion: true con mensaje generico

### Flujo de Creacion de Reporte
1. Validacion de campos → `reporte.service.js`
2. Clasificacion de prioridad → `iaClassifier.js` → `ia/index.js` → `anthropicAdapter.js`
3. Insercion en BD → `reporte.model.js`
4. Generacion de orientacion IA → `orientacionIA.service.js` → `ia/index.js` → `anthropicAdapter.js`
5. Persistencia de orientacion → `orientacionIA.model.js`

### Extensibilidad
Para agregar un nuevo proveedor (ej: OpenAI):
1. Crear `src/ia/openaiAdapter.js` que exporte `clasificarPrioridad` y `generarOrientacion`
2. Registrarlo en `ADAPTERS` de `src/ia/index.js`
3. Configurar `AI_PROVIDER=openai` en `.env`

---

## Testing

### Framework: Vitest

Scripts disponibles:
- `npm test` → `vitest run` (ejecucion unica)
- `npm run test:watch` → `vitest` (modo watch)
- `npm run test:coverage` → `vitest run --coverage`

### Tests Unitarios (src/__tests__/services/)
- `iaClassifier.test.js` — Clasificacion de prioridad con mocks
- `reporte.service.test.js` — Validaciones, logica de negocio
- `orientacionIA.service.test.js` — Generacion y consulta de orientacion

### Tests de Integracion (src/__tests__/integration/)
- `endpoints.test.js` — Los 5 endpoints principales con supertest

---

## Docker y Deployment

### server/Dockerfile (Produccion)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY prisma ./prisma
RUN npx prisma generate
USER node
EXPOSE 3001
CMD ["node", "src/index.js"]
```
- Solo dependencias de produccion
- Ejecuta como usuario non-root (seguridad)
- Incluye prisma generate para el cliente

### server/Dockerfile.dev (Desarrollo)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src ./src
COPY prisma ./prisma
RUN npx prisma generate
EXPOSE 3001
CMD ["npx", "nodemon", "--watch", "src", "--exec", "node", "src/index.js"]
```
- Incluye devDependencies (nodemon)
- Hot-reload automatico

### docker-compose.yml (Produccion en EC2)
- **Servicio `api`**: build desde server/Dockerfile, expose 3001 (solo interno), env_file .env, red app_net
- **Servicio `nginx`**: build desde nginx/Dockerfile, publica puerto 80, sirve SPA + proxy a API
- **Red `app_net`**: bridge driver (comunicacion interna entre contenedores)
- No hay servicio de BD (Supabase es externo)

### docker-compose.override.yml (Desarrollo Local)
- Se aplica automaticamente al ejecutar `docker compose up` en local
- Override del API: usa Dockerfile.dev, monta volumen para hot-reload, publica 3001 directo
- Override de nginx: publica en 8080 (para evitar conflicto con puerto 80 del host)
- **NO debe existir en el servidor EC2 de produccion**

### nginx/ (Reverse Proxy)
- `nginx:1.27-alpine`
- Sirve el SPA de React con fallback a index.html (`try_files $uri /index.html`)
- Proxy transparente: `/api/` → `http://api:3001/api/`
- Solo HTTP (puerto 80), sin TLS en esta version

### deploy/deploy.sh (Script de Deploy EC2)
```bash
#!/usr/bin/env bash
set -e
cd /home/$USER/app
git pull origin main
cd client && npm ci && npm run build && cd ..
docker compose up -d --build
docker image prune -f
```

---

## Variables de Entorno Requeridas

| Variable | Uso | Obligatoria |
|----------|-----|-------------|
| `DATABASE_URL` | Conexion Prisma (pooler, puerto 6543) | Si |
| `DIRECT_URL` | Migraciones Prisma (directa, puerto 5432) | Si (solo migraciones) |
| `SUPABASE_URL` | Cliente Supabase JS | No (uso secundario) |
| `SUPABASE_SECRET_KEY` | service_role key para Supabase JS | No (uso secundario) |
| `ANTHROPIC_API_KEY` | Clasificacion y orientacion IA | No (usa fallback si falta) |
| `AI_PROVIDER` | Proveedor IA activo (default: anthropic) | No |
| `PORT` | Puerto del servidor (default: 3001) | No |
| `CLIENT_ORIGIN` | CORS origin (default: http://localhost:5173) | No |
| `NODE_ENV` | Entorno (development/production) | No |

---

## Dependencias

### Produccion
| Paquete | Version | Uso |
|---------|---------|-----|
| `@prisma/client` | ^6.9.0 | ORM PostgreSQL |
| `@supabase/supabase-js` | ^2.110.8 | Cliente Supabase (uso secundario) |
| `cors` | ^2.8.6 | Middleware CORS |
| `dotenv` | ^17.4.2 | Variables de entorno |
| `express` | ^5.2.1 | Framework HTTP |

### Desarrollo
| Paquete | Version | Uso |
|---------|---------|-----|
| `nodemon` | ^3.1.14 | Hot-reload en desarrollo |
| `prisma` | ^6.9.0 | CLI de migraciones |
| `supertest` | ^7.2.2 | Tests de integracion HTTP |
| `vitest` | ^4.1.10 | Framework de testing |

---

## Comandos para Poner en Marcha

### Desarrollo Local (sin Docker)
```bash
cd server
npm install
# Crear .env con DATABASE_URL, DIRECT_URL, ANTHROPIC_API_KEY
npx prisma migrate dev --name init
npm run dev
```

### Desarrollo Local (con Docker)
```bash
# Desde la raiz del proyecto
docker compose up --build
# API en http://localhost:3001
# Frontend en http://localhost:8080
```

### Produccion (EC2)
```bash
# En el servidor EC2:
cd /home/$USER/app
# Crear .env con variables de produccion
# NO debe existir docker-compose.override.yml
docker compose up -d --build
# La app queda accesible en http://<IP_PUBLICA>:80
```

---

## Decisiones Arquitecturales

1. **Prisma sobre cliente Supabase directo**: Migraciones versionadas, type-safety, relaciones declarativas
2. **Adaptadores de IA**: Permite cambiar proveedor sin tocar logica de negocio (SOLID - OCP/DIP)
3. **Fallbacks no-throw**: La IA nunca bloquea la creacion de un reporte
4. **Orientacion persistida**: Se consulta sin re-invocar la IA (endpoint GET de solo lectura)
5. **Docker multi-stage**: Produccion sin devDependencies, desarrollo con hot-reload
6. **nginx como gateway**: Unico punto de entrada (puerto 80), API no expuesta directamente

---

## Posibles Mejoras Futuras

1. **Paginacion**: Agregar limit/offset al listado de reportes
2. **Indices BD**: En area_servicio, estado, prioridad para optimizar filtros
3. **Rate limiting**: Proteger POST contra abuso
4. **Upload de fotos**: Supabase Storage para imagenes
5. **Autenticacion**: Middleware de auth para PATCH (solo admins)
6. **TLS/HTTPS**: Agregar certbot/Let's Encrypt al nginx
7. **CI/CD**: GitHub Actions para build, test y deploy automatico
8. **Monitoring**: Health checks en Docker + alertas
9. **Cache**: Redis para listados frecuentes
10. **Reclasificacion IA**: Cola para reintentar clasificaciones fallback

---

## Riesgos y Consideraciones

1. **Codigo de seguimiento secuencial**: En alta concurrencia podria haber colisiones. Considerar secuencia PostgreSQL.
2. **Sin autenticacion**: Endpoints publicos. El PATCH deberia estar protegido.
3. **Dependencia de Anthropic**: Downtime prolongado = todos los reportes con prioridad MEDIA y orientacion incompleta.
4. **Pool de conexiones**: Monitorear limites del pooler de Supabase en produccion.
5. **Sin HTTPS**: El deploy actual es HTTP-only. No apto para datos sensibles sin TLS.
6. **docker-compose.override.yml en prod**: Si se copia por error al servidor, sobreescribe la configuracion. Documentar exclusion.
