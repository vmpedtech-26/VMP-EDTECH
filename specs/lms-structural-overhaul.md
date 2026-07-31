# Spec: Mejoras Estructurales VMP-EdTech LMS

## 1. Objetivo
Resolver los 8 problemas estructurales críticos detectados en el sistema LMS y agregar las entidades y flujos faltantes para que las capacitaciones Online e In-Company puedan crearse, gestionarse y realizarse sin errores de conectividad.

---

## 2. Problemas Críticos Detectados

### 🔴 Bug #1 — Campo `alumnosEsperados` inexistente en Prisma
El campo `alumnosEsperados` está referenciado en `schemas/cursos.py` y `routers/cursos.py` pero NO existe en `schema.prisma`. Cualquier operación de creación o edición de curso falla silenciosamente o con error 500.

### 🔴 Bug #2 — Doble tracking de módulos completados
- Existe la tabla `modulos_completados` en Prisma (nunca usada por el código).
- El código usa `inscripciones.modulosCompletados` (JSON string) para toda la lógica de progreso.
- Esto provoca deuda técnica e inconsistencias potenciales de datos.

### 🟠 Mejora #3 — Sin campo `modalidad` en Curso
No hay distinción entre capacitaciones ONLINE, IN_COMPANY o HYBRID. Ambas modalidades deben tratarse diferente en flujo, interfaz e instructor.

### 🟠 Mejora #4 — Sin instructor asignado a Curso
No hay relación entre `Instructor` y `Curso`. Los instructores ven todos los cursos del sistema en lugar de solo los propios. No se puede filtrar participantes, evaluaciones ni credenciales por instructor.

### 🟠 Mejora #5 — Sin modelo `SesionCapacitacion`
Para capacitaciones In-Company se necesitan sesiones programadas (fecha, hora, lugar, grupo de alumnos). Actualmente solo existe `liveClassDate` en Módulo, que no permite agendar múltiples fechas ni registrar asistencia grupal.

### 🟡 Mejora #6 — Examen sin relación formal a Módulo
`Examen.modulo_id` es un String suelto sin relación Prisma (`@relation`). No garantiza integridad referencial ni permite queries relacionales eficientes.

### 🟡 Mejora #7 — Sidebar del Instructor incompleto
El menú del INSTRUCTOR no incluye "Mis Cursos" ni "Sesiones Programadas". Los instructores no pueden navegar fácilmente a sus capacitaciones.

### 🟡 Mejora #8 — Roles SUPERVISOR y CONTADOR en frontend pero no en BD
El `Sidebar.tsx` referencia roles `SUPERVISOR` y `CONTADOR` que no existen en el `UserRole` enum de Prisma.

---

## 3. Solución Propuesta

### 3.1 Cambios de Schema (Prisma)

**Agregar enum `ModalidadCurso`:**
```prisma
enum ModalidadCurso {
  ONLINE
  IN_COMPANY
  HYBRID
}
```

