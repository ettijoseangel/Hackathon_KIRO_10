# 🏙️ Reportes Ciudadanos - Plataforma de Reportes Comunitarios

> 👩🏻‍💻 Proyecto realizado por **Biters (Equipo 10)** en el Hackathon Kiro by Código Facilito.

[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.1-purple.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-green.svg)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3-cyan.svg)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://www.docker.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.9-indigo.svg)](https://www.prisma.io/)

---

##  Descripción del Proyecto

**Reportes Ciudadanos** es una aplicación web para reportar problemas comunitarios (baches, fugas de agua, fallas eléctricas, basura, etc.) y dar seguimiento mediante un código único. El sistema utiliza **inteligencia artificial** para generar orientación institucional personalizada (institución responsable, medios de contacto, próximos pasos). La plataforma es **adaptable a cualquier municipio**, utilizando datos de Monterrey, Nuevo León como plantilla por defecto.

---

## 👥 Equipo

Este proyecto fue realizado por:

- **José Ángel Zavaleta Ruíz**
- **David de Jesús Chavarría Hernández**
- **Michel Benzant**
- **Julián Hernández Vital**
- **Luis Arturo Villarreal López**

---

## ✨ Características Principales

### Para Ciudadanos
- ✅ Crear reportes con ubicación GPS automática o dirección manual
- ✅ Mapa interactivo con **Leaflet + OpenStreetMap** (sin API key, gratuito)
- ✅ Adjuntar evidencia fotográfica (hasta 5MB)
- ✅ Consultar estado del reporte con código de seguimiento (formato: **REP-XXX**)
- ✅ **Guía de orientación con IA**: institución responsable, medios de contacto, próximos pasos
- ✅ Interfaz intuitiva y responsiva (mobile-first)

### Técnicas
- ✅ Arquitectura cliente-servidor con contenedores Docker
- ✅ API REST con validación robusta
- ✅ Base de datos PostgreSQL gestionada con Prisma ORM
- ✅ Orientación institucional con IA (proveedor configurable: Claude, Gemini, etc.)
- ✅ Despliegue en AWS EC2 con Nginx y Docker Compose
- ✅ RLS (Row Level Security) activo en Supabase

---

## 🏗️ Arquitectura del Monorepo

Este es un **monorepo** que contiene frontend, backend, y configuración de despliegue:

```
proyecto/
├── client/                    # 🎨 Frontend React + Vite + TypeScript
│   ├── src/
│   │   ├── components/        # Componentes reutilizables (UI, Layout)
│   │   ├── pages/             # Páginas (Landing, ReportForm, Mapa)
│   │   ├── services/          # Comunicación HTTP con backend
│   │   └── types/             # Interfaces TypeScript
│   └── README.md              # 📄 Documentación completa del frontend
│
├── server/                    # ⚙️ Backend Express + Prisma + Supabase
│   ├── src/
│   │   ├── routes/            # Definición de endpoints RESTful
│   │   ├── controllers/       # Lógica de negocio
│   │   ├── services/          # Servicios (IA, orientación, CRUD)
│   │   └── middleware/        # Validación, rate limiting, seguridad
│   ├── prisma/
│   │   ├── schema.prisma      # Modelos de base de datos
│   │   └── migrations/        # Migraciones de BD
│   └── README.md              # 📄 Documentación completa del backend
│
├── nginx/                     # 🌐 Reverse proxy + servir estáticos
├── deploy/                    # 🚀 Scripts de despliegue
├── docker-compose.yml         # 🐳 Configuración de producción
└── README.md                  # 📄 Este archivo (overview general)
```

---

## 📚 Documentación por Módulo

### 🎨 Frontend (React + Vite)
**[👉 Ver documentación completa del Frontend →](./client/README.md)**

- Stack técnico (React 19, Vite, TypeScript, Tailwind)
- Instalación y configuración
- Estructura de componentes y páginas
- Integración con mapas (Leaflet + OpenStreetMap)
- Sistema de diseño y paleta de colores
- Testing con Vitest
- Troubleshooting

### ⚙️ Backend (Express + Prisma)
**[👉 Ver documentación completa del Backend →](./server/README.md)**

- Stack técnico (Express 5, Prisma 6, Supabase)
- Instalación y configuración
- API Endpoints completos
- Modelo de datos (Prisma schema)
- Integración con IA (Claude, Gemini)
- Testing con Vitest + Supertest
- Seguridad y buenas prácticas
- Troubleshooting

