# VMP Servicios API

Backend FastAPI para la plataforma de capacitación profesional VMP Servicios.

## Setup

### 1. Crear entorno virtual

```bash
python3 -m venv venv
source venv/bin/activate  # En Mac/Linux
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
```

### 4. Generar cliente Prisma

```bash
prisma generate
```

### 5. Ejecutar migraciones

```bash
prisma db push
```

### 6. Iniciar servidor

```bash
uvicorn main:app --reload --port 8000
```

## Documentación API

Una vez iniciado el servidor, accede a:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Estructura

```
apps/api/
├── main.py              # App FastAPI principal
├── core/
│   ├── config.py        # Configuración
│   └── database.py      # Prisma setup
├── auth/
│   ├── jwt.py           # JWT utils
│   └── dependencies.py  # Auth middleware
├── routers/             # Endpoints API
├── services/            # Lógica de negocio
├── schemas/             # Pydantic models
└── prisma/
    └── schema.prisma    # Database schema
```