**Modificar modelo `Curso`:**
- Agregar `alumnosEsperados Int @default(0)` (fix Bug #1)
- Agregar `modalidad ModalidadCurso @default(ONLINE)` (Mejora #3)
- Agregar `instructorId String? @map("instructor_id")` con relación a User (Mejora #4)
- Agregar relación `sesiones SesionCapacitacion[]` (Mejora #5)

**Modificar modelo `User`:**
- Agregar `cursosComoInstructor Curso[] @relation("InstructorCursos")`

**Nuevo modelo `SesionCapacitacion`:**
```prisma
model SesionCapacitacion {
  id          String   @id @default(uuid())
  cursoId     String   @map("curso_id")
  titulo      String
  descripcion String?
  fechaInicio DateTime @map("fecha_inicio")
  fechaFin    DateTime @map("fecha_fin")
  lugar       String?
  plataforma  String?  // zoom, teams, meet, presencial
  meetLink    String?  @map("meet_link")
  estado      String   @default("PROGRAMADA")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  curso       Curso    @relation(fields: [cursoId], references: [id], onDelete: Cascade)
  asistencias AsistenciaSesion[]

  @@map("sesiones_capacitacion")
}
```

**Nuevo modelo `AsistenciaSesion`:**
```prisma
model AsistenciaSesion {
  id        String             @id @default(uuid())
  sesionId  String             @map("sesion_id")
  alumnoId  String             @map("alumno_id")
  presente  Boolean            @default(false)
  checkIn   DateTime?          @map("check_in")
  sesion    SesionCapacitacion @relation(...)
  alumno    User               @relation(...)

  @@unique([sesionId, alumnoId])
  @@map("asistencias_sesion")
}
```

**Eliminar tabla `modulos_completados`** (Bug #2 — fix consolidación):
Se elimina del schema y la lógica queda centrada en el JSON de `Inscripcion.modulosCompletados`.

**Agregar UserRole adicionales** (Mejora #8):
```prisma
enum UserRole {
  SUPER_ADMIN
  INSTRUCTOR
  ALUMNO
  SUPERVISOR  // empresa fleet manager
  CONTADOR    // accounting access
}
```

### 3.2 Backend (FastAPI)

**Nuevo router `sesiones.py`:**
- `POST /sesiones` — Crear sesión (SUPER_ADMIN)
- `GET /sesiones?cursoId=` — Listar sesiones por curso
- `GET /sesiones/proximas` — Próximas sesiones del instructor actual
- `PATCH /sesiones/{id}` — Editar sesión
- `POST /sesiones/{id}/asistencia` — Registrar asistencia masiva

**Actualizar `routers/cursos.py`:**
- Incluir `modalidad` e `instructorId` en create/update
- Para rol INSTRUCTOR: filtrar por `instructorId = current_user.id`
- Incluir sesiones en detalle de curso

**Actualizar `schemas/cursos.py`:**
- Agregar `modalidad`, `instructorId` a `CursoListItem`, `CursoDetail`, `CreateCursoRequest`, `UpdateCursoRequest`

**Registrar router en `main.py`**

### 3.3 Frontend (Next.js)

**Sidebar.tsx:**
- INSTRUCTOR: Agregar "Mis Cursos" (`/dashboard/instructor/cursos`) y "Sesiones" (`/dashboard/instructor/sesiones`)
- SUPER_ADMIN: Agregar "Sesiones" (`/dashboard/super/sesiones`)

**CursoForm.tsx:**
- Agregar campo `modalidad` (radio/select: Online / In Company / Híbrido)
- Agregar campo `instructorId` (select de instructores del sistema)

**Nueva página `dashboard/super/sesiones/page.tsx`:**
- Tabla de todas las sesiones programadas con filtros por curso/estado
- Botón "Nueva Sesión" con formulario (curso, fecha inicio/fin, lugar/meet link)
- Vista de asistencia por sesión

**Nueva página `dashboard/instructor/sesiones/page.tsx`:**
- Próximas sesiones asignadas al instructor
- Registro de asistencia por sesión (lista de alumnos con checkbox)

**Actualizar `dashboard/instructor/cursos/page.tsx`:**
- Mostrar solo cursos donde `instructorId = currentUser.id`

---

## 4. Flujo de Capacitación (End-to-End conectado)

```
Super Admin crea Curso (modalidad + instructor asignado)
    ↓
Super Admin agenda SesionCapacitacion (fecha + lugar + meet link)
    ↓
Super Admin inscribe alumnos al curso
    ↓
Alumno ve su curso y próxima sesión en dashboard
    ↓
Día de capacitación: Instructor registra asistencia en sesión
    ↓
Alumno completa módulos → progreso actualizado automáticamente
    ↓
Alumno aprueba examen → credencial generada automáticamente
    ↓
Super Admin e Instructor ven métricas en tiempo real
```

---

## 5. Archivos a Crear/Modificar

### Nuevos:
- `apps/api/routers/sesiones.py`
- `apps/api/schemas/sesiones.py`
- `apps/web/app/dashboard/super/sesiones/page.tsx`
- `apps/web/app/dashboard/instructor/sesiones/page.tsx`

### Modificados:
- `apps/api/prisma/schema.prisma`
- `apps/api/routers/cursos.py`
- `apps/api/schemas/cursos.py`
- `apps/api/main.py`
- `apps/web/components/layout/Sidebar.tsx`
- `apps/web/components/admin/CursoForm.tsx`
- `apps/web/app/dashboard/instructor/cursos/page.tsx`
