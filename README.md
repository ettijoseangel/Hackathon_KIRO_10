# 🏙️ Reportes Ciudadanos - Aplicación Web de Reportes Comunitarios

> 👩🏻‍💻 Proyecto realizado por Biters (Equipo 10) en el Hackathon Kiro by Código Facilito.

[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.1-purple.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-green.svg)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3-cyan.svg)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://www.docker.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.9-indigo.svg)](https://www.prisma.io/)

---

## 📖 Descripción del Proyecto

**Reportes Ciudadanos** es una aplicación web para reportar problemas comunitarios (baches, fugas de agua, fallas eléctricas, basura, etc.) y dar seguimiento mediante un código único. El sistema utiliza **clasificación automática con IA** (Claude de Anthropic) para priorizar reportes y generar orientación institucional personalizada, orientado al municipio de Monterrey, Nuevo León, México.

### Características Principales

✅ **Para Ciudadanos:**
- Crear reportes con ubicación GPS automática o dirección manual
- Mapa interactivo con **Leaflet + OpenStreetMap** (sin API key)
- Adjuntar evidencia fotográfica (hasta 5MB)
- Consultar estado del reporte con código de seguimiento (formato: REP-XXX)
- Guía de orientación con IA: institución responsable, medios de contacto, próximos pasos
- Interfaz intuitiva y responsiva (mobile-first)


✅ **Técnicas:**
- Arquitectura cliente-servidor con contenedores Docker
- API REST con validación robusta
- Base de datos PostgreSQL gestionada con Prisma ORM
- Clasificación de prioridad automática con IA (Claude)
- Despliegue en AWS EC2 con Nginx y Docker Compose
- RLS (Row Level Security) activo en Supabase

---

## 🏗️ Arquitectura del Proyecto

Este es un **monorepo** que contiene frontend, backend, y configuración de despliegue:

```
proyecto/
├── client/                    # Frontend React + Vite + TypeScript
│   ├── src/
│   │   ├── components/        # Componentes reutilizables (UI, Layout)
│   │   ├── pages/             # Páginas (Landing, ReportForm, Mapa)
│   │   ├── services/          # Comunicación HTTP (apiClient, reporteService)
│   │   ├── types/             # Interfaces TypeScript
│   │   └── lib/               # Utilidades (cn, helpers)
│   ├── public/                # Assets estáticos
│   └── package.json
│
├── server/                    # Backend Express + Prisma + Supabase
│   ├── src/
│   │   ├── routes/            # Definición de endpoints RESTful
│   │   ├── controllers/       # Lógica de negocio
│   │   ├── services/          # Servicios (IA, orientación, CRUD)
│   │   ├── config/            # Configuración (Supabase, logger)
│   │   ├── middleware/        # Validación, rate limiting, seguridad
│   │   └── db/                # Cliente Prisma
│   ├── prisma/
│   │   ├── schema.prisma      # Modelos de base de datos
│   │   └── migrations/        # Migraciones de BD
│   ├── .env.example           # Plantilla de variables de entorno
│   └── package.json
│
├── nginx/                     # Reverse proxy + servir estáticos
│   ├── Dockerfile
│   └── conf.d/default.conf
│
├── deploy/                    # Scripts de despliegue
│   └── deploy.sh
│
├── docker-compose.yml         # Configuración de producción (EC2)
├── docker-compose.override.yml # Hot-reload para desarrollo local
├── .env.example               # Plantilla de variables globales
└── README.md                  # Este archivo
```

---

## 🚀 Stack Tecnológico

### Frontend (`client/`)
- **Core:** React 19.2 + Vite 8.1 + TypeScript 6.0
- **Estilos:** Tailwind CSS 4.3 (mobile-first, paleta violeta/índigo)
- **UI Components:** shadcn/ui + Radix UI (accesibilidad)
- **Routing:** React Router DOM 7.11
- **Mapas:** Leaflet + react-leaflet + OpenStreetMap (sin API key)
- **Geocoding:** Nominatim (OpenStreetMap, gratuito)
- **HTTP:** fetch nativo centralizado en servicios
- **Testing:** Vitest + Testing Library + jsdom
- **Linting:** ESLint con plugins para React