---

## 🚀 Stack Tecnológico (Resumen)

### Frontend
- **React 19.2** + **Vite 8.1** + **TypeScript 6.0**
- **Tailwind CSS 4.3** + **shadcn/ui** + **Radix UI**
- **Leaflet** + **react-leaflet** + **OpenStreetMap**
- **React Router DOM 7.11**
- **Vitest** + **Testing Library**

### Backend
- **Node.js 20** + **Express 5.2**
- **Prisma 6.9** + **PostgreSQL (Supabase)**
- **IA Configurable**: Claude (Anthropic) o Gemini (Google)
- **Helmet** + **express-rate-limit** + **xss**
- **Winston** (logging) + **Swagger UI** (docs)
- **Vitest** + **Supertest**

### Infraestructura
- **Docker** + **Docker Compose**
- **Nginx 1.27** (reverse proxy)
- **AWS EC2** (t3.small, Ubuntu 24.04 LTS)
- **GitHub Actions** (CI/CD)

---

## ⚙️ Quick Start

### Prerequisitos

- Node.js v18+
- npm v9+
- Docker + Docker Compose (opcional)
- Cuenta de Supabase
- API Key de proveedor de IA (Claude o Gemini)

### Instalación Rápida

```bash
# 1. Clonar repositorio
git clone <url-del-repositorio>
cd frontend

# 2. Instalar dependencias del frontend
cd client
npm install

# 3. Instalar dependencias del backend
cd ../server
npm install

# 4. Configurar variables de entorno
cp .env.example .env
# Editar server/.env con tus credenciales

# 5. Configurar base de datos
npm run db:generate
npm run db:migrate

# 6. Iniciar en modo desarrollo
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

**Acceder a:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- API Docs: `http://localhost:3001/api-docs`

---

## 🐳 Despliegue con Docker

### Desarrollo Local (con hot-reload)

```bash
# Desde la raíz del proyecto
docker compose up --build
```

- Frontend (Nginx): `http://localhost:8080`
- Backend (directo): `http://localhost:3001`
- Los cambios en `server/src` recargan automáticamente con nodemon

### Producción (AWS EC2)

```bash
# En la instancia EC2
git clone <repo> /home/ubuntu/app
cd /home/ubuntu/app

# Compilar frontend estático
cd client && npm ci && npm run build && cd ..

# Levantar contenedores
docker compose up -d --build
```

**Arquitectura de Despliegue:**
```
Internet → EC2 (puerto 80) → Nginx (contenedor)
                                ├── /api → Express (contenedor)
                                └── /    → Frontend estático (client/dist)
                                
Express → Supabase (servicio externo, HTTPS)
```

### CI/CD con GitHub Actions

El proyecto incluye workflow de GitHub Actions (`.github/workflows/deploy.yml`):
- Se dispara en push a `main`
- Se conecta vía SSH a la EC2
- Ejecuta `deploy/deploy.sh` automáticamente

**Secrets requeridos en GitHub:**
- `EC2_HOST` — IP pública de la EC2
- `EC2_USER` — Usuario SSH (ubuntu)
- `EC2_SSH_KEY` — Clave privada SSH

---

## 🤖 Integración con IA

### Proveedor de IA Configurable

El backend soporta múltiples proveedores de IA mediante variables de entorno:

| Proveedor | Variable de Entorno   | Modelo                | Costo          |
|-----------|-----------------------|-----------------------|----------------|
| Claude    | `ANTHROPIC_API_KEY`   | Claude 3.5 Sonnet     | Pago por uso   |
| Gemini    | `GEMINI_API_KEY`      | Gemini 1.5 Flash/Pro  | Versión gratis |

### Funcionalidades

#### ✅ Guía de Orientación Institucional (Activa)

Al crear un reporte, el sistema automáticamente genera orientación personalizada:
- Institución responsable (municipal, estatal, federal)
- Medios de contacto (teléfono, email, horarios)
- Próximos pasos recomendados
- Información adicional si es necesaria

**Endpoint:** `GET /api/v1/reportes/:id/guia-ia`

#### ⏸️ Clasificación Automática de Prioridad (Temporalmente Desactivada)

