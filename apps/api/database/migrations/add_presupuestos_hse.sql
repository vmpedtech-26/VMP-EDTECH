-- Migration: add_presupuestos_hse
-- Módulo Generador de Presupuestos HSE con IA

CREATE TYPE "EstadoPresupuesto" AS ENUM ('BORRADOR', 'ENVIADO', 'ACEPTADO', 'RECHAZADO');

CREATE TABLE IF NOT EXISTS "presupuestos_hse" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "numero_cotizacion" TEXT NOT NULL UNIQUE,
  "cliente_nombre" TEXT NOT NULL,
  "cliente_cuit" TEXT NOT NULL,
  "recurso_nombre" TEXT NOT NULL,
  "recurso_titulo" TEXT NOT NULL DEFAULT 'Técnico en Higiene y Seguridad',
  "recurso_matricula" TEXT NOT NULL,
  "fecha_emision" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "fecha_desde" TIMESTAMPTZ NOT NULL,
  "fecha_hasta" TIMESTAMPTZ NOT NULL,
  "jornadas" INTEGER NOT NULL,
  "horario" TEXT NOT NULL DEFAULT '09:00 a 18:00 hs',
  "lugar" TEXT NOT NULL,
  "importe_neto" DOUBLE PRECISION NOT NULL,
  "iva" DOUBLE PRECISION NOT NULL,
  "total" DOUBLE PRECISION NOT NULL,
  "estado" "EstadoPresupuesto" NOT NULL DEFAULT 'BORRADOR',
  "items_json" TEXT NOT NULL,
  "alcance_texto" TEXT,
  "entregables_texto" TEXT,
  "exclusiones_texto" TEXT,
  "condiciones_texto" TEXT,
  "pdf_url" TEXT,
  "created_by" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "presupuestos_hse_estado_idx" ON "presupuestos_hse"("estado");
CREATE INDEX IF NOT EXISTS "presupuestos_hse_cliente_idx" ON "presupuestos_hse"("cliente_nombre");
CREATE INDEX IF NOT EXISTS "presupuestos_hse_created_at_idx" ON "presupuestos_hse"("created_at");

CREATE TABLE IF NOT EXISTS "plantillas_presupuesto" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT,
  "items_default_json" TEXT NOT NULL,
  "alcance_default" TEXT,
  "entregables_default" TEXT,
  "exclusiones_default" TEXT,
  "condiciones_default" TEXT,
  "activa" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "contadores_cotizacion" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "anio" INTEGER NOT NULL,
  "contador" INTEGER NOT NULL DEFAULT 144,
  UNIQUE("anio")
);

-- Insertar plantillas default
INSERT INTO "plantillas_presupuesto" ("id", "nombre", "descripcion", "items_default_json", "activa")
VALUES (
  gen_random_uuid()::text,
  'HSE Técnico - Jornada',
  'Servicio técnico especializado en Higiene y Seguridad presencial por jornadas',
  '[{"codigo":"SCIO-HSE-001","concepto":"Servicio técnico especializado en Higiene y Seguridad (Jornada 8 hs)","unidad":"Días","cantidad":1,"precio_unitario":840000},{"codigo":"EXT-HSE-001","concepto":"Horas adicionales en día hábil","unidad":"Hora","cantidad":1,"precio_unitario":140000},{"codigo":"JOR-HSE-001","concepto":"Jornadas adicionales completas","unidad":"Jornada","cantidad":1,"precio_unitario":840000},{"codigo":"MOV-HSE-001","concepto":"Viáticos / movilidad a locación","unidad":"Según corresponda","cantidad":0,"precio_unitario":0}]',
  TRUE
) ON CONFLICT DO NOTHING;