### Backend (`server/`)
- **Runtime:** Node.js 20 (Alpine)
- **Framework:** Express 5.2 (API REST)
- **ORM:** Prisma 6.9 (PostgreSQL)
- **Base de Datos:** Supabase (PostgreSQL gestionado, con RLS)
- **IA:** Claude 3.5 Sonnet (Anthropic) para clasificación y orientación
- **Seguridad:** Helmet, express-rate-limit, xss, validación robusta
- **Logging:** Winston (logs estructurados)
- **Testing:** Vitest + Supertest (integración de endpoints)
- **Docs API:** Swagger UI (OpenAPI 3.0)

### Infraestructura y Despliegue
- **Contenedores:** Docker + Docker Compose
- **Reverse Proxy:** Nginx 1.27 (Alpine)
- **Cloud:** AWS EC2 (t3.small, Ubuntu 24.04 LTS)
- **Persistencia:** Supabase (servicio externo, no corre en la EC2)
- **CI/CD:** GitHub Actions (SSH deploy automático)

### Herramientas de Desarrollo
- **Linting:** ESLint + Standard.js
- **Code Quality:** Conventional Commits en español
- **Hot-reload:** Nodemon (backend) + Vite HMR (frontend)
- **Git Hooks:** Pre-commit para linting

---

## 📋 Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** v18 o superior
- **npm** v9 o superior
- **Git** para control de versiones
- **Docker** + **Docker Compose** (opcional, para despliegue local containerizado)
- **Editor de código** (VS Code recomendado con extensión Prisma)

---

## ⚙️ Instalación y Configuración

### 1️⃣ Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd frontend
```

### 2️⃣ Instalar Dependencias

#### Frontend
```bash
cd client
npm install
```

#### Backend
```bash
cd ../server
npm install
```

### 3️⃣ Configurar Variables de Entorno

#### Backend (`server/.env`)

Copia el archivo de ejemplo y edítalo con tus credenciales:

```bash
cd server
cp .env.example .env
```

Contenido de `server/.env`:

```env
# Server
NODE_ENV=development
PORT=3001

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Anthropic IA (clasificación de prioridad)
ANTHROPIC_API_KEY=sk-ant-xxxx

# Frontend (CORS)
CLIENT_ORIGIN=http://localhost:5173

# Database (Prisma)
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

> ⚠️ **Seguridad:** Nunca subas archivos `.env` a Git. Ya están incluidos en `.gitignore`.

### 4️⃣ Configurar Base de Datos (Prisma)

```bash
cd server
npm run db:generate    # Genera el cliente de Prisma
npm run db:migrate     # Ejecuta migraciones pendientes
```

---

## 🎮 Modo de Uso

### Desarrollo Local (Modo Manual)

#### Opción 1: Ejecutar Frontend y Backend por Separado

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Backend en `http://localhost:3001` (con nodemon, hot-reload)

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Frontend en `http://localhost:5173` (con Vite HMR)

### Desarrollo Local (Modo Docker)

Usa `docker-compose.override.yml` para hot-reload automático:

```bash
# Desde la raíz del proyecto
docker compose up --build
```

- Frontend (Nginx): `http://localhost:8080`
- Backend (directo): `http://localhost:3001`
- Los cambios en `server/src` recargan automáticamente con nodemon

### Comandos Útiles (Backend)

```bash
cd server

# Base de datos
npm run db:studio       # Abrir Prisma Studio (GUI de BD)
npm run db:migrate      # Crear migración
npm run db:reset        # Resetear BD (desarrollo)
npm run db:deploy       # Aplicar migraciones (producción)

# Testing
npm test                # Ejecutar tests una vez
npm run test:watch      # Modo watch
npm run test:coverage   # Reporte de cobertura

# Linting
npm run lint:fix        # Corregir errores de estilo
```

