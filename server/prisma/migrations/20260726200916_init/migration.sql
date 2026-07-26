-- CreateEnum
CREATE TYPE "area_servicio" AS ENUM ('AGUA', 'ALUMBRADO', 'BACHEO', 'RECOLECCION_BASURA', 'DRENAJE', 'OTRO');

-- CreateEnum
CREATE TYPE "categoria_reporte" AS ENUM ('INFRAESTRUCTURA', 'SEGURIDAD', 'LIMPIEZA', 'SERVICIOS_PUBLICOS', 'OTRO');

-- CreateEnum
CREATE TYPE "prioridad_reporte" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "estado_reporte" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "tipo_ubicacion" AS ENUM ('PUNTO', 'AREA');

-- CreateTable
CREATE TABLE "reportes" (
    "id" UUID NOT NULL,
    "codigo_seguimiento" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "area_servicio" "area_servicio" NOT NULL,
    "categoria" "categoria_reporte" NOT NULL,
    "prioridad" "prioridad_reporte" NOT NULL,
    "estado" "estado_reporte" NOT NULL DEFAULT 'PENDIENTE',
    "tipo_ubicacion" "tipo_ubicacion" NOT NULL,
    "latitud" DECIMAL(9,6),
    "longitud" DECIMAL(9,6),
    "direccion" TEXT,
    "colonia" TEXT,
    "municipio" TEXT NOT NULL DEFAULT 'Monterrey',
    "foto_url" TEXT,
    "contacto_email" TEXT,
    "contacto_telefono" TEXT,
    "justificacion_ia" TEXT,
    "clasificado_por_ia" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_estados" (
    "id" UUID NOT NULL,
    "reporte_id" UUID NOT NULL,
    "estado_anterior" "estado_reporte",
    "estado_nuevo" "estado_reporte" NOT NULL,
    "comentario" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orientacion_ia" (
    "id" UUID NOT NULL,
    "reporte_id" UUID NOT NULL,
    "institucion_nombre" TEXT,
    "institucion_descripcion" TEXT,
    "institucion_sitio_web" TEXT,
    "confianza" DECIMAL(3,2),
    "medios_contacto" JSONB,
    "proximos_pasos" JSONB,
    "requiere_mas_informacion" BOOLEAN NOT NULL DEFAULT false,
    "mensaje_fallback" TEXT,
    "modelo_ia" TEXT,
    "prompt_version" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orientacion_ia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reportes_codigo_seguimiento_key" ON "reportes"("codigo_seguimiento");

-- CreateIndex
CREATE UNIQUE INDEX "orientacion_ia_reporte_id_key" ON "orientacion_ia"("reporte_id");

-- AddForeignKey
ALTER TABLE "historial_estados" ADD CONSTRAINT "historial_estados_reporte_id_fkey" FOREIGN KEY ("reporte_id") REFERENCES "reportes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orientacion_ia" ADD CONSTRAINT "orientacion_ia_reporte_id_fkey" FOREIGN KEY ("reporte_id") REFERENCES "reportes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
