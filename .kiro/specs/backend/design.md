# Design Document — Backend

## Overview
Servidor Express liviano que actúa como capa intermedia entre el frontend React y Supabase (Postgres). Su responsabilidad principal es validar datos de entrada, orquestar la clasificación con IA, y comunicarse con la base de datos usando la `service_role key` (que nunca se expone al cliente).

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                       │
│                    Puerto: 5173                           │
└─────────────────────┬───────────────────────────────────┘
                      │  HTTP (proxy /api → :3001)
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  Express Server                           │
│                  Puerto: 3001                             │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │  Middleware  │  │   Routes    │  │   Services     │  │
│  │  - cors     │  │  /api/      │  │  - iaClassifier│  │
│  │  - json     │  │  reportes   │  │                │  │
│  │  - static   │  │             │  │                │  │
│  └─────────────┘  └──────┬──────┘  └───────┬────────┘  │
│                           │                  │           │
│                           ▼                  ▼           │
│                  ┌─────────────────────────────┐        │
│                  │     supabaseClient.js       │        │
│                  │   (service_role key)        │        │
│                  └──────────────┬──────────────┘        │
│                                 │                        │
└─────────────────────────────────┼────────────────────────┘
                                  │ HTTPS
                                  ▼
                    ┌──────────────────────────┐
                    │    Supabase (Postgres)    │
                    │  - reportes              │
                    │  - historial_estados     │
                    │  - triggers automáticos  │
                    └──────────────────────────┘
```

### Estructura de Archivos

```
server/
├── package.json
├── .env                    # (no se sube a git)
├── .env.example            # plantilla sin valores reales
└── src/
    ├── index.js            # entry point: crea app, escucha en PORT
    ├── app.js              # configuración de Express (middleware, rutas)
    ├── config/
    │   └── supabaseClient.js   # cliente Supabase con service_role
    ├── routes/
    │   └── reportes.js     # rutas CRUD de reportes
    └── services/
        └── iaClassifier.js # llamada a Anthropic API con fallback
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

Expone un router de Express con 4 endpoints:

| Método | Ruta | Función |
|--------|------|---------|
| POST | `/api/reportes` | Crear reporte (con clasificación IA) |
| GET | `/api/reportes` | Listar reportes (con filtros opcionales) |
| GET | `/api/reportes/:codigo` | Buscar por código de seguimiento |
| PATCH | `/api/reportes/:id/estado` | Actualizar estado de un reporte |

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

1. **service_role key** solo vive en `server/.env` — nunca se expone al frontend.
2. **CORS** restringido a `CLIENT_ORIGIN` en desarrollo.
3. **Validación de entrada** en cada endpoint antes de llegar a Supabase.
4. **No se exponen stack traces** al cliente — solo mensajes genéricos en errores 500.
5. **RLS activo** en Supabase: incluso si alguien usara la anon key directamente, no podría hacer UPDATE.

## Deployment

En producción, Express sirve tanto la API como el frontend:

```javascript
// En app.js, cuando NODE_ENV=production:
app.use(express.static(path.join(__dirname, '../../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});
```

Esto permite un solo servicio desplegado (Render/Railway) sin configuración de CORS en producción.

## Dependencies

### Producción
- `express` — servidor HTTP
- `cors` — middleware de CORS
- `@supabase/supabase-js` — cliente de Supabase
- `@anthropic-ai/sdk` — SDK de Anthropic para clasificación con IA (o `fetch` directo)
- `dotenv` — carga de variables de entorno

### Desarrollo
- `nodemon` — recarga automática durante desarrollo