### Comandos Útiles (Frontend)

```bash
cd client

# Testing
npm test                # Ejecutar tests
npm run test:watch      # Modo watch

# Build
npm run build           # Compilar para producción
npm run preview         # Preview del build
```

---

## 🐳 Despliegue con Docker

### Producción (AWS EC2)

El proyecto se despliega con Docker Compose en una instancia EC2:

```bash
# En la instancia EC2 (una sola vez)
git clone <repo> /home/ubuntu/app
cd /home/ubuntu/app

# Compilar frontend estático
cd client && npm ci && npm run build && cd ..

# Levantar contenedores
docker compose up -d --build
```

La aplicación queda accesible en `http://<EC2_PUBLIC_IP>`.

#### Arquitectura de Despliegue

```
Internet → EC2 (puerto 80) → Nginx (contenedor)
                                ├── → /api → Express (contenedor)
                                └── → / → Frontend estático (client/dist)
                                
Express → Supabase (servicio externo, HTTPS)
```

### Script de Deploy Automatizado

```bash
# En la EC2
bash /home/ubuntu/app/deploy/deploy.sh
```

El script:
1. Hace `git pull`
2. Recompila el frontend
3. Reconstruye y reinicia contenedores
4. Limpia imágenes viejas

### CI/CD con GitHub Actions

El proyecto incluye workflow de GitHub Actions (`.github/workflows/deploy.yml`) que:
- Se dispara en push a `main`
- Se conecta vía SSH a la EC2
- Ejecuta `deploy.sh` automáticamente

Configura estos secrets en GitHub:
- `EC2_HOST` — IP pública de la EC2
- `EC2_USER` — Usuario SSH (ubuntu)
- `EC2_SSH_KEY` — Clave privada SSH

---

## 📁 Estructura de Rutas (API REST)

| Método | Endpoint                     | Descripción                                | Auth |
|--------|------------------------------|--------------------------------------------|------|
| POST   | `/api/reportes`              | Crear reporte (con clasificación IA)       | No   |
| GET    | `/api/reportes`              | Listar reportes (con filtros)              | No   |
| GET    | `/api/reportes/:codigo`      | Buscar por código de seguimiento           | No   |
| PATCH  | `/api/reportes/:id/estado`   | Actualizar estado de un reporte            | No   |
| GET    | `/api/v1/reportes/:id/guia-ia` | Obtener orientación IA guardada          | No   |
| GET    | `/api-docs`                  | Documentación Swagger UI                   | No   |
| GET    | `/health`                    | Health check del servidor                  | No   |

---

## 🗺️ Estructura de Rutas (Frontend)

| Ruta            | Descripción                              | Acceso  |
|-----------------|------------------------------------------|---------|
| `/`             | Landing page con call-to-action          | Público |
| `/reportar`     | Formulario de creación de reportes       | Público |
| `/mis-reportes` | Consulta de reportes por código          | Público |
| `/mapa`         | Mapa interactivo con todos los reportes  | Público |


---

## 🎨 Sistema de Diseño

### Paleta de Colores (Variante B de Figma)

- **Primario:** `#6366F1` (Índigo/Violeta)
- **Secundario:** `#4F46E5` (Índigo oscuro)
- **Fondo:** `slate-50` / `white`
- **Texto:** `slate-900` (alto contraste)

### Componentes UI

- **Cards:** Bordes redondeados (`rounded-xl`), sombras suaves
- **Buttons:** Gradientes según función (GPS: verde, Archivo: morado, Eliminar: rojo)
- **Typography:** Sans-serif limpia, jerarquía visual clara
- **Mobile-first:** Diseño responsivo con breakpoints de Tailwind

---

## 🧪 Testing

