# ⚙️ Backend - Reportes Ciudadanos

> API REST construida con Express, Prisma y Supabase para gestión de reportes comunitarios con orientación institucional mediante IA.

[![Express](https://img.shields.io/badge/Express-5.2-green.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.9-indigo.svg)](https://www.prisma.io/)
[![Node.js](https://img.shields.io/badge/Node.js-20-brightgreen.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue.svg)](https://supabase.com/)

---

## 📖 Descripción

Este es el backend de **Reportes Ciudadanos**, una API REST robusta y escalable que gestiona reportes ciudadanos, proporciona orientación institucional mediante inteligencia artificial configurable (Claude, Gemini, etc.), y mantiene un historial completo de estados de cada reporte.

---

## 🚀 Stack Tecnológico

### Core
- **Node.js 20** - Runtime JavaScript del lado del servidor
- **Express 5.2** - Framework web minimalista y rápido
- **Prisma 6.9** - ORM moderno con tipado fuerte
- **PostgreSQL** - Base de datos relacional gestionada por Supabase

### Integración con IA
- **Proveedor configurable** - Soporta múltiples proveedores mediante variables de entorno:
  - **Claude** (Anthropic) - vía `ANTHROPIC_API_KEY`
  - **Gemini** (Google) - vía `GEMINI_API_KEY` (versión gratuita disponible)
  - Extensible a otros proveedores

### Seguridad
- **Helmet** - Protección de headers HTTP
- **express-rate-limit** - Limitación de tasa de peticiones
- **xss** - Sanitización de inputs contra XSS
- **CORS** - Control de acceso cross-origin

### Desarrollo y Testing
- **Vitest** - Framework de testing rápido
- **Supertest** - Testing de endpoints HTTP
- **Nodemon** - Hot-reload en desarrollo
- **Winston** - Logging estructurado
- **Standard.js** - Linter de código

### Documentación
- **Swagger UI** - Documentación interactiva de API
- **swagger-jsdoc** - Generación automática de spec OpenAPI

---

## 📁 Estructura del Proyecto

```
server/
├── prisma/
│   ├── schema.prisma        # Definición del modelo de datos
│   └── migrations/          # Migraciones de base de datos
│
├── src/
│   ├── config/              # Configuración (Supabase, logger)
│   │   ├── supabase.js
│   │   └── logger.js
│   │
│   ├── controllers/         # Lógica de negocio (handlers de rutas)
│   │   ├── reporteController.js
│   │   └── orientacionController.js
│   │
│   ├── routes/              # Definición de endpoints RESTful
│   │   ├── reporteRoutes.js
│   │   └── orientacionRoutes.js
│   │
│   ├── services/            # Servicios de negocio
│   │   ├── reporteService.js      # CRUD de reportes
│   │   ├── orientacionService.js  # Generación de orientación IA
│   │   └── iaClassifier.js        # Clasificación de prioridad (desactivado)
│   │
│   ├── middleware/          # Middlewares (validación, rate limiting)
│   │   ├── validationMiddleware.js
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   │
│   ├── db/                  # Cliente de Prisma
│   │   └── client.js
│   │
│   ├── ia/                  # Módulos de inteligencia artificial
│   │   ├── providers/       # Proveedores de IA (Claude, Gemini)
│   │   └── prompts/         # Plantillas de prompts
│   │
│   ├── models/              # Modelos de validación y DTOs
│   │
│   ├── utils/               # Utilidades generales
│   │
│   ├── __tests__/           # Tests de integración
│   │   ├── reportes.test.js
│   │   └── orientacion.test.js
│   │
│   └── server.js            # Configuración del servidor Express
│
├── index.js                 # Punto de entrada de la aplicación
├── .env.example             # Plantilla de variables de entorno
├── package.json             # Dependencias y scripts
├── vitest.config.js         # Configuración de tests
├── Dockerfile               # Imagen Docker para producción
└── Dockerfile.dev           # Imagen Docker para desarrollo
```

---

## 📋 Prerequisitos

- **Node.js** v18 o superior
- **npm** v9 o superior
- **Cuenta de Supabase** (para PostgreSQL gestionado)
- **API Key de proveedor de IA** (Claude o Gemini)
- **Git** para control de versiones

---

## ⚙️ Instalación y Configuración

### 1. Instalar Dependencias

```bash
cd server
npm install
```

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo y edítalo con tus credenciales:

```bash
cp .env.example .env
```

Contenido de `server/.env`:

```env
# === Prisma (conexión a Supabase/PostgreSQL) ===
# Pooler (pgbouncer) - usada por la app en runtime (puerto 6543)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Conexión directa - usada SOLO por Prisma Migrate (puerto 5432)
DIRECT_URL="postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres"

# === Supabase (cliente JS - uso secundario: storage, auth) ===
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SECRET_KEY=tu-service-role-key

# === IA (orientación institucional) ===
# Proveedor configurable: claude (Anthropic) o gemini (Google)
ANTHROPIC_API_KEY=sk-ant-tu-api-key        # Si usas Claude
# GEMINI_API_KEY=tu-api-key-aqui           # Si usas Gemini (versión gratuita)

# === Servidor ===
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development

# === Documentación ===
DOCS_URL=http://localhost:3001/api/docs
API_ENDPOINT=http://localhost:3001
```

> ⚠️ **Seguridad:** Nunca subas archivos `.env` a Git. Ya están incluidos en `.gitignore`.

---

### 3. Configurar Base de Datos con Prisma

```bash
# Generar cliente de Prisma
npm run db:generate

# Ejecutar migraciones pendientes
npm run db:migrate

# (Opcional) Abrir Prisma Studio para visualizar datos
npm run db:studio
```

---

## 🎮 Comandos Disponibles

### Desarrollo

```bash
npm run dev
```
Inicia el servidor con nodemon (hot-reload automático) en `http://localhost:3001`

### Producción

```bash
npm start
```
Inicia el servidor en modo producción (sin hot-reload)

### Base de Datos

```bash
# Generar cliente de Prisma (después de cambios en schema)
npm run db:generate

# Crear nueva migración
npm run db:migrate

# Aplicar migraciones en producción
npm run db:deploy

# Abrir Prisma Studio (GUI visual de BD)
npm run db:studio

# Resetear BD (SOLO desarrollo, elimina todos los datos)
npm run db:reset
```

### Testing

```bash
# Ejecutar tests una vez (CI)
npm test

# Ejecutar tests en modo watch (desarrollo)
npm run test:watch

# Reporte de cobertura
npm run test:coverage
```

### Linting

```bash
npm run lint:fix
```
Ejecuta Standard.js y corrige errores automáticamente

---

## 📡 API Endpoints

### Reportes

| Método | Endpoint                     | Descripción                                | Body/Params                     |
|--------|------------------------------|--------------------------------------------|---------------------------------|
| POST   | `/api/reportes`              | Crear reporte con orientación IA           | `multipart/form-data`           |
| GET    | `/api/reportes`              | Listar reportes (con filtros opcionales)   | Query: `estado`, `prioridad`, etc.|
| GET    | `/api/reportes/:codigo`      | Buscar por código de seguimiento           | Param: `codigo` (REP-XXX)       |
| GET    | `/api/reportes/:id`          | Obtener reporte por ID                     | Param: `id` (UUID)              |
| PATCH  | `/api/reportes/:id/estado`   | Actualizar estado de un reporte            | Body: `{ estado, comentario }`  |

### Orientación con IA

| Método | Endpoint                         | Descripción                           | Params                |
|--------|----------------------------------|---------------------------------------|-----------------------|
| GET    | `/api/v1/reportes/:id/guia-ia`   | Obtener orientación IA de un reporte  | Param: `id` (UUID)    |

### Sistema

| Método | Endpoint       | Descripción                    |
|--------|----------------|--------------------------------|
| GET    | `/health`      | Health check del servidor      |
| GET    | `/api-docs`    | Documentación Swagger UI       |

---

## 📝 Ejemplos de Uso

### Crear Reporte

```bash
POST /api/reportes
Content-Type: multipart/form-data

{
  "titulo": "Bache profundo en Av. Constitución",
  "descripcion": "Bache de aproximadamente 30cm afectando el tránsito",
  "areaServicio": "BACHEO",
  "categoria": "INFRAESTRUCTURA",
  "tipoUbicacion": "PUNTO",
  "latitud": 25.6866,
  "longitud": -100.3161,
  "direccion": "Av. Constitución 123",
  "colonia": "Centro",
  "contactoEmail": "usuario@example.com",
  "contactoTelefono": "8112345678",
  "foto": <archivo>
}
```

**Respuesta (201 Created):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "codigoSeguimiento": "REP-001",
  "titulo": "Bache profundo en Av. Constitución",
  "prioridad": "MEDIA",
  "estado": "PENDIENTE",
  "createdAt": "2025-01-27T10:00:00.000Z",
  ...
}
```

---

### Listar Reportes con Filtros

```bash
GET /api/reportes?estado=PENDIENTE&prioridad=ALTA&limit=10
```

**Respuesta (200 OK):**
```json
{
  "reportes": [
    {
      "id": "...",
      "codigoSeguimiento": "REP-001",
      "titulo": "...",
      "estado": "PENDIENTE",
      "prioridad": "ALTA",
      ...
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### Buscar por Código de Seguimiento

```bash
GET /api/reportes/REP-001
```

**Respuesta (200 OK):**
```json
{
  "id": "...",
  "codigoSeguimiento": "REP-001",
  "titulo": "Bache profundo en Av. Constitución",
  "descripcion": "...",
  "estado": "PENDIENTE",
  "prioridad": "MEDIA",
  "historialEstados": [
    {
      "estadoAnterior": null,
      "estadoNuevo": "PENDIENTE",
      "changedAt": "2025-01-27T10:00:00.000Z"
    }
  ]
}
```

### Actualizar Estado

```bash
PATCH /api/reportes/123e4567-e89b-12d3-a456-426614174000/estado
Content-Type: application/json

{
  "estado": "EN_PROCESO",
  "comentario": "El equipo de bacheo ha sido notificado"
}
```

**Respuesta (200 OK):**
```json
{
  "id": "...",
  "estado": "EN_PROCESO",
  "updatedAt": "2025-01-27T11:00:00.000Z"
}
```

### Obtener Orientación con IA

```bash
GET /api/v1/reportes/123e4567-e89b-12d3-a456-426614174000/guia-ia
```

**Respuesta (200 OK):**
```json
{
  "institucionNombre": "Municipio de Monterrey - Dirección de Obras Públicas",
  "mediosContacto": {
    "telefono": "81-2020-5555",
    "email": "obrapublica@monterrey.gob.mx",
    "horario": "Lunes a Viernes, 8:00 AM - 4:00 PM"
  },
  "proximosPasos": [
    "Guardar el código de seguimiento REP-001",
    "Contactar al municipio con el código",
    "Esperar confirmación de recepción"
  ],
  "requiereMasInformacion": false
}
```

---

## 🗄️ Modelo de Datos (Prisma)

### Tablas Principales

#### `reportes`
Almacena la información principal de cada reporte ciudadano.

| Campo                | Tipo                 | Descripción                                            |
|----------------------|----------------------|--------------------------------------------------------|
| `id`                 | UUID (PK)            | Identificador único del reporte                        |
| `codigoSeguimiento`  | String (unique)      | Código público (formato: REP-XXX)                      |
| `titulo`             | String               | Título breve del reporte                               |
| `descripcion`        | String (nullable)    | Descripción detallada del problema                     |
| `areaServicio`       | Enum                 | AGUA, ALUMBRADO, BACHEO, RECOLECCION_BASURA, DRENAJE, OTRO |
| `categoria`          | Enum                 | INFRAESTRUCTURA, SEGURIDAD, LIMPIEZA, SERVICIOS_PUBLICOS, OTRO |
| `prioridad`          | Enum                 | BAJA, MEDIA, ALTA, URGENTE                             |
| `estado`             | Enum                 | PENDIENTE, EN_PROCESO, RESUELTO, CANCELADO             |
| `tipoUbicacion`      | Enum                 | PUNTO, AREA                                            |
| `latitud`            | Decimal (nullable)   | Coordenada GPS (9,6)                                   |
| `longitud`           | Decimal (nullable)   | Coordenada GPS (9,6)                                   |
| `direccion`          | String (nullable)    | Dirección textual                                      |
| `colonia`            | String (nullable)    | Nombre de la colonia                                   |
| `municipio`          | String               | Municipio (default: "Monterrey")                       |
| `fotoUrl`            | String (nullable)    | URL de la foto en Supabase Storage                     |
| `contactoEmail`      | String (nullable)    | Email del reportante                                   |
| `contactoTelefono`   | String (nullable)    | Teléfono del reportante                                |
| `justificacionIa`    | String (nullable)    | Campo reservado para futura clasificación con IA       |
| `clasificadoPorIa`   | Boolean              | Actualmente false (funcionalidad desactivada)          |
| `createdAt`          | DateTime             | Fecha de creación                                      |
| `updatedAt`          | DateTime             | Fecha de última actualización                          |

#### `historial_estados`
Registra cada cambio de estado de un reporte.

| Campo            | Tipo               | Descripción                           |
|------------------|--------------------|---------------------------------------|
| `id`             | UUID (PK)          | Identificador único                   |
| `reporteId`      | UUID (FK)          | ID del reporte relacionado            |
| `estadoAnterior` | Enum (nullable)    | Estado antes del cambio               |
| `estadoNuevo`    | Enum               | Nuevo estado                          |
| `comentario`     | String (nullable)  | Comentario sobre el cambio            |
| `changedAt`      | DateTime           | Fecha del cambio                      |

---

#### `orientacion_ia`
Almacena la orientación institucional generada por IA para cada reporte.

| Campo                     | Tipo                | Descripción                                        |
|---------------------------|---------------------|----------------------------------------------------|
| `id`                      | UUID (PK)           | Identificador único                                |
| `reporteId`               | UUID (FK, unique)   | ID del reporte (relación 1:1)                      |
| `institucionNombre`       | String (nullable)   | Nombre de la institución responsable               |
| `institucionDescripcion`  | String (nullable)   | Descripción de la institución                      |
| `institucionSitioWeb`     | String (nullable)   | URL del sitio web oficial                          |
| `confianza`               | Decimal (nullable)  | Nivel de confianza de la recomendación (0-1)       |
| `mediosContacto`          | JSON (nullable)     | Teléfonos, emails, horarios                        |
| `proximosPasos`           | JSON (nullable)     | Array de pasos recomendados                        |
| `requiereMasInformacion`  | Boolean             | Si se necesita más info del usuario                |
| `mensajeFallback`         | String (nullable)   | Mensaje si la IA no pudo generar orientación       |
| `modeloIA`                | String (nullable)   | Proveedor de IA usado (claude, gemini, etc.)       |
| `promptVersion`           | String (nullable)   | Versión del prompt utilizado                       |
| `createdAt`               | DateTime            | Fecha de creación                                  |
| `updatedAt`               | DateTime            | Fecha de última actualización                      |

### Triggers Automáticos en Supabase

#### Generación de Código de Seguimiento
```sql
CREATE OR REPLACE FUNCTION generar_codigo_seguimiento()
RETURNS TRIGGER AS $$
BEGIN
  NEW.codigo_seguimiento := 'REP-' || LPAD(nextval('reportes_seq')::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Historial de Estados
```sql
CREATE OR REPLACE FUNCTION registrar_cambio_estado()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO historial_estados (reporte_id, estado_anterior, estado_nuevo)
  VALUES (NEW.id, OLD.estado, NEW.estado);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 🤖 Integración con IA

### Proveedor de IA Configurable

El backend soporta múltiples proveedores de IA mediante variables de entorno. El sistema selecciona automáticamente el proveedor según la API key configurada.

#### Proveedores Soportados

| Proveedor | Variable de Entorno   | Modelo                | Costo          |
|-----------|-----------------------|-----------------------|----------------|
| Claude    | `ANTHROPIC_API_KEY`   | Claude 3.5 Sonnet     | Pago por uso   |
| Gemini    | `GEMINI_API_KEY`      | Gemini 1.5 Flash/Pro  | Versión gratis |

#### Configuración

```env
# Usar Claude (Anthropic)
ANTHROPIC_API_KEY=sk-ant-tu-api-key

# O usar Gemini (Google)
GEMINI_API_KEY=tu-gemini-api-key
```

### Funcionalidades de IA

#### ✅ Guía de Orientación Institucional (Activa)

Al crear un reporte mediante `POST /api/reportes`, el sistema automáticamente:

1. **Analiza el reporte** (título, descripción, categoría, área de servicio)
2. **Identifica la institución responsable** según el tipo de problema
3. **Genera orientación personalizada:**
   - Institución responsable
   - Medios de contacto (teléfono, email, horarios)
   - Próximos pasos recomendados
   - Información adicional si es necesaria

4. **Guarda la orientación** en la tabla `orientacion_ia`
5. **Retorna el reporte** con su orientación incluida

**Ejemplo de prompt usado:**
```
Analiza el siguiente reporte ciudadano y determina:
- Institución responsable (municipal, estatal, federal)
- Medios de contacto oficiales
- Próximos pasos que debe seguir el ciudadano

Reporte:
Título: Fuga de agua en calle principal
Descripción: Fuga abundante desde hace 3 días
Área: AGUA
Categoría: SERVICIOS_PUBLICOS
```

---

#### ⏸️ Clasificación Automática de Prioridad (Temporalmente Desactivada)

La funcionalidad de clasificación automática de prioridad (BAJA, MEDIA, ALTA, URGENTE) fue desactivada temporalmente del flujo de creación de reportes debido a ajustes técnicos.

**Estado actual:**
- El código de clasificación existe en `src/services/iaClassifier.js`
- NO está integrado en el endpoint `POST /api/reportes`
- Los reportes se crean con prioridad `MEDIA` por defecto
- Los campos `justificacionIa` y `clasificadoPorIa` están reservados para futura reactivación

**Código existente (no integrado):**
```javascript
// src/services/iaClassifier.js
export async function clasificarPrioridad(reporte) {
  const { titulo, descripcion, categoria } = reporte
  
  const prompt = `
    Analiza este reporte y clasifica su prioridad:
    - URGENTE: peligro inmediato, riesgo de vida
    - ALTA: afecta servicios críticos
    - MEDIA: problema significativo pero no crítico
    - BAJA: inconveniente menor
    
    Reporte: ${titulo}
    Descripción: ${descripcion}
    Categoría: ${categoria}
  `
  
  // Llamada al proveedor de IA...
  return { prioridad: 'ALTA', justificacion: '...' }
}
```

**Reactivación futura:**
Para reactivar, llamar a `iaClassifier.clasificarPrioridad()` desde el controlador de reportes.

### Manejo de Errores de IA

El sistema está diseñado para **nunca fallar** si la IA no responde:

```javascript
try {
  const orientacion = await generarOrientacionIA(reporte)
  await guardarOrientacion(reporte.id, orientacion)
} catch (error) {
  logger.warn('IA no disponible, usando fallback', { error })
  // El reporte se crea exitosamente sin orientación IA
}
```

**Fallbacks implementados:**
- ✅ Sin API key → Reporte se crea sin orientación
- ✅ Timeout (10 seg) → Reporte se crea sin orientación
- ✅ Error de IA → Reporte se crea con mensaje fallback
- ✅ Rate limit → Reporte se crea sin orientación

---

## 🧪 Testing

### Estrategia de Testing

El proyecto usa **Example-Based Testing** con Vitest y Supertest.

#### Tipos de Tests

1. **Tests Unitarios** - Funciones y servicios individuales
2. **Tests de Integración** - Endpoints completos (request → response)
3. **Tests de Base de Datos** - Operaciones CRUD con BD de prueba

#### Estructura de Tests

```
src/
└── __tests__/
    ├── reportes.test.js        # Tests de endpoints de reportes
    ├── orientacion.test.js     # Tests de orientación IA
    ├── iaClassifier.test.js    # Tests unitarios del clasificador
    └── setup.js                # Configuración global de tests
```

#### Ejemplo de Test de Endpoint

```javascript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../server.js'

describe('POST /api/reportes', () => {
  it('crea un reporte exitosamente', async () => {
    const response = await request(app)
      .post('/api/reportes')
      .send({
        titulo: 'Test Bache',
        areaServicio: 'BACHEO',
        categoria: 'INFRAESTRUCTURA',
        tipoUbicacion: 'PUNTO',
        latitud: 25.6866,
        longitud: -100.3161
      })
    
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('codigoSeguimiento')
    expect(response.body.codigoSeguimiento).toMatch(/^REP-\d{3}$/)
  })

  it('valida campos obligatorios', async () => {
    const response = await request(app)
      .post('/api/reportes')
      .send({ titulo: 'Sin área de servicio' })
    
    expect(response.status).toBe(400)
    expect(response.body.error).toContain('areaServicio')
  })
})
```

---

### Cobertura Objetivo

- ✅ **Servicios de negocio**: 100%
- ✅ **Endpoints críticos**: 100% (crear reporte, actualizar estado)
- ✅ **Utilidades**: >80%
- ⚠️ **Middlewares simples**: Opcional

### Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Modo watch (desarrollo)
npm run test:watch

# Con reporte de cobertura
npm run test:coverage
```

### Base de Datos de Test

Se recomienda usar una BD de Supabase separada para testing:

```env
# .env.test
DATABASE_URL="postgresql://postgres:password@test-db.supabase.co:5432/postgres"
```

---

## 🔒 Seguridad

### Prácticas Implementadas

#### Headers de Seguridad (Helmet)
```javascript
app.use(helmet({
  contentSecurityPolicy: false, // Desactivado para Swagger
  crossOriginEmbedderPolicy: false
}))
```

#### Rate Limiting
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Demasiadas peticiones, intenta de nuevo más tarde'
})

app.use('/api/', limiter)
```

#### CORS Restringido
```javascript
app.use(cors({
  origin: process.env.CLIENT_ORIGIN, // Solo frontend autorizado
  credentials: true
}))
```

#### Sanitización XSS
```javascript
import xss from 'xss'

const sanitizedInput = xss(userInput)
```

---

#### Validación de Inputs

Toda entrada del usuario se valida antes de llegar a la base de datos:

```javascript
// Middleware de validación
export function validarCrearReporte(req, res, next) {
  const { titulo, areaServicio, categoria, tipoUbicacion } = req.body

  const errores = []

  if (!titulo || titulo.trim().length === 0) {
    errores.push('El título es obligatorio')
  }

  if (!['AGUA', 'ALUMBRADO', 'BACHEO', 'RECOLECCION_BASURA', 'DRENAJE', 'OTRO'].includes(areaServicio)) {
    errores.push('Área de servicio inválida')
  }

  if (errores.length > 0) {
    return res.status(400).json({ error: errores.join(', ') })
  }

  next()
}
```

#### Manejo de Secretos

✅ **Service Role Key de Supabase:**
- Solo en backend (`server/.env`)
- NUNCA exponer al frontend
- Usar para operaciones administrativas

✅ **API Keys de IA:**
- Solo en backend
- Rotar periódicamente
- Monitorear uso y costos

❌ **NO hacer:**
- Incluir `.env` en Git
- Exponer keys en logs
- Hardcodear credenciales en código

### Logging Estructurado (Winston)

```javascript
import logger from './config/logger.js'

// Info
logger.info('Reporte creado', { reporteId, codigo })

// Warning
logger.warn('IA no disponible', { error: error.message })

// Error
logger.error('Error en BD', { error, reporteId })
```

**Niveles de log:**
- `error`: Errores críticos que requieren atención
- `warn`: Situaciones anormales pero manejadas
- `info`: Eventos importantes del sistema
- `debug`: Información detallada (solo desarrollo)

---

## 🛠️ Troubleshooting

### Problema: Error de conexión a Supabase

**Síntomas:**
```
Error: P1001: Can't reach database server
```

**Solución:**
1. Verifica que `DATABASE_URL` y `DIRECT_URL` sean correctos
2. Verifica que la IP de tu máquina esté autorizada en Supabase
3. Prueba la conexión directa:
   ```bash
   psql "postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"
   ```

### Problema: Migraciones fallan

**Síntomas:**
```
Error: Migration failed to apply cleanly
```

**Solución:**
```bash
# Ver estado de migraciones
npx prisma migrate status

# Resetear BD (SOLO desarrollo)
npm run db:reset

# Regenerar cliente
npm run db:generate
```

### Problema: Orientación IA no se genera

**Síntomas:**
Los reportes se crean pero sin orientación institucional.

**Solución:**
1. Verifica que tengas una API key configurada:
   ```bash
   echo $ANTHROPIC_API_KEY
   # o
   echo $GEMINI_API_KEY
   ```

2. Verifica saldo de la cuenta del proveedor de IA

3. Revisa los logs del servidor:
   ```bash
   # En Docker
   docker compose logs -f api

   # En desarrollo local
   # Los logs aparecen en la terminal
   ```

4. Verifica conectividad con la API:
   ```bash
   curl -X POST https://api.anthropic.com/v1/messages \
     -H "x-api-key: $ANTHROPIC_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -d '{"model":"claude-3-sonnet-20240229","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'
   ```

---

### Problema: El servidor no inicia

**Síntomas:**
```
Error: Cannot find module ...
```

**Solución:**
```bash
# Limpiar node_modules
rm -rf node_modules package-lock.json

# Reinstalar dependencias
npm install

# Verificar que todas las variables de entorno existan
cat .env
```

### Problema: Tests fallan por timeout

**Síntomas:**
```
Timeout - Async callback was not invoked within the 5000 ms timeout
```

**Solución:**
```javascript
// Aumentar timeout en vitest.config.js
export default defineConfig({
  test: {
    timeout: 10000, // 10 segundos
    hookTimeout: 15000 // 15 segundos para beforeAll/afterAll
  }
})
```

### Problema: CORS error desde frontend

**Síntomas:**
```
Access to fetch at 'http://localhost:3001/api/reportes' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solución:**
1. Verifica que `CLIENT_ORIGIN` en `.env` sea correcto:
   ```env
   CLIENT_ORIGIN=http://localhost:5173
   ```

2. En producción, asegúrate de que el origin del frontend esté autorizado:
   ```env
   CLIENT_ORIGIN=https://tu-dominio.com
   ```

### Problema: Upload de imágenes falla

**Síntomas:**
```
Error: File size exceeds limit
```

**Solución:**
1. Verifica el límite de tamaño en Express:
   ```javascript
   app.use(express.json({ limit: '10mb' }))
   app.use(express.urlencoded({ extended: true, limit: '10mb' }))
   ```

2. Verifica el límite en Supabase Storage

3. Comprime la imagen en el frontend antes de enviar

---

## 📐 Principios de Desarrollo

### Arquitectura en Capas

```
┌─────────────────────────────────┐
│         Controllers             │  ← Manejo de HTTP (req/res)
├─────────────────────────────────┤
│          Services               │  ← Lógica de negocio
├─────────────────────────────────┤
│         Repositories            │  ← Acceso a datos (Prisma)
├─────────────────────────────────┤
│          Database               │  ← PostgreSQL (Supabase)
└─────────────────────────────────┘
```

### Principios SOLID

#### Single Responsibility (SRP)
Cada módulo tiene una sola razón para cambiar.

```javascript
// ✅ Bueno: Servicios separados
// reporteService.js - solo CRUD de reportes
// orientacionService.js - solo generación de orientación IA
// iaClassifier.js - solo clasificación de prioridad

// ❌ Evitar: Todo en un solo archivo
// reporteService.js con CRUD + IA + validación + logging
```

#### Open/Closed (OCP)
Diseñar para extender sin modificar código existente.

```javascript
// ✅ Bueno: Proveedores de IA intercambiables
class ClaudeProvider {
  async generateGuidance(prompt) { /* ... */ }
}

class GeminiProvider {
  async generateGuidance(prompt) { /* ... */ }
}

// Fácil agregar nuevos proveedores sin modificar código existente
```

#### Dependency Inversion (DIP)
Depender de abstracciones, no de implementaciones concretas.

```javascript
// ✅ Bueno: Inyección de dependencias
export function crearReporteController(reporteService, iaService) {
  return async (req, res) => {
    const reporte = await reporteService.crear(req.body)
    const orientacion = await iaService.generar(reporte)
    res.json({ reporte, orientacion })
  }
}
```

---

### Principio DRY (Don't Repeat Yourself)

```javascript
// ❌ Evitar: Lógica repetida
app.post('/api/reportes', (req, res) => {
  if (!req.body.titulo) {
    return res.status(400).json({ error: 'Título requerido' })
  }
  // ... más validaciones
})

app.patch('/api/reportes/:id', (req, res) => {
  if (!req.body.titulo) {
    return res.status(400).json({ error: 'Título requerido' })
  }
  // ... mismo código repetido
})

// ✅ Bueno: Extraer a middleware reutilizable
function validarTitulo(req, res, next) {
  if (!req.body.titulo) {
    return res.status(400).json({ error: 'Título requerido' })
  }
  next()
}

app.post('/api/reportes', validarTitulo, crearReporte)
app.patch('/api/reportes/:id', validarTitulo, actualizarReporte)
```

### Regla de Avance Estricta

**NO se puede avanzar al siguiente módulo/endpoint hasta que:**

1. ✅ El módulo actual haya sido **validado manualmente** (Postman, cURL, Swagger)
2. ✅ Los **tests** del módulo actual estén escritos y pasen correctamente

Esta regla aplica a cada endpoint y cada servicio del backend sin excepción.

### Convenciones de Código

#### Nomenclatura
- **Archivos**: camelCase (`reporteService.js`)
- **Funciones**: camelCase (`crearReporte()`)
- **Clases**: PascalCase (`ReporteController`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Variables de entorno**: UPPER_SNAKE_CASE (`DATABASE_URL`)

#### Estructura de Archivos
```javascript
// 1. Imports
import express from 'express'
import { crearReporte } from '../services/reporteService.js'

// 2. Constantes
const MAX_REPORTES_POR_PAGINA = 50

// 3. Funciones principales
export async function listarReportes(req, res) {
  // implementación
}

// 4. Funciones auxiliares (si son privadas)
function formatearReporte(reporte) {
  // implementación
}
```

---

## 🤝 Contribución

### Flujo de Trabajo

1. **Leer código existente** antes de hacer cambios
2. **Planificar** qué se va a modificar
3. **Implementar** el cambio mínimo necesario
4. **Verificar** que el servidor levanta sin errores
5. **Validar manualmente** con Postman/Swagger
6. **Escribir tests** para el nuevo código
7. **Commit atómico** siguiendo Conventional Commits

### Commits

Usar formato [Conventional Commits](https://www.conventionalcommits.org/) en español:

```bash
feat: agregar endpoint de estadísticas de reportes
fix: corregir validación de coordenadas GPS
refactor: extraer lógica de IA a módulo separado
test: agregar tests de integración para orientación IA
docs: actualizar README con nuevos endpoints
chore: actualizar dependencias de Prisma
```

### Checklist Pre-Commit

- [ ] El código compila sin errores
- [ ] Todos los tests pasan (`npm test`)
- [ ] El linter no reporta errores (`npm run lint:fix`)
- [ ] Las variables de entorno están documentadas en `.env.example`
- [ ] Los nuevos endpoints están documentados en este README
- [ ] Se validó manualmente con Postman/Swagger

---

## 📚 Recursos Adicionales

### Documentación Oficial

- [Express.js Docs](https://expressjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Node.js Docs](https://nodejs.org/docs/latest/api/)
- [Vitest Docs](https://vitest.dev/)

### APIs de IA

- [Claude API (Anthropic)](https://docs.anthropic.com/claude/reference)
- [Gemini API (Google)](https://ai.google.dev/docs)

### Specs del Proyecto

- [Backend Design](../.kiro/specs/backend/design.md) - Diseño técnico completo
- [Requirements](../.kiro/specs/reportes/requirements.md) - Requerimientos funcionales (EARS)
- [Tasks](../.kiro/specs/reportes/tasks.md) - Plan de implementación

---

### Reglas de Trabajo

- [Backend Rules](../.kiro/steering/backend-rules.md) - Reglas específicas del backend
- [Workflow](../.kiro/steering/workflow.md) - Reglas generales de commits y workflow

---

## 🐳 Docker

### Dockerfile (Producción)

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci --only=production

# Copiar código
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Exponer puerto
EXPOSE 3001

# Usuario no-root
USER node

# Comando de inicio
CMD ["npm", "start"]
```

### Dockerfile.dev (Desarrollo)

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Exponer puerto
EXPOSE 3001

# Hot-reload con nodemon
CMD ["npm", "run", "dev"]
```

### Docker Compose

Ver archivo `docker-compose.yml` en la raíz del monorepo para la configuración completa.

---

## 📄 Licencia

Este proyecto forma parte del Hackathon Kiro by Código Facilito: **Reto 2. Aplicaciones Web**.

---

**Construido con ⚡ usando Node.js, Express, Prisma y Supabase**