La funcionalidad de clasificación automática de prioridad (BAJA, MEDIA, ALTA, URGENTE) fue desactivada temporalmente del flujo de creación de reportes debido a ajustes técnicos.

**Estado actual:**
- El código existe pero no está integrado
- Los reportes se crean con prioridad `MEDIA` por defecto
- Campos reservados para futura reactivación

**[Ver más detalles en la documentación del backend →](./server/README.md#integración-con-ia)**

---

## 📡 API Endpoints (Resumen)

| Método | Endpoint                       | Descripción                           |
|--------|--------------------------------|---------------------------------------|
| POST   | `/api/reportes`                | Crear reporte con orientación IA      |
| GET    | `/api/reportes`                | Listar reportes (con filtros)         |
| GET    | `/api/reportes/:codigo`        | Buscar por código de seguimiento      |
| PATCH  | `/api/reportes/:id/estado`     | Actualizar estado de un reporte       |
| GET    | `/api/v1/reportes/:id/guia-ia` | Obtener orientación IA                |
| GET    | `/health`                      | Health check del servidor             |
| GET    | `/api-docs`                    | Documentación Swagger UI              |

**[Ver documentación completa de la API →](./server/README.md#api-endpoints)**

---

## 🧪 Testing

### Comandos de Testing

**Frontend:**
```bash
cd client
npm test              # Ejecutar tests una vez
npm run test:watch    # Modo watch
```

**Backend:**
```bash
cd server
npm test              # Ejecutar tests una vez
npm run test:watch    # Modo watch
npm run test:coverage # Reporte de cobertura
```

### Estrategia de Testing

El proyecto usa **Example-Based Testing** con Vitest:

- **Frontend**: Unit tests, component tests, integration tests
- **Backend**: Unit tests, integration tests, database tests

**Cobertura Objetivo:**
- Frontend: >80% en componentes con lógica
- Backend: 100% en flujos críticos

**[Ver guías completas de testing →](./client/README.md#testing)** | **[Backend →](./server/README.md#testing)**

---

## 🔒 Seguridad

### Prácticas Implementadas

- 🔐 **Service Role Key** de Supabase solo en backend (nunca en frontend)
- 🛡️ **RLS activo** en Supabase (Row Level Security)
- 🚫 **No se exponen stack traces** al cliente (solo mensajes genéricos)
- ✅ **Validación doble**: Cliente (UX) + Servidor (seguridad)
- ✅ **Rate Limiting**: express-rate-limit en endpoints públicos
- ✅ **XSS Protection**: Sanitización de inputs con xss
- ✅ **Helmet**: Headers de seguridad HTTP
- ✅ **Contenedor no-root**: Usuario `node` en Dockerfile
- ✅ **CORS restringido**: Solo origin configurado en `CLIENT_ORIGIN`

### Manejo de Secretos

- ❌ **NO subir** archivos `.env` a Git (ya incluidos en `.gitignore`)
- ✅ **Usar** `.env.example` como plantilla
- ✅ **Inyectar** variables vía Docker Compose en producción
- ✅ **Rotar** claves periódicamente (Supabase, IA)

**[Ver más sobre seguridad →](./server/README.md#seguridad)**

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

- ✅ **SOLID**: Principios de diseño orientado a objetos
- ✅ **DRY**: No repetir lógica — extraer a funciones reutilizables
- ✅ **Clean Code**: Nombres descriptivos, funciones pequeñas
- ✅ **Testing First**: Cada feature incluye tests
- ✅ **Security First**: Validación en cliente Y servidor

### Regla de Avance Estricta (Backend)

**NO se puede avanzar al siguiente módulo/endpoint hasta que:**

1. ✅ El módulo actual haya sido validado manualmente (Postman u otra herramienta)
2. ✅ Los tests del módulo actual estén escritos y pasen correctamente

---

## 🤝 Contribución

### Branching Strategy

- **Features**: `feature/<nombre-corto>`
- **Fixes**: `fix/<nombre-corto>`
- **Hotfixes**: `hotfix/<nombre-corto>`
- **Release**: `release/<version>`

**Regla:** Nunca push directo a `main` sin code review.

### Workflow de Contribución

1. **Crear branch** desde `main`
2. **Implementar cambios** con commits atómicos
3. **Ejecutar tests** antes de push
4. **Push y crear Pull Request**
5. **Code Review** por al menos 1 miembro del equipo
6. **Merge a `main`** después de aprobación

---

## 📚 Documentación Adicional

### Documentación por Módulo

- 📄 **[Frontend (React + Vite)](./client/README.md)** - Documentación completa del frontend
- 📄 **[Backend (Express + Prisma)](./server/README.md)** - Documentación completa del backend

### Specs del Proyecto (Metodología Kiro)

- [`.kiro/specs/reportes/requirements.md`](.kiro/specs/reportes/requirements.md) - Requerimientos funcionales (EARS)
- [`.kiro/specs/reportes/design.md`](.kiro/specs/reportes/design.md) - Diseño técnico del frontend
- [`.kiro/specs/reportes/tasks.md`](.kiro/specs/reportes/tasks.md) - Plan de implementación
- [`.kiro/specs/backend/design.md`](.kiro/specs/backend/design.md) - Diseño técnico del backend
- [`.kiro/specs/integracion-frontend/`](.kiro/specs/integracion-frontend/) - Integración frontend-backend

### Reglas de Trabajo (Steering Files)

- [`.kiro/steering/workflow.md`](.kiro/steering/workflow.md) - Reglas generales de commits y workflow
- [`.kiro/steering/frontend-rules.md`](.kiro/steering/frontend-rules.md) - Reglas específicas del frontend
- [`.kiro/steering/backend-rules.md`](.kiro/steering/backend-rules.md) - Reglas específicas del backend

---

## 🛠️ Troubleshooting (Problemas Comunes)

### Frontend no se conecta al backend

**Solución:**
- En desarrollo: Verifica el proxy de Vite en `vite.config.ts`
- En Docker: Verifica `nginx/conf.d/default.conf`
- Verifica `CLIENT_ORIGIN` en `server/.env`

**[Ver troubleshooting completo del frontend →](./client/README.md#troubleshooting)**

### Error de conexión a Supabase

**Solución:**
- Verifica `DATABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en `server/.env`
- Verifica que el Security Group de Supabase permita tu IP
- Prueba la conexión directa con `psql`

**[Ver troubleshooting completo del backend →](./server/README.md#troubleshooting)**

### La guía de orientación IA no se genera

**Solución:**
- Verifica que tengas configurada al menos una API key en `server/.env`:
  - `ANTHROPIC_API_KEY` (Claude) O
  - `GEMINI_API_KEY` (Gemini)
- Verifica saldo de tu cuenta del proveedor
- Revisa logs: `docker compose logs -f api`

### Contenedores no inician

**Solución:**
```bash
# Ver logs detallados
docker compose logs -f

# Reconstruir desde cero
docker compose down -v
docker compose up --build
```

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
- **Google** por la API de Gemini
- **Supabase** por la plataforma de base de datos
- **OpenStreetMap** por los tiles gratuitos de mapas
- **Kiro** por la metodología de desarrollo spec-driven
- **Código Facilito** por organizar el Hackathon

---

## 📄 Licencia

Este proyecto forma parte del Hackathon Kiro by Código Facilito: **Reto 2. Aplicaciones Web**.

---

## 🔗 Enlaces Rápidos

| Recurso | Enlace |
|---------|--------|
| 🎨 **Documentación Frontend** | [./client/README.md](./client/README.md) |
| ⚙️ **Documentación Backend** | [./server/README.md](./server/README.md) |
| 📋 **Requerimientos** | [.kiro/specs/reportes/requirements.md](.kiro/specs/reportes/requirements.md) |
| 🎨 **Diseño Frontend** | [.kiro/specs/reportes/design.md](.kiro/specs/reportes/design.md) |
| ⚙️ **Diseño Backend** | [.kiro/specs/backend/design.md](.kiro/specs/backend/design.md) |
| 📝 **Plan de Tareas** | [.kiro/specs/reportes/tasks.md](.kiro/specs/reportes/tasks.md) |
| 🔧 **Reglas de Workflow** | [.kiro/steering/workflow.md](.kiro/steering/workflow.md) |
| 📚 **API Docs (Swagger)** | `http://localhost:3001/api-docs` (en desarrollo) |

---

**Construido con ❤️ para mejorar las comunidades**

---

> 💡 **Tip:** Para información detallada sobre instalación, configuración, arquitectura, testing y troubleshooting, consulta los READMEs específicos de [Frontend](./client/README.md) y [Backend](./server/README.md).