### Estrategia de Testing

El proyecto usa **Example-Based Testing** con Vitest:

#### Frontend
- ✅ **Unit Tests:** Validaciones, helpers, utilidades
- ✅ **Component Tests:** Interacciones de usuario
- ✅ **Integration Tests:** Flujos completos (crear reporte, buscar por código)

#### Backend
- ✅ **Unit Tests:** Servicios individuales (iaClassifier, orientacionIA)
- ✅ **Integration Tests:** Endpoints completos con Supertest
- ✅ **Database Tests:** Operaciones CRUD con base de datos de prueba

### Cobertura Objetivo

- **Frontend:** >80% en componentes con lógica
- **Backend:** 100% en flujos críticos (crear reporte, actualizar estado)

---

## 📐 Principios de Desarrollo

### Commits Atómicos (Obligatorio)

Cada commit representa **UN solo cambio lógico**. No mezclar features con refactors.

**Formato:** [Conventional Commits](https://www.conventionalcommits.org/) en español

```bash
feat: crear servidor Express básico en puerto 3001
fix: corregir validación de campos obligatorios
refactor: extraer lógica de filtrado a función separada
docs: agregar README con instrucciones de instalación
chore: agregar dependencias de Supabase
test: agregar tests de integración para POST /api/reportes
```

### Reglas de Calidad de Código

- ✅ **SOLID:** Principios de diseño orientado a objetos
- ✅ **DRY:** No repetir lógica — extraer a funciones reutilizables
- ✅ **Clean Code:** Nombres descriptivos, funciones pequeñas
- ✅ **Testing First:** Cada feature incluye tests
- ✅ **Security First:** Validación en cliente Y servidor

### Reglas Anti-Alucinación

- ❌ **NUNCA** generar código sin leer archivos involucrados
- ❌ **NUNCA** inventar endpoints o funciones que no existen
- ❌ **NUNCA** generar múltiples features en un solo paso
- ✅ **SIEMPRE** verificar que el código compila antes de declarar completo
- ✅ **SIEMPRE** preguntar al usuario si algo no está claro

### Regla de Avance Estricta (Backend)

**NO se puede avanzar al siguiente módulo/endpoint hasta que:**
1. ✅ El módulo actual haya sido validado manualmente (Postman u otra herramienta)
2. ✅ Los tests del módulo actual estén escritos y pasen correctamente

---

## 🔒 Seguridad

### Prácticas Implementadas

- 🔐 **Service Role Key** de Supabase solo en backend (nunca en frontend)
- 🛡️ **RLS activo** en Supabase (Row Level Security)
- 🚫 **No se exponen stack traces** al cliente (solo mensajes genéricos)
- ✅ **Validación doble:** Cliente (UX) + Servidor (seguridad)
- ✅ **Rate Limiting:** express-rate-limit en endpoints públicos
- ✅ **XSS Protection:** Sanitización de inputs con xss
- ✅ **Helmet:** Headers de seguridad HTTP
- ✅ **Contenedor no-root:** Usuario `node` en Dockerfile (no root)
- ✅ **CORS restringido:** Solo origin configurado en CLIENT_ORIGIN

### Manejo de Secretos

- ❌ **NO subir** archivos `.env` a Git
- ✅ **Usar** `.env.example` como plantilla
- ✅ **Inyectar** variables vía Docker Compose en producción
- ✅ **Rotar** claves periódicamente (Supabase, Anthropic)

---

## 📚 Documentación Adicional

### Documentos de Spec (Metodología Kiro)

- [`.kiro/specs/reportes/requirements.md`](.kiro/specs/reportes/requirements.md) - Requerimientos funcionales detallados (EARS)
- [`.kiro/specs/reportes/design.md`](.kiro/specs/reportes/design.md) - Diseño técnico del frontend
- [`.kiro/specs/reportes/tasks.md`](.kiro/specs/reportes/tasks.md) - Plan de implementación con grafo de dependencias
- [`.kiro/specs/backend/design.md`](.kiro/specs/backend/design.md) - Diseño técnico del backend + infraestructura
- [`.kiro/specs/integracion-frontend/`](.kiro/specs/integracion-frontend/) - Integración frontend-backend

### Reglas de Trabajo (Steering Files)

- [`.kiro/steering/workflow.md`](.kiro/steering/workflow.md) - Reglas generales de commits y workflow
- [`.kiro/steering/frontend-rules.md`](.kiro/steering/frontend-rules.md) - Reglas específicas del frontend
- [`.kiro/steering/backend-rules.md`](.kiro/steering/backend-rules.md) - Reglas específicas del backend

### Documentación de API

- **Swagger UI:** `http://localhost:3001/api-docs` (en desarrollo)
- **OpenAPI Spec:** Generada automáticamente con swagger-jsdoc

---

## 🤝 Contribución

### Branching Strategy

- **Features:** `feature/<nombre-corto>`
- **Fixes:** `fix/<nombre-corto>`
- **Hotfixes:** `hotfix/<nombre-corto>`
- **Release:** `release/<version>`

**Regla:** Nunca push directo a `main` sin code review.

### Workflow de Contribución

1. **Crear branch** desde `main`
   ```bash
   git checkout -b feature/mi-feature
   ```

2. **Implementar cambios** con commits atómicos
   ```bash
   git add src/componente.tsx
   git commit -m "feat: agregar componente de notificaciones"
   ```

3. **Ejecutar tests** antes de push
   ```bash
   npm test
   npm run lint:fix
   ```

4. **Push y crear Pull Request**
   ```bash
   git push origin feature/mi-feature
   ```

5. **Code Review** por al menos 1 miembro del equipo

6. **Merge a `main`** después de aprobación

---

## 🗄️ Modelo de Datos (Prisma)

### Tablas Principales

#### `reportes`
- `id` (UUID, PK)
- `codigo_seguimiento` (String, único, generado automáticamente: REP-XXX)
- `titulo` (String)
- `descripcion` (String, nullable)
- `area_servicio` (Enum: agua, electrico, municipal)
- `categoria` (Enum: fuga_agua, falta_agua, bache, etc.)
- `prioridad` (Enum: Alta, Media, Baja) — **clasificada por IA**
- `justificacion_ia` (String, nullable) — explicación de la IA
- `clasificado_por_ia` (Boolean) — true si la IA clasificó exitosamente
- `estado` (Enum: Pendiente, En Revisión, En Progreso, Resuelto, Rechazado)
- `tipo_ubicacion` (Enum: gps, manual)
- `latitud`, `longitud` (Float, nullable)
- `direccion`, `colonia` (String, nullable)
- `municipio` (String, default: "Monterrey")
- `foto_url` (String, nullable)
- `contacto_email`, `contacto_telefono` (String, nullable)
- `created_at`, `updated_at` (DateTime)

#### `historial_estados`
- `id` (UUID, PK)
- `reporte_id` (FK → reportes)
- `estado_anterior` (String, nullable)
- `estado_nuevo` (String)
- `changed_at` (DateTime, default: now)

#### `orientacion_ia`
- `id` (UUID, PK)
- `reporte_id` (FK → reportes, único)
- `institucion_responsable` (String)
- `medios_contacto` (JSON)
- `proximos_pasos` (String)
- `requiere_mas_informacion` (Boolean)
- `created_at` (DateTime)

### Triggers Automáticos

- **Generación de código de seguimiento:** Al crear un reporte, trigger en Supabase genera `REP-` + número secuencial
- **Historial de estados:** Al actualizar `reportes.estado`, trigger inserta registro en `historial_estados`

---

## 🤖 Integración con IA (Claude)

### Flujo de Clasificación Automática

1. **Usuario crea reporte** (POST `/api/reportes`)
2. **Backend llama a `iaClassifier.js`:**
   - Envía: `{ titulo, descripcion, categoria }`
   - Claude analiza y retorna: `{ prioridad, justificacion }`
3. **Backend guarda en BD:**
   - `prioridad` (Alta/Media/Baja)
   - `justificacion_ia` (explicación)
   - `clasificado_por_ia: true`

### Fallback (sin API key o error)

- Si `ANTHROPIC_API_KEY` no existe → `prioridad: "Media"`, `clasificado_por_ia: false`
- Si timeout (10 seg) → mismo fallback
- **Nunca falla el endpoint** — siempre crea el reporte

### Guía de Orientación IA

Al crear un reporte, también se genera orientación institucional:
- **Institución responsable** (ej: "SADM", "CFE", "Municipio de Monterrey")
- **Medios de contacto** (teléfono, email, horarios)
- **Próximos pasos** (qué hacer después de reportar)

Endpoint de lectura: `GET /api/v1/reportes/:id/guia-ia`

---

## 🗺️ Mapas (Leaflet + OpenStreetMap)

### Stack de Mapas

- **Librería:** Leaflet + react-leaflet
- **Tiles:** OpenStreetMap (gratuito, sin API key)
- **Geocoding:** Nominatim (OpenStreetMap)

### Características

- ✅ Mapa interactivo con todos los reportes geolocalizados
- ✅ Markers con colores según prioridad (Alta: rojo, Media: amarillo, Baja: verde)
- ✅ Popups con información del reporte al hacer clic
- ✅ Captura de ubicación GPS automática (Geolocation API)
- ✅ Búsqueda de dirección con autocompletado (Nominatim)
- ✅ Sin costos ni límites de API key

---

## 🛠️ Troubleshooting

### Problema: Error de conexión a Supabase

**Solución:**
- Verifica que `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` estén correctos en `server/.env`
- Verifica que el Security Group de Supabase permita conexiones desde tu IP
- Verifica que `DATABASE_URL` en `.env` apunte a la BD correcta

### Problema: Contenedores no inician

**Solución:**
```bash
# Ver logs detallados
docker compose logs -f

# Reconstruir desde cero
docker compose down -v
docker compose up --build
```

### Problema: Frontend no se conecta al backend

**Solución:**
- En desarrollo: Verifica que Vite proxy esté configurado (`vite.config.ts`)
- En Docker: Verifica que `nginx/conf.d/default.conf` tenga el proxy correcto
- Verifica `CLIENT_ORIGIN` en `server/.env`

### Problema: IA no clasifica reportes

**Solución:**
- Verifica que `ANTHROPIC_API_KEY` exista en `server/.env`
- Verifica saldo de la cuenta de Anthropic
- Revisa logs del servidor: `docker compose logs -f api`

---

## 📄 Licencia

Este proyecto forma parte del Hackathon Kiro by Código Facilito: **Reto 2. Aplicaciones Web**.

---

## 👩🏻‍💻 Equipo

Este proyecto fue realizado por:

- José Ángel Zavaleta Ruíz.
- David de Jesús Chavarría Hernández.
- Michel Benzant.
- Julián Hernández Vital.
- Luis Arturo Villarreal López.

---

## 🐛 Reportar Problemas

Si encuentras un bug o tienes una sugerencia:

1. Verifica que no exista un issue similar en GitHub
2. Crea un nuevo issue con:
   - **Título descriptivo**
   - **Pasos para reproducir** (si es un bug)
   - **Comportamiento esperado vs actual**
   - **Screenshots** (si aplica)
   - **Logs relevantes**

---

## 🙏 Agradecimientos

- **Anthropic** por la API de Claude
- **Supabase** por la plataforma de base de datos
- **OpenStreetMap** por los tiles gratuitos de mapas
- **Kiro** por la metodología de desarrollo spec-driven

---

**Construido con ❤️ para mejorar las comunidades**
