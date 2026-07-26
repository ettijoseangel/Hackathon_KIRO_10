# Estructura de carpetas: Supabase + Prisma Migrate

Guía de organización de proyecto y flujo de migraciones para el modelo `reportes` / `historial_estados` / `orientacion_ia`.

## 0. Schema de Prisma (modelos)

Este es el contenido que debe ir en `prisma/schema.prisma`. Incluye datasource, generator, enums y los tres modelos (`Reporte`, `HistorialEstado`, `OrientacionIA`) con sus relaciones.

> ⚠️ Los enums (`AreaServicio`, `CategoriaReporte`, `PrioridadReporte`, `EstadoReporte`, `TipoUbicacion`) tienen valores de ejemplo. Reemplázalos por los reales del proyecto antes de migrar.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum AreaServicio {
  AGUA
  ALUMBRADO
  BACHEO
  RECOLECCION_BASURA
  DRENAJE
  OTRO
}

enum CategoriaReporte {
  INFRAESTRUCTURA
  SEGURIDAD
  LIMPIEZA
  SERVICIOS_PUBLICOS
  OTRO
}

enum PrioridadReporte {
  BAJA
  MEDIA
  ALTA
  URGENTE
}

enum EstadoReporte {
  PENDIENTE
  EN_PROCESO
  RESUELTO
  CANCELADO
}

enum TipoUbicacion {
  PUNTO
  AREA
}

enum TipoMedioContacto {
  WEB
  EMAIL
  TELEFONO
  DIRECCION_FISICA
  RED_SOCIAL
  APP_MOVIL
}

model Reporte {
  id                String   @id @default(uuid()) @db.Uuid
  codigoSeguimiento String   @unique @map("codigo_seguimiento")
  titulo            String
  descripcion       String?
  areaServicio      AreaServicio     @map("area_servicio")
  categoria         CategoriaReporte
  prioridad         PrioridadReporte
  estado            EstadoReporte
  tipoUbicacion     TipoUbicacion    @map("tipo_ubicacion")
  latitud           Decimal? @db.Decimal(9, 6)
  longitud          Decimal? @db.Decimal(9, 6)
  direccion         String?
  colonia           String?
  municipio         String
  fotoUrl           String?  @map("foto_url")
  contactoEmail     String?  @map("contacto_email")
  contactoTelefono  String?  @map("contacto_telefono")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  historialEstados  HistorialEstado[]
  orientacionIA     OrientacionIA?

  @@map("reportes")
}

model HistorialEstado {
  id             String        @id @default(uuid()) @db.Uuid
  reporteId      String        @map("reporte_id") @db.Uuid
  estadoAnterior EstadoReporte? @map("estado_anterior")
  estadoNuevo    EstadoReporte @map("estado_nuevo")
  comentario     String?
  changedAt      DateTime      @default(now()) @map("changed_at")

  reporte        Reporte       @relation(fields: [reporteId], references: [id])

  @@map("historial_estados")
}

