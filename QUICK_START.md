# Guía Rápida de Inicio - VMP Servicios

## Iniciar Servidores

### Opción 1: Script Automático (Recomendado)

```bash
cd /Users/matias/.gemini/antigravity/scratch/vmp-servicios
./start-servers.sh
```

### Opción 2: Manual (Dos Terminales)

**Terminal 1 - Backend:**
```bash
cd /Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/api
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd /Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/web
npm run dev
```

---

## URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Prisma Studio**: `cd apps/api && prisma studio`

---

## Flujo de Testing

### 1. Login como Instructor
```
Email: instructor@empresa.com
Password: [tu contraseña]
```

### 2. Gestión de Fotos
1. Ir a **Capacitaciones > Participantes**
2. Seleccionar empresa (si tienes varias)
3. Subir foto para un alumno
4. Aprobar o rechazar la foto

### 3. Revisión de Evaluaciones
1. Ir a **Capacitaciones > Evaluaciones**
2. Ver exámenes completados
3. Filtrar por estado
4. Buscar por nombre o DNI

### 4. Generar Credencial con Foto
1. Asegurarse que el alumno tiene:
   - ✅ Curso completado
   - ✅ Exámenes aprobados
   - ✅ Foto APROBADA
2. Generar credencial desde el panel
3. Descargar PDF y verificar que incluye la foto

---

## Troubleshooting

### Puerto en uso
```bash
# Verificar qué está usando el puerto
lsof -i :8000
lsof -i :3000

# Matar proceso
kill -9 $(lsof -ti:8000)
kill -9 $(lsof -ti:3000)
```

### Error de migración
```bash
cd apps/api
prisma migrate dev
prisma generate
```

### Error de dependencias
```bash
# Backend
cd apps/api
pip install -r requirements.txt

# Frontend
cd apps/web
npm install
```

---

## Archivos Importantes

- **Walkthrough completo**: [walkthrough.md](file:///Users/matias/.gemini/antigravity/brain/62afe0ca-9538-4743-bd47-e2fa8fa05b4b/walkthrough.md)
- **Guía de testing**: [testing_guide.md](file:///Users/matias/.gemini/antigravity/brain/62afe0ca-9538-4743-bd47-e2fa8fa05b4b/testing_guide.md)
- **Plan de implementación**: [implementation_plan.md](file:///Users/matias/.gemini/antigravity/brain/62afe0ca-9538-4743-bd47-e2fa8fa05b4b/implementation_plan.md)
