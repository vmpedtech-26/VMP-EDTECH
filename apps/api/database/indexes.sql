-- Índices para optimizar performance de la base de datos
-- VMP Servicios

-- Índices para tabla users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_rol ON users(rol);
CREATE INDEX IF NOT EXISTS idx_users_empresa_id ON users(empresa_id);
CREATE INDEX IF NOT EXISTS idx_users_activo ON users(activo);

-- Índices para tabla cotizaciones
CREATE INDEX IF NOT EXISTS idx_cotizaciones_status ON cotizaciones(status);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_email ON cotizaciones(email);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_created_at ON cotizaciones(created_at);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_status_created ON cotizaciones(status, created_at);

-- Índices para tabla inscripciones
CREATE INDEX IF NOT EXISTS idx_inscripciones_alumno_id ON inscripciones(alumno_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_curso_id ON inscripciones(curso_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_estado ON inscripciones(estado);
CREATE INDEX IF NOT EXISTS idx_inscripciones_alumno_estado ON inscripciones(alumno_id, estado);

-- Índices para tabla credenciales
CREATE INDEX IF NOT EXISTS idx_credenciales_numero ON credenciales(numero);
CREATE INDEX IF NOT EXISTS idx_credenciales_alumno_id ON credenciales(alumno_id);
CREATE INDEX IF NOT EXISTS idx_credenciales_curso_id ON credenciales(curso_id);
CREATE INDEX IF NOT EXISTS idx_credenciales_fecha_vencimiento ON credenciales(fecha_vencimiento);

-- Índices para tabla password_reset_tokens
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_used ON password_reset_tokens(used);

-- Índices para tabla companies
CREATE INDEX IF NOT EXISTS idx_companies_cuit ON companies(cuit);
CREATE INDEX IF NOT EXISTS idx_companies_activo ON companies(activo);

-- Índices compuestos para queries frecuentes
CREATE INDEX IF NOT EXISTS idx_inscripciones_curso_estado ON inscripciones(curso_id, estado);
CREATE INDEX IF NOT EXISTS idx_credenciales_alumno_curso ON credenciales(alumno_id, curso_id);

-- Comentarios para documentación
COMMENT ON INDEX idx_users_email IS 'Optimiza búsquedas de usuarios por email (login)';
COMMENT ON INDEX idx_cotizaciones_status_created IS 'Optimiza filtrado de cotizaciones por estado y fecha';
COMMENT ON INDEX idx_inscripciones_alumno_estado IS 'Optimiza consultas de inscripciones activas por alumno';
COMMENT ON INDEX idx_credenciales_numero IS 'Optimiza validación pública de credenciales';