/// Guarda la respuesta que la IA generó para un reporte: institución
/// identificada, medios de contacto sugeridos y próximos pasos.
/// Relación 1:1 con Reporte (cada reporte tiene, a lo sumo, una
/// orientación vigente; si se re-procesa, se puede versionar o sobrescribir
/// según la estrategia que elija el equipo — ver notas al final de la sección 5).
model OrientacionIA {
  id                     String   @id @default(uuid()) @db.Uuid
  reporteId              String   @unique @map("reporte_id") @db.Uuid

  // -- Institución identificada por la IA --
  institucionNombre      String?  @map("institucion_nombre")
  institucionDescripcion String?  @map("institucion_descripcion")
  institucionSitioWeb    String?  @map("institucion_sitio_web")
  confianza              Decimal? @db.Decimal(3, 2) // 0.00 - 1.00

  // -- Medios de contacto y próximos pasos --
  // Se guardan como JSON para respetar exactamente el schema de salida
  // de la IA (arrays de objetos con tipo/valor/horario, orden/titulo/descripcion).
  mediosContacto         Json?    @map("medios_contacto")
  proximosPasos          Json?    @map("proximos_pasos")

  // -- Estado del análisis --
  requiereMasInformacion Boolean  @default(false) @map("requiere_mas_informacion")
  mensajeFallback        String?  @map("mensaje_fallback")

  // -- Metadatos del procesamiento --
  modeloIA               String?  @map("modelo_ia")       // ej. "claude-sonnet-5"
  promptVersion          String?  @map("prompt_version")  // versionado del prompt/lógica usada
  createdAt              DateTime @default(now()) @map("created_at")
  updatedAt              DateTime @updatedAt @map("updated_at")

  reporte                Reporte  @relation(fields: [reporteId], references: [id], onDelete: Cascade)

  @@map("orientacion_ia")
}
```

### Formato esperado de los campos JSON

`mediosContacto`:
```json
[
  { "tipo": "WEB", "valor": "https://sie.gob.do/reclamos", "horario_atencion": null },
  { "tipo": "TELEFONO", "valor": "800-000-0000", "horario_atencion": "L-V 8:00-17:00" }
]
```

`proximosPasos`:
```json
[
  { "orden": 1, "titulo": "Confirmar institución", "descripcion": "Verifica que la SIE es la institución correcta para tu caso." },
  { "orden": 2, "titulo": "Reunir evidencia", "descripcion": "Fotos, facturas, fecha y hora del corte." }
]
```

Estos formatos coinciden con el **schema de salida** definido en `uso-ia-proyecto.md` (secciones 6 y 7), para que la respuesta de la IA pueda guardarse tal cual en la base de datos sin transformaciones adicionales.

---

## 1. Estructura de carpetas recomendada

```
mi-proyecto/
│
├── prisma/
│   ├── schema.prisma              # Modelos, enums, datasource, generator
│   ├── migrations/                # Generado automáticamente por Prisma Migrate
│   │   ├── migration_lock.toml
│   │   └── 20260726000000_init/
│   │       └── migration.sql
│   └── seed.js                    # (opcional) datos iniciales/de prueba
│
├── src/
│   ├── db/
│   │   └── prisma.js              # Instancia única de PrismaClient
│   │
│   ├── models/                    # (opcional) lógica de acceso a datos por entidad
│   │   ├── reporte.model.js
│   │   ├── historialEstado.model.js
│   │   └── orientacionIA.model.js
│   │
│   ├── services/                  # Reglas de negocio
│   │   ├── reporte.service.js
│   │   ├── historialEstado.service.js
│   │   └── orientacionIA.service.js  # llama a la IA y persiste el resultado
│   │
│   ├── controllers/                # Si usas Express/Fastify/etc.
│   │   └── reporte.controller.js
│   │
│   └── routes/
│       └── reporte.routes.js
│
├── .env                           # DATABASE_URL, DIRECT_URL (NO subir a git)
├── .env.example                   # Plantilla sin valores reales
├── .gitignore
├── package.json
└── README.md
```

### ¿Por qué esta separación?

| Carpeta | Responsabilidad |
|---|---|
| `prisma/` | Todo lo relacionado al esquema y migraciones. Prisma la crea y la gestiona. |
| `src/db/` | Punto único de conexión (evita múltiples instancias de `PrismaClient`). |
| `src/models/` | Consultas puras a la base de datos (CRUD). |
| `src/services/` | Lógica de negocio (ej. cambiar estado y registrar en `historial_estados` en una transacción; llamar al endpoint de la IA y guardar la respuesta en `orientacion_ia`). |
| `src/controllers/` + `src/routes/` | Capa HTTP, si expones una API. |

---

## 2. Archivo `src/db/prisma.js`

Evita crear múltiples conexiones en desarrollo (hot-reload):

```javascript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

---

## 3. Variables de entorno (`.env`)

Supabase requiere **dos URLs** distintas para trabajar bien con Prisma:

