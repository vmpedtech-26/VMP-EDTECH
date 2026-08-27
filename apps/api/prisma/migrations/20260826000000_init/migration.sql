-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'INSTRUCTOR', 'ALUMNO', 'EMPRESA', 'CONTADOR', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "TipoModulo" AS ENUM ('TEORIA', 'QUIZ', 'PRACTICA');

-- CreateEnum
CREATE TYPE "EstadoEvidencia" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "ModalidadCurso" AS ENUM ('ONLINE', 'IN_COMPANY', 'HYBRID');

-- CreateEnum
CREATE TYPE "EstadoInscripcion" AS ENUM ('NO_INICIADO', 'EN_PROGRESO', 'COMPLETADO', 'APROBADO', 'REPROBADO');

-- CreateEnum
CREATE TYPE "EstadoCurso" AS ENUM ('BORRADOR', 'PENDIENTE', 'PUBLICADO');

-- CreateEnum
CREATE TYPE "EstadoSesion" AS ENUM ('PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'EN_CURSO', 'COMPLETADA');

-- CreateEnum
CREATE TYPE "EstadoPresupuesto" AS ENUM ('BORRADOR', 'ENVIADO', 'ACEPTADO', 'RECHAZADO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "telefono" TEXT,
    "rol" "UserRole" NOT NULL DEFAULT 'ALUMNO',
    "empresa_id" TEXT,
    "avatar" TEXT,
    "firma_url" TEXT,
    "puesto" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "sso_active" BOOLEAN NOT NULL DEFAULT false,
    "sso_domain" TEXT,
    "sso_provider" TEXT,
    "sso_client_id" TEXT,
    "sso_tenant_id" TEXT,
    "sso_client_secret" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cursos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "duracion_horas" INTEGER NOT NULL,
    "vigencia_meses" INTEGER,
    "empresa_id" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "alumnos_esperados" INTEGER NOT NULL DEFAULT 0,
    "minimo_aprobacion" INTEGER NOT NULL DEFAULT 70,
    "modalidad" "ModalidadCurso" NOT NULL DEFAULT 'ONLINE',
    "max_participantes" INTEGER,
    "link_clase" TEXT,
    "tipo_evaluacion" TEXT NOT NULL DEFAULT 'QUIZ',
    "usa_telemetria_obd2" BOOLEAN NOT NULL DEFAULT false,
    "plantilla_evaluacion_id" TEXT,
    "estado" "EstadoCurso" NOT NULL DEFAULT 'BORRADOR',
    "instructor_id" TEXT,
    "material_descargable_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modulos" (
    "id" TEXT NOT NULL,
    "curso_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "tipo" "TipoModulo" NOT NULL,
    "contenido_html" TEXT,
    "video_url" TEXT,
    "live_class_url" TEXT,
    "live_class_date" TIMESTAMP(3),
    "live_class_platform" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modulos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preguntas" (
    "id" TEXT NOT NULL,
    "modulo_id" TEXT NOT NULL,
    "pregunta" TEXT NOT NULL,
    "opciones" JSONB NOT NULL,
    "respuesta_correcta" INTEGER NOT NULL,
    "explicacion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "preguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones" (
    "id" TEXT NOT NULL,
    "alumno_id" TEXT NOT NULL,
    "curso_id" TEXT NOT NULL,
    "progreso" INTEGER NOT NULL DEFAULT 0,
    "estado" "EstadoInscripcion" NOT NULL DEFAULT 'NO_INICIADO',
    "inicio_date" TIMESTAMP(3),
    "fin_date" TIMESTAMP(3),
    "modulos_completados" TEXT NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "examenes" (
    "id" TEXT NOT NULL,
    "alumno_id" TEXT NOT NULL,
    "curso_id" TEXT NOT NULL,
    "modulo_id" TEXT NOT NULL,
    "respuestas" JSONB NOT NULL,
    "calificacion" DOUBLE PRECISION,
    "aprobado" BOOLEAN,
    "realizado_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "examenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotos_credencial" (
    "id" TEXT NOT NULL,
    "alumno_id" TEXT NOT NULL,
    "foto_url" TEXT NOT NULL,
    "comentario" TEXT,
    "estado" "EstadoEvidencia" NOT NULL DEFAULT 'PENDIENTE',
    "feedback" TEXT,
    "evaluador_id" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fotos_credencial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credenciales" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "alumno_id" TEXT NOT NULL,
    "curso_id" TEXT NOT NULL,
    "pdf_url" TEXT NOT NULL,
    "qr_code_url" TEXT NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_vencimiento" TIMESTAMP(3),
    "puesto" TEXT,
    "firma_criptografica" TEXT,
    "metadata_firmada" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credenciales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotizaciones" (
    "id" SERIAL NOT NULL,
    "empresa" TEXT NOT NULL,
    "cuit" TEXT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "comentarios" TEXT,
    "quantity" INTEGER NOT NULL,
    "course" TEXT NOT NULL,
    "modality" TEXT NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "price_per_student" DOUBLE PRECISION NOT NULL,
    "discount" INTEGER NOT NULL,
    "accept_marketing" BOOLEAN NOT NULL DEFAULT false,
    "accept_terms" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cotizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sectores" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sectores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puestos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sector_id" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "puestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "localidades" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "provincia" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "localidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas_operativas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "areas_operativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_capacitacion" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "curso_id" TEXT NOT NULL,
    "solicitante_nombre" TEXT NOT NULL,
    "solicitante_email" TEXT NOT NULL,
    "cantidad_personas" INTEGER NOT NULL,
    "observaciones" TEXT,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitudes_capacitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones_capacitacion" (
    "id" TEXT NOT NULL,
    "curso_id" TEXT NOT NULL,
    "empresa_id" TEXT,
    "instructor_id" TEXT,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "lugar" TEXT,
    "plataforma" TEXT,
    "meet_link" TEXT,
    "estado" "EstadoSesion" NOT NULL DEFAULT 'PROGRAMADA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sesiones_capacitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias_sesion" (
    "id" TEXT NOT NULL,
    "sesion_id" TEXT NOT NULL,
    "alumno_id" TEXT NOT NULL,
    "presente" BOOLEAN NOT NULL DEFAULT false,
    "check_in" TIMESTAMP(3),
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asistencias_sesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'info',
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banco_preguntas" (
    "id" TEXT NOT NULL,
    "pregunta" TEXT NOT NULL,
    "opciones" JSONB NOT NULL,
    "respuesta_correcta" INTEGER NOT NULL,
    "explicacion" TEXT,
    "area" TEXT,
    "dificultad" TEXT NOT NULL DEFAULT 'media',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banco_preguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tareas_practicas" (
    "id" TEXT NOT NULL,
    "modulo_id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "requiere_foto" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tareas_practicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencias" (
    "id" TEXT NOT NULL,
    "tarea_id" TEXT NOT NULL,
    "alumno_id" TEXT NOT NULL,
    "foto_url" TEXT,
    "comentario" TEXT,
    "estado" "EstadoEvidencia" NOT NULL DEFAULT 'PENDIENTE',
    "feedback" TEXT,
    "evaluador_id" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parent_code" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "is_selectable" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concept" TEXT NOT NULL,
    "reference" TEXT,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" TEXT NOT NULL,
    "journal_id" TEXT,
    "account_id" TEXT,
    "description" TEXT,
    "debit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "credit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" TEXT,
    "condicion_iva" TEXT NOT NULL DEFAULT 'RI',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "iva" DOUBLE PRECISION NOT NULL,
    "percepciones" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "metodo_pago" TEXT NOT NULL DEFAULT 'TRANSFERENCIA',
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venta_items" (
    "id" TEXT NOT NULL,
    "venta_id" TEXT,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unit" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "venta_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras" (
    "id" TEXT NOT NULL,
    "proveedor" TEXT NOT NULL,
    "cuit" TEXT,
    "numero" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "iva" DOUBLE PRECISION NOT NULL,
    "percepciones" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "metodo_pago" TEXT NOT NULL DEFAULT 'EFECTIVO',
    "categoria" TEXT NOT NULL DEFAULT 'OTROS',
    "tipo_factura" TEXT DEFAULT 'A',
    "cbu_proveedor" TEXT,
    "es_importacion_servicio" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compra_items" (
    "id" TEXT NOT NULL,
    "compra_id" TEXT,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unit" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "compra_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantillas_evaluacion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "preguntas" JSONB NOT NULL,
    "tiempo_limite" INTEGER,
    "nota_minima" DOUBLE PRECISION NOT NULL DEFAULT 60,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plantillas_evaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "user_email" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ip_address" TEXT,
    "request_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_reports" (
    "id" TEXT NOT NULL,
    "codigo_seguimiento" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "relacionEmpresa" TEXT NOT NULL,
    "es_anonima" BOOLEAN NOT NULL DEFAULT true,
    "nombre_denunciante" TEXT,
    "email_denunciante" TEXT,
    "telefono" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'NUEVA',
    "comentarios_oficial" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obd2_sessions" (
    "id" TEXT NOT NULL,
    "inscripcion_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fuerza_frenado" DOUBLE PRECISION,
    "aceleracion" DOUBLE PRECISION,
    "curvas_score" DOUBLE PRECISION,
    "esquivo_alce" BOOLEAN,
    "raw_data" TEXT,

    CONSTRAINT "obd2_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_branding" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "brand_tag" TEXT,
    "tagline" TEXT,
    "logo_url" TEXT,
    "favicon_url" TEXT,
    "tema" TEXT NOT NULL DEFAULT 'light',
    "color_primario" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "categoria_contribuyente" TEXT NOT NULL DEFAULT 'PEQUEÑA',
    "actividad_iva_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_branding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bienes_de_cambio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "costo_historico" DOUBLE PRECISION NOT NULL,
    "costo_ultima_compra" DOUBLE PRECISION NOT NULL,
    "fecha_ultima_compra" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bienes_de_cambio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retenciones_arca" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "cuit" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nro" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "retenciones_arca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presupuestos_hse" (
    "id" TEXT NOT NULL,
    "numero_cotizacion" TEXT NOT NULL,
    "cliente_nombre" TEXT NOT NULL,
    "cliente_cuit" TEXT NOT NULL,
    "recurso_nombre" TEXT NOT NULL,
    "recurso_titulo" TEXT NOT NULL,
    "recurso_matricula" TEXT NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_desde" TIMESTAMP(3) NOT NULL,
    "fecha_hasta" TIMESTAMP(3) NOT NULL,
    "jornadas" INTEGER NOT NULL,
    "horario" TEXT NOT NULL DEFAULT '09:00 a 18:00 hs',
    "lugar" TEXT NOT NULL,
    "importe_neto" DOUBLE PRECISION NOT NULL,
    "iva" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "estado" "EstadoPresupuesto" NOT NULL DEFAULT 'BORRADOR',
    "items_json" TEXT NOT NULL,
    "indicadores_hse_json" TEXT,
    "vigencia_oferta" TEXT,
    "alcance_texto" TEXT,
    "entregables_texto" TEXT,
    "exclusiones_texto" TEXT,
    "condiciones_texto" TEXT,
    "pdf_url" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presupuestos_hse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantillas_presupuesto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "items_default_json" TEXT NOT NULL,
    "alcance_default" TEXT,
    "entregables_default" TEXT,
    "exclusiones_default" TEXT,
    "condiciones_default" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plantillas_presupuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contadores_cotizacion" (
    "id" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "contador" INTEGER NOT NULL DEFAULT 144,

    CONSTRAINT "contadores_cotizacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_dni_key" ON "users"("dni");

-- CreateIndex
CREATE INDEX "users_rol_idx" ON "users"("rol");

-- CreateIndex
CREATE INDEX "users_empresa_id_idx" ON "users"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_cuit_key" ON "companies"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "companies_sso_domain_key" ON "companies"("sso_domain");

-- CreateIndex
CREATE UNIQUE INDEX "cursos_codigo_key" ON "cursos"("codigo");

-- CreateIndex
CREATE INDEX "inscripciones_estado_idx" ON "inscripciones"("estado");

-- CreateIndex
CREATE INDEX "inscripciones_alumno_id_idx" ON "inscripciones"("alumno_id");

-- CreateIndex
CREATE INDEX "inscripciones_curso_id_idx" ON "inscripciones"("curso_id");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_alumno_id_curso_id_key" ON "inscripciones"("alumno_id", "curso_id");

-- CreateIndex
CREATE INDEX "examenes_alumno_id_idx" ON "examenes"("alumno_id");

-- CreateIndex
CREATE INDEX "examenes_curso_id_idx" ON "examenes"("curso_id");

-- CreateIndex
CREATE INDEX "examenes_modulo_id_idx" ON "examenes"("modulo_id");

-- CreateIndex
CREATE UNIQUE INDEX "fotos_credencial_alumno_id_key" ON "fotos_credencial"("alumno_id");

-- CreateIndex
CREATE UNIQUE INDEX "credenciales_numero_key" ON "credenciales"("numero");

-- CreateIndex
CREATE INDEX "credenciales_alumno_id_idx" ON "credenciales"("alumno_id");

-- CreateIndex
CREATE INDEX "credenciales_curso_id_idx" ON "credenciales"("curso_id");

-- CreateIndex
CREATE INDEX "credenciales_numero_idx" ON "credenciales"("numero");

-- CreateIndex
CREATE INDEX "cotizaciones_status_idx" ON "cotizaciones"("status");

-- CreateIndex
CREATE INDEX "cotizaciones_email_idx" ON "cotizaciones"("email");

-- CreateIndex
CREATE INDEX "cotizaciones_created_at_idx" ON "cotizaciones"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "solicitudes_capacitacion_estado_idx" ON "solicitudes_capacitacion"("estado");

-- CreateIndex
CREATE INDEX "solicitudes_capacitacion_empresa_id_idx" ON "solicitudes_capacitacion"("empresa_id");

-- CreateIndex
CREATE INDEX "sesiones_capacitacion_curso_id_idx" ON "sesiones_capacitacion"("curso_id");

-- CreateIndex
CREATE INDEX "sesiones_capacitacion_estado_idx" ON "sesiones_capacitacion"("estado");

-- CreateIndex
CREATE INDEX "sesiones_capacitacion_fecha_inicio_idx" ON "sesiones_capacitacion"("fecha_inicio");

-- CreateIndex
CREATE INDEX "asistencias_sesion_alumno_id_idx" ON "asistencias_sesion"("alumno_id");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_sesion_sesion_id_alumno_id_key" ON "asistencias_sesion"("sesion_id", "alumno_id");

-- CreateIndex
CREATE INDEX "notificaciones_user_id_idx" ON "notificaciones"("user_id");

-- CreateIndex
CREATE INDEX "notificaciones_leida_idx" ON "notificaciones"("leida");

-- CreateIndex
CREATE INDEX "evidencias_alumno_id_idx" ON "evidencias"("alumno_id");

-- CreateIndex
CREATE INDEX "evidencias_tarea_id_idx" ON "evidencias"("tarea_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_code_key" ON "accounts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ventas_numero_key" ON "ventas"("numero");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_reports_codigo_seguimiento_key" ON "compliance_reports"("codigo_seguimiento");

-- CreateIndex
CREATE INDEX "compliance_reports_codigo_seguimiento_idx" ON "compliance_reports"("codigo_seguimiento");

-- CreateIndex
CREATE INDEX "compliance_reports_estado_idx" ON "compliance_reports"("estado");

-- CreateIndex
CREATE INDEX "obd2_sessions_inscripcion_id_idx" ON "obd2_sessions"("inscripcion_id");

-- CreateIndex
CREATE UNIQUE INDEX "org_branding_codigo_key" ON "org_branding"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "presupuestos_hse_numero_cotizacion_key" ON "presupuestos_hse"("numero_cotizacion");

-- CreateIndex
CREATE INDEX "presupuestos_hse_estado_idx" ON "presupuestos_hse"("estado");

-- CreateIndex
CREATE INDEX "presupuestos_hse_cliente_nombre_idx" ON "presupuestos_hse"("cliente_nombre");

-- CreateIndex
CREATE INDEX "presupuestos_hse_created_at_idx" ON "presupuestos_hse"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "contadores_cotizacion_anio_key" ON "contadores_cotizacion"("anio");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_plantilla_evaluacion_id_fkey" FOREIGN KEY ("plantilla_evaluacion_id") REFERENCES "plantillas_evaluacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modulos" ADD CONSTRAINT "modulos_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preguntas" ADD CONSTRAINT "preguntas_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "modulos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examenes" ADD CONSTRAINT "examenes_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examenes" ADD CONSTRAINT "examenes_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examenes" ADD CONSTRAINT "examenes_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "modulos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_credencial" ADD CONSTRAINT "fotos_credencial_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_credencial" ADD CONSTRAINT "fotos_credencial_evaluador_id_fkey" FOREIGN KEY ("evaluador_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credenciales" ADD CONSTRAINT "credenciales_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credenciales" ADD CONSTRAINT "credenciales_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puestos" ADD CONSTRAINT "puestos_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_capacitacion" ADD CONSTRAINT "solicitudes_capacitacion_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_capacitacion" ADD CONSTRAINT "solicitudes_capacitacion_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones_capacitacion" ADD CONSTRAINT "sesiones_capacitacion_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones_capacitacion" ADD CONSTRAINT "sesiones_capacitacion_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones_capacitacion" ADD CONSTRAINT "sesiones_capacitacion_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias_sesion" ADD CONSTRAINT "asistencias_sesion_sesion_id_fkey" FOREIGN KEY ("sesion_id") REFERENCES "sesiones_capacitacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias_sesion" ADD CONSTRAINT "asistencias_sesion_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas_practicas" ADD CONSTRAINT "tareas_practicas_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "modulos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_tarea_id_fkey" FOREIGN KEY ("tarea_id") REFERENCES "tareas_practicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_evaluador_id_fkey" FOREIGN KEY ("evaluador_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta_items" ADD CONSTRAINT "venta_items_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_items" ADD CONSTRAINT "compra_items_compra_id_fkey" FOREIGN KEY ("compra_id") REFERENCES "compras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obd2_sessions" ADD CONSTRAINT "obd2_sessions_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "inscripciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

