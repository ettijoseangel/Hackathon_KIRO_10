# Design Document — Backend (Deploy en AWS EC2 con Docker Compose)

## Overview
Servidor Express liviano que actúa como capa intermedia entre el frontend React y Supabase (Postgres). Su responsabilidad principal es validar datos de entrada, orquestar la clasificación con IA, y comunicarse con la base de datos usando la `service_role key` (que nunca se expone al cliente).

Esta versión del diseño despliega la aplicación en una **instancia EC2** usando **Docker Compose**, accediendo **únicamente por la IP pública de la EC2** (sin dominio ni TLS de por medio). Para desarrollo local se incluye un `docker-compose.override.yml` con `nodemon` y hot-reload. **Supabase se mantiene como servicio externo** (no se corre Postgres en la EC2).

> ⚠️ Al no usar un dominio, no se emite certificado TLS (Let's Encrypt requiere un dominio válido para el challenge). El tráfico público queda en **HTTP (puerto 80)** sobre la IP pública. Si más adelante se agrega un dominio, se puede retomar TLS con certbot sin cambios estructurales grandes.

## Correctness properties

## Testing Strategy

## Architecture



### High-Level Architecture

```
                        Internet
                            │
                            │ HTTP (80) → http://<EC2_PUBLIC_IP>
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                       AWS EC2 Instance                          │
│                 (Ubuntu 24.04 LTS, t3.small)                    │
│                 IP pública: <EC2_PUBLIC_IP> (Elastic IP)         │
│                                                                 │
│   Security Group:                                               │
│   - 80 (HTTP) ← 0.0.0.0/0      - 22 (SSH) ← IPs conocidas         │
│   - Docker network interno: no se expone ningún otro puerto      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  docker-compose (red: app_net)            │   │
│  │                                                           │   │
│  │   ┌───────────────────┐        ┌─────────────────────┐  │   │
│  │   │  contenedor: nginx │        │   contenedor: api    │  │   │
│  │   │  - puerto 80       │──────▶│   Express (puerto     │  │   │
│  │   │    publicado al    │ proxy  │   3001, SOLO interno) │  │   │
│  │   │    host            │  /api  │                       │  │   │
│  │   │  - sirve frontend  │        │  ┌─────────────────┐  │  │   │
│  │   │    estático (dist) │        │  │  Middleware      │  │  │   │
│  │   └───────────────────┘        │  │  Routes          │  │  │   │
│  │                                  │  │  Services        │  │  │   │
│  │                                  │  │  - iaClassifier  │  │  │   │
│  │                                  │  └────────┬────────┘  │  │   │
│  │                                  │           ▼           │  │   │
│  │                                  │  supabaseClient.js     │  │   │
│  │                                  │  (service_role key,    │  │   │
│  │                                  │   vía env var)         │  │   │
│  │                                  └───────────┬────────────┘  │   │
│  └──────────────────────────────────────────────┼───────────────┘   │
└─────────────────────────────────────────────────┼───────────────────┘
                                                   │ HTTPS (fuera de la EC2)
                                                   ▼
                                    ┌──────────────────────────┐
                                    │   Supabase (externo)      │
                                    │   Servicio administrado    │
                                    │  - Postgres                │
                                    │  - reportes                │
                                    │  - historial_estados       │
                                    │  - orientacion_ia          │
                                    │  - triggers automáticos    │
                                    └──────────────────────────┘
```

Puntos clave de este diseño:
- Se accede a la aplicación como `http://<EC2_PUBLIC_IP>` (o `http://<EC2_PUBLIC_IP>/api/...` para la API). No hay dominio ni certificado TLS.
- El contenedor `api` **no publica ningún puerto al host** (`expose`, no `ports`); solo es alcanzable desde `nginx` dentro de la red interna de Docker (`app_net`).
- `nginx` es el único contenedor con puerto publicado (`80`).
- Supabase vive **fuera de la EC2** por completo; la comunicación es siempre saliente (EC2 → Supabase), nunca al revés.

### Estructura de Archivos

```
mi-proyecto/
├── docker-compose.yml            # base: producción (usado tal cual en la EC2)
├── docker-compose.override.yml   # desarrollo local: hot-reload, nodemon, puertos directos
├── .env                          # variables (no se sube a git)
├── .env.example
├── deploy/
│   └── deploy.sh                 # git pull + docker compose up --build -d
│
├── server/                       # backend (contenedor "api")
│   ├── Dockerfile                # imagen de producción
│   ├── Dockerfile.dev            # imagen de desarrollo (con nodemon)
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── app.js
│       ├── config/
│       │   └── supabaseClient.js
│       ├── routes/
│       │   └── reportes.js
│       ├── controllers/
│       │   ├── reportes.controller.js
│       │   └── guiaIA.controller.js   # solo lectura — ver implementacionIA.md
│       └── services/
│           ├── iaClassifier.js
│           └── orientacionIA.service.js  # ver implementacionIA.md
│
├── client/                       # frontend (se compila y se sirve vía nginx)
│   └── ... (React app)
│
└── nginx/                        # contenedor "nginx"
    ├── Dockerfile
    ├── nginx.conf
    └── conf.d/
        └── default.conf
```

## Components and Interfaces

### supabaseClient.js

```javascript
// Exporta un cliente de Supabase configurado con service_role key.
// Este cliente salta RLS y puede hacer UPDATE (que el anon key no puede).
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default supabase;
```

### routes/reportes.js

Expone un router de Express con 5 endpoints:

| Método | Ruta | Función |
|--------|------|---------|
| POST | `/api/reportes` | Crear reporte (con clasificación IA) |
| GET | `/api/reportes` | Listar reportes (con filtros opcionales) |
| GET | `/api/reportes/:codigo` | Buscar por código de seguimiento |
| PATCH | `/api/reportes/:id/estado` | Actualizar estado de un reporte |
| GET | `/api/v1/reportes/{reporte_id}/guia-ia` | Consultar la guía de orientación IA ya guardada para ese reporte (institución, medios de contacto, próximos pasos) |

> **La IA no se invoca desde este endpoint.** El único punto donde se llama al servicio de IA es dentro del flujo de **`POST /api/reportes`** (crear reporte): al crear el reporte, se genera la orientación (institución, medios de contacto, próximos pasos) y se guarda en la tabla `orientacion_ia` (ver modelo `OrientacionIA`). `GET /api/v1/reportes/{reporte_id}/guia-ia` es simplemente el **endpoint CRUD de lectura** sobre ese registro ya persistido — no re-clasifica ni vuelve a llamar a la IA. No requiere autenticación. **Antes de tocar o extender este flujo, revisar `implementacionIA.md`** para el detalle de cómo y cuándo se invoca la IA — ese documento es la fuente de verdad para el comportamiento de la IA, no este design doc.

```javascript
// src/routes/reportes.js
import { Router } from 'express';
import * as reportesController from '../controllers/reportes.controller.js';
import * as guiaIAController from '../controllers/guiaIA.controller.js';

const router = Router();

// La clasificación/orientación IA ocurre DENTRO de crearReporte
// (ver implementacionIA.md) y se persiste en orientacion_ia.
router.post('/reportes', reportesController.crearReporte);
router.get('/reportes', reportesController.listarReportes);
router.get('/reportes/:codigo', reportesController.obtenerPorCodigo);
router.patch('/reportes/:id/estado', reportesController.actualizarEstado);

// Endpoint CRUD de solo lectura: devuelve la orientación IA ya guardada
// para el reporte indicado. No llama a la IA ni requiere autenticación.
router.GET(
  '/v1/reportes/:reporte_id/guia-ia',
  guiaIAController.obtenerGuiaIA
);

export default router;
```

**Notas de implementación:**
- `obtenerGuiaIA` hace una simple lectura en base de datos (`orientacionIA.service.js` → `findByReporteId`) y devuelve el registro tal cual fue guardado durante la creación del reporte. No hay lógica de IA en este controller.
- Si el reporte aún no tiene una orientación guardada (por ejemplo, el proceso de IA falló o está en curso), el endpoint responde `404` o un cuerpo con `requiere_mas_informacion: true`, según se defina en `implementacionIA.md`.
- Se mantiene el método `POST` y la ruta bajo el prefijo `/v1` tal como fue especificado, aunque semánticamente sea una lectura; esto es una decisión de API ya definida en `uso-ia-proyecto.md`.
- El `Content-Type: application/json` se asume por el `express.json()` ya configurado en `app.js`; no requiere middleware adicional.
- No hay verificación de token/JWT en esta ruta ni en ninguna otra de este router; si el proyecto necesita proteger endpoints más adelante, se agregaría como una decisión aparte, no como parte de este flujo de IA.

### services/iaClassifier.js

```javascript
// Interfaz pública:
export async function clasificarPrioridad({ titulo, descripcion, categoria }) {
  // Retorna: { prioridad: 'Alta'|'Media'|'Baja', justificacion: string, clasificado_por_ia: boolean }
}
```

**Comportamiento:**
1. Si `ANTHROPIC_API_KEY` no existe → retorna fallback inmediato.
2. Llama a la API de Claude con un prompt específico.
3. Timeout de 10 segundos.
4. Si la respuesta es válida → retorna `{ prioridad, justificacion, clasificado_por_ia: true }`.
5. Si falla por cualquier razón → retorna `{ prioridad: 'Media', justificacion: null, clasificado_por_ia: false }`.

## Data Models

### Request/Response del POST /api/reportes

**Request Body:**
```typescript
{
  titulo: string;              // obligatorio
  descripcion?: string;        // opcional
  area_servicio: 'agua' | 'electrico' | 'municipal';  // obligatorio
  categoria: 'fuga_agua' | 'falta_agua' | 'alcantarillado' | 'falla_electrica' | 'corte_luz' | 'bache' | 'alumbrado_publico' | 'basura' | 'otro';  // obligatorio
  tipo_ubicacion: 'gps' | 'manual';  // obligatorio
  latitud?: number;            // obligatorio si tipo_ubicacion=gps
  longitud?: number;           // obligatorio si tipo_ubicacion=gps
  direccion?: string;          // obligatorio si tipo_ubicacion=manual
  colonia?: string;
  foto_url?: string | null;
  contacto_email?: string;
  contacto_telefono?: string;
}
```

**Response 201:**
```typescript
{
  id: string;                  // uuid
  codigo_seguimiento: string;  // REP-XXX (generado por trigger)
  titulo: string;
  descripcion: string | null;
  area_servicio: string;
  categoria: string;
  prioridad: 'Alta' | 'Media' | 'Baja';  // decidida por IA
  justificacion_ia: string | null;
  clasificado_por_ia: boolean;
  estado: 'Pendiente';        // siempre inicia así
  tipo_ubicacion: string;
  latitud: number | null;
  longitud: number | null;
  direccion: string | null;
  colonia: string | null;
  municipio: 'Monterrey';
  foto_url: string | null;
  contacto_email: string | null;
  contacto_telefono: string | null;
  created_at: string;          // ISO 8601
  updated_at: string;
}
```

### Response del GET /api/reportes

```typescript
{
  total: number;
  reportes: Report[];  // mismo shape que el POST response, sin historial
}
```

### Response del GET /api/reportes/:codigo

```typescript
{
  ...Report,               // todos los campos del reporte
  historial: [
    {
      estado_anterior: string | null;
      estado_nuevo: string;
      changed_at: string;  // ISO 8601
    }
  ]
}
```

### Response del PATCH /api/reportes/:id/estado

**Request:** `{ "estado": "Resuelto" }`

**Response 200:** El reporte actualizado (mismo shape que POST response).

## Error Handling

Todas las respuestas de error siguen el formato:
```json
{ "error": "mensaje descriptivo" }
```

| Status | Cuándo |
|--------|--------|
| 400 | Campos obligatorios faltantes, valores de enum inválidos, GPS sin coordenadas |
| 404 | Código de seguimiento no existe, UUID de reporte no existe |
| 500 | Error de Supabase, error inesperado del servidor |

### Middleware de error global

```javascript
// Al final de app.js, después de todas las rutas:
app.use((err, req, res, next) => {
  console.error('Error interno:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});
```

## Security Considerations

1. **service_role key** solo existe como variable de entorno inyectada al contenedor `api` (vía `.env` + `docker-compose.yml`) — nunca se hornea (`bake`) dentro de la imagen ni se sube a git.
2. **CORS** restringido a `CLIENT_ORIGIN=http://<EC2_PUBLIC_IP>` (o `*` solo si es estrictamente necesario en un entorno de prueba).
3. **Validación de entrada** en cada endpoint antes de llegar a Supabase.
4. **No se exponen stack traces** al cliente — solo mensajes genéricos en errores 500.
5. **RLS activo** en Supabase: incluso si alguien usara la anon key directamente, no podría hacer UPDATE.
6. **El contenedor `api` no publica puertos al host** (`expose: 3001` en vez de `ports:`), solo es alcanzable dentro de la red Docker `app_net` por `nginx`.
7. **Security Group de EC2** restringido: 80 abierto al público, 22 (SSH) limitado a IPs conocidas o acceso vía AWS Systems Manager Session Manager.
8. **Sin dominio → sin TLS público en esta versión**: el tráfico entre el navegador y la EC2 va en HTTP plano. Si el proyecto maneja datos sensibles, considerar más adelante: (a) asignar un dominio y activar certbot, o (b) poner un Application Load Balancer con certificado ACM delante de la EC2.
9. **Imagen del backend minimalista**: usar `node:20-alpine` y `npm ci --omit=dev` para reducir superficie de ataque y tamaño de imagen.
10. **Usuario no-root dentro del contenedor**: definir un `USER node` en el Dockerfile del backend en vez de correr como root.
11. **Supabase como servicio externo**: no hay base de datos que asegurar dentro de la EC2; toda la superficie de ataque de datos recae en la configuración de RLS/policies de Supabase, no en la infraestructura local.
12. **IP pública de la EC2**: al no haber dominio, se recomienda usar una **Elastic IP** (no la IP pública dinámica por defecto) para que no cambie si la instancia se reinicia o se detiene/arranca.

## Deployment (AWS EC2 + Docker Compose, solo IP pública)

### Infraestructura

| Recurso | Detalle |
|---|---|
| **Instancia** | EC2 `t3.small` (ajustable), Ubuntu 24.04 LTS, con Docker Engine + Docker Compose plugin |
| **Elastic IP** | Asociada a la instancia para tener una IP pública fija (`<EC2_PUBLIC_IP>`) |
| **Dominio** | No se usa en esta versión |
| **Contenedores** | `api` (Express) y `nginx` (reverse proxy + estáticos, sin TLS) |
| **Base de datos** | Supabase (servicio externo, gestionado, fuera de la EC2) |
| **Certificados TLS** | No aplica en esta versión (ver nota de seguridad #8) |
| **Logs** | `docker compose logs`, opcionalmente drivers de logging hacia CloudWatch |

### `docker-compose.yml` (base — producción, en la EC2)

```yaml
version: "3.9"

services:
  api:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: reportes-api
    restart: unless-stopped
    expose:
      - "3001"        # solo visible dentro de la red interna, no al host
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - PORT=3001
    networks:
      - app_net

  nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile
    container_name: reportes-nginx
    restart: unless-stopped
    depends_on:
      - api
    ports:
      - "80:80"        # único puerto publicado; se accede vía http://<EC2_PUBLIC_IP>
    volumes:
      - ./client/dist:/usr/share/nginx/html:ro
    networks:
      - app_net

networks:
  app_net:
    driver: bridge
```

> `Supabase no aparece como servicio en este archivo`: no corre dentro de Docker ni en la EC2; el backend se conecta a él por internet usando `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` desde `.env`.

### `server/Dockerfile` (producción)

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

USER node
EXPOSE 3001

CMD ["node", "src/index.js"]
```

### `nginx/Dockerfile`

```dockerfile
FROM nginx:1.27-alpine

COPY conf.d/default.conf /etc/nginx/conf.d/default.conf
```

### `nginx/conf.d/default.conf` (solo HTTP, sin dominio)

```nginx
server {
    listen 80;
    server_name _;   # acepta cualquier host, incluida la IP pública directamente

    # Frontend estático (build de React), montado como volumen
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    # Proxy hacia el contenedor "api" (nombre de servicio = hostname en la red Docker)
    location /api/ {
        proxy_pass         http://api:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

### `.env` (en la raíz del proyecto, solo en la EC2, nunca en git)

```env
NODE_ENV=production
PORT=3001
CLIENT_ORIGIN=http://<EC2_PUBLIC_IP>
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxx
ANTHROPIC_API_KEY=xxxx
```

### Provisión inicial de la instancia (una sola vez)

```bash
# 1. Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar Docker Engine + plugin de Compose
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker

# 3. Clonar el repositorio
git clone <repo> /home/$USER/app
cd /home/$USER/app

# 4. Compilar el frontend (se sirve como estático vía nginx)
cd client && npm ci && npm run build && cd ..

# 5. Levantar todo con Docker Compose (usa docker-compose.yml, el override
#    NO debe usarse en la EC2 — ver sección de desarrollo local más abajo)
docker compose up -d --build
```

Tras esto, la aplicación queda accesible en `http://<EC2_PUBLIC_IP>` y la API en `http://<EC2_PUBLIC_IP>/api/...`.

### Script de despliegue (`deploy/deploy.sh`)

Se ejecuta en cada actualización (manual o vía CI/CD):

```bash
#!/usr/bin/env bash
set -e

cd /home/$USER/app

echo "→ Actualizando código..."
git pull origin main

echo "→ Compilando frontend..."
cd client && npm ci && npm run build && cd ..

echo "→ Reconstruyendo y reiniciando contenedores..."
docker compose up -d --build

echo "→ Limpiando imágenes viejas..."
docker image prune -f

echo "✔ Deploy completado."
```

### CI/CD sugerido (GitHub Actions → SSH deploy)

```yaml
# .github/workflows/deploy.yml
name: Deploy a EC2 (Docker Compose)
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy vía SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}   # IP pública de la EC2
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: bash /home/${{ secrets.EC2_USER }}/app/deploy/deploy.sh
```

> Las credenciales (`EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`) se guardan como **GitHub Secrets**. El archivo `.env` de producción vive únicamente en la instancia EC2 (o se gestiona vía AWS Secrets Manager / Parameter Store si se prefiere no tocarlo manualmente en cada deploy).

### Monitoreo básico

- `docker compose ps` para ver el estado de los contenedores.
- `docker compose logs -f api` / `docker compose logs -f nginx` para logs en tiempo real.
- `docker stats` para uso de CPU/memoria por contenedor.
- Los contenedores usan `restart: unless-stopped`, por lo que se recuperan automáticamente ante un crash o un reinicio de la instancia.
- Opcional: configurar el CloudWatch Agent en la EC2 (fuera de Docker) para métricas a nivel de sistema operativo (CPU, disco, memoria de la instancia).

---

## Desarrollo local (`docker-compose.override.yml`)

Docker Compose combina automáticamente `docker-compose.yml` (base) con `docker-compose.override.yml` cuando ambos están presentes y se ejecuta `docker compose up` **sin** especificar `-f` — esto es exactamente el comportamiento deseado para desarrollo local. En la EC2 (producción), este archivo simplemente **no debe copiarse/existir**, para que solo se use la configuración base.

### `docker-compose.override.yml`

```yaml
version: "3.9"

services:
  api:
    build:
      context: ./server
      dockerfile: Dockerfile.dev
    volumes:
      - ./server/src:/app/src        # hot-reload: los cambios locales se reflejan al instante
      - /app/node_modules            # evita que node_modules del host pise al del contenedor
    command: npx nodemon --watch src --exec node src/index.js
    ports:
      - "3001:3001"                  # en local sí se expone directo, para poder pegarle con Postman/curl
    environment:
      - NODE_ENV=development

  nginx:
    volumes:
      - ./client/dist:/usr/share/nginx/html:ro
    ports:
      - "8080:80"                    # evita choques con el puerto 80 del host en desarrollo
```

### `server/Dockerfile.dev`

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install          # incluye devDependencies (nodemon)

COPY src ./src

EXPOSE 3001

CMD ["npx", "nodemon", "--watch", "src", "--exec", "node", "src/index.js"]
```

### `server/package.json` (fragmento relevante)

```json
{
  "scripts": {
    "dev": "nodemon --watch src --exec node src/index.js",
    "start": "node src/index.js"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

### Uso en desarrollo local

```bash
# Compose toma docker-compose.yml + docker-compose.override.yml automáticamente
docker compose up --build

# La API queda accesible directo en:
#   http://localhost:3001/api/...
# Y también vía nginx (proxy) en:
#   http://localhost:8080/api/...

# Cualquier cambio en server/src/*.js reinicia el proceso de Node dentro
# del contenedor gracias a nodemon, sin necesidad de reconstruir la imagen.
```

### `.env.example` para desarrollo local

```env
NODE_ENV=development
PORT=3001
CLIENT_ORIGIN=http://localhost:8080
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxx      # usar un proyecto de Supabase de desarrollo, no el de producción
ANTHROPIC_API_KEY=xxxx
```

> ⚠️ Se recomienda usar un **proyecto de Supabase separado para desarrollo** (o al menos RLS/datos de prueba), para no arriesgar datos reales mientras se itera localmente con hot-reload.

## Dependencies

### Producción
- `express` — servidor HTTP
- `cors` — middleware de CORS
- `@supabase/supabase-js` — cliente de Supabase (servicio externo)
- `@anthropic-ai/sdk` — SDK de Anthropic para clasificación con IA (o `fetch` directo)
- `dotenv` — carga de variables de entorno

### Infraestructura
- **Docker Engine** + **Docker Compose plugin** — orquestación de contenedores en la EC2
- **Nginx** (imagen oficial `nginx:alpine`) — reverse proxy y estáticos (sin TLS en esta versión)

### Desarrollo
- `nodemon` — recarga automática dentro del contenedor `api` vía `docker-compose.override.yml`