```env
# Pooler (pgbouncer) - usada por la app en runtime
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Conexión directa - usada SOLO por Prisma Migrate
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-region.pooler.supabase.com:5432/postgres"
```

En `prisma/schema.prisma` esto se referencia así:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

`.env.example` (sin datos sensibles, sí se sube a git):

```env
DATABASE_URL=
DIRECT_URL=
```

`.gitignore` debe incluir:

```
.env
node_modules/
prisma/migrations/.DS_Store
```

---

## 4. Flujo de trabajo con Prisma Migrate

### Configuración inicial (una sola vez)

```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```

Esto crea `prisma/schema.prisma` y `.env`. Pega ahí el modelo (`reportes`, `historial_estados`, `orientacion_ia`, enums).

### Crear la primera migración

```bash
npx prisma migrate dev --name init
```

Esto:
1. Genera `prisma/migrations/<timestamp>_init/migration.sql`.
2. Aplica el SQL directamente en Supabase (vía `DIRECT_URL`).
3. Regenera el cliente de Prisma (`@prisma/client`).

### Cada vez que modifiques `schema.prisma`

```bash
npx prisma migrate dev --name descripcion_del_cambio
```

Ejemplos de nombres: `add_area_servicio_enum`, `add_index_codigo_seguimiento`, `add_historial_comentario`, `add_orientacion_ia`.

### Regenerar el cliente sin crear migración

Si solo cambiaste algo que no afecta el SQL (raro, pero pasa):

```bash
npx prisma generate
```

### Ver el estado de las migraciones

```bash
npx prisma migrate status
```

### Desplegar migraciones en producción

**Nunca uses `migrate dev` en producción.** Usa:

```bash
npx prisma migrate deploy
```

Esto aplica las migraciones pendientes sin pedir confirmación ni generar nuevas, ideal para CI/CD.

### Revisar la base de datos visualmente

```bash
npx prisma studio
```

### Resetear la base de datos (solo desarrollo)

```bash
npx prisma migrate reset
```

⚠️ Borra todos los datos y vuelve a aplicar todas las migraciones desde cero.

---

## 5. Buenas prácticas

- **No edites archivos dentro de `prisma/migrations/`** manualmente salvo que sepas exactamente lo que haces; si necesitas revertir algo, crea una nueva migración.
- **Versiona la carpeta `prisma/migrations/`** en git — es el historial real de tu base de datos y debe compartirse entre el equipo.
- **No versiones `.env`**, solo `.env.example`.
- Usa `DIRECT_URL` (puerto 5432) solo para migraciones; usa `DATABASE_URL` con pgbouncer (puerto 6543) para las consultas normales de la app en producción/serverless.
- Si trabajas en equipo, después de un `git pull` corre:
  ```bash
  npx prisma migrate dev
  ```
  para aplicar las migraciones nuevas que otros hayan creado.
- **Sobre `OrientacionIA`:**
  - Se modeló como relación **1:1** con `Reporte` (un reporte tiene, a lo sumo, una orientación vigente). Si el proyecto necesita **historial de versiones** (por ejemplo, el usuario pide "re-analizar" el reporte y se quiere conservar cada intento), cambia la relación a **1:N** quitando `@unique` de `reporteId` y ordenando por `createdAt` al consultar la más reciente.
  - Los campos `mediosContacto` y `proximosPasos` se guardan como `Json` para no tener que crear tablas adicionales por cada ítem; si luego necesitas filtrar/consultar por tipo de medio de contacto (ej. "todos los reportes con opción de WhatsApp"), considera normalizarlos en tablas separadas (`MedioContactoIA`, `PasoSiguienteIA`).
  - `onDelete: Cascade` en la relación implica que si se borra un `Reporte`, se borra también su `OrientacionIA`. Ajusta esta política según las reglas de retención de datos del proyecto.

---

## 6. Script de conveniencia (`package.json`)

```json
{
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate",
    "db:reset": "prisma migrate reset"
  }
}
```