from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime
from prisma import Prisma
import logging
from core.security_utils import sanitize_data
from middleware.security import rate_limit_public

logger = logging.getLogger(__name__)
router = APIRouter()

# Schemas
class CotizacionCreate(BaseModel):
    # Datos del formulario
    empresa: str
    cuit: Optional[str] = None
    nombre: str
    email: EmailStr
    telefono: str
    comentarios: Optional[str] = None
    
    # Datos del cotizador
    quantity: int
    course: str
    modality: str
    totalPrice: float
    pricePerStudent: float
    discount: int
    
    # Consentimientos
    acceptMarketing: bool
    acceptTerms: bool

    @validator('empresa', 'nombre', 'comentarios', pre=True)
    def sanitize_text(cls, v):
        if isinstance(v, str):
            return sanitize_data(v)
        return v
    
    @validator('quantity')
    def validate_quantity(cls, v):
        if v < 1 or v > 500:
            raise ValueError('La cantidad debe estar entre 1 y 500')
        return v
    
    @validator('course')
    def validate_course(cls, v):
        valid_courses = ['defensivo', 'carga_pesada', '4x4', 'completo']
        if v not in valid_courses:
            raise ValueError(f'Curso inválido. Debe ser uno de: {", ".join(valid_courses)}')
        return v
    
    @validator('modality')
    def validate_modality(cls, v):
        valid_modalities = ['online', 'presencial', 'mixto']
        if v not in valid_modalities:
            raise ValueError(f'Modalidad inválida. Debe ser una de: {", ".join(valid_modalities)}')
        return v

class CotizacionResponse(BaseModel):
    id: int
    empresa: str
    nombre: str
    email: str
    telefono: str
    quantity: int
    course: str
    modality: str
    totalPrice: float
    status: str
    createdAt: datetime
    
    class Config:
        from_attributes = True


# Dependency to get Prisma client
async def get_db():
    db = Prisma()
    await db.connect()
    try:
        yield db
    finally:
        await db.disconnect()


@router.post("/", response_model=CotizacionResponse, status_code=201)
@rate_limit_public()
async def create_cotizacion(
    request: Request,
    cotizacion: CotizacionCreate,
    db: Prisma = Depends(get_db)
):
    """
    Crear una nueva cotización desde el formulario de la landing page.
    
    - **empresa**: Nombre de la empresa
    - **nombre**: Nombre del contacto
    - **email**: Email del contacto
    - **telefono**: Teléfono del contacto
    - **quantity**: Cantidad de conductores a capacitar
    - **course**: Tipo de curso (defensivo, carga_pesada, 4x4, completo)
    - **modality**: Modalidad (online, presencial, mixto)
    - **totalPrice**: Precio total calculado
    """
    try:
        # Crear la cotización en la base de datos
        new_cotizacion = await db.cotizacion.create(
            data={
                "empresa": cotizacion.empresa,
                "cuit": cotizacion.cuit,
                "nombre": cotizacion.nombre,
                "email": cotizacion.email,
                "telefono": cotizacion.telefono,
                "comentarios": cotizacion.comentarios,
                "quantity": cotizacion.quantity,
                "course": cotizacion.course,
                "modality": cotizacion.modality,
                "totalPrice": cotizacion.totalPrice,
                "pricePerStudent": cotizacion.pricePerStudent,
                "discount": cotizacion.discount,
                "acceptMarketing": cotizacion.acceptMarketing,
                "acceptTerms": cotizacion.acceptTerms,
                "status": "pending",  # pending, contacted, converted, rejected
            }
        )
        
        logger.info(f"Nueva cotización creada: {new_cotizacion.id} - {cotizacion.empresa}")
        
        # Enviar emails de notificación
        try:
            from services.email_service import email_service
            
            # Preparar datos para templates
            cotizacion_data = {
                "id": new_cotizacion.id,
                "empresa": new_cotizacion.empresa,
                "nombre": new_cotizacion.nombre,
                "email": new_cotizacion.email,
                "telefono": new_cotizacion.telefono,
                "comentarios": new_cotizacion.comentarios,
                "quantity": new_cotizacion.quantity,
                "course": new_cotizacion.course,
                "modality": new_cotizacion.modality,
                "totalPrice": new_cotizacion.totalPrice,
                "pricePerStudent": new_cotizacion.pricePerStudent,
                "discount": new_cotizacion.discount,
            }
            
            # Enviar email al equipo de ventas
            await email_service.send_cotizacion_ventas(cotizacion_data)
            
            # Enviar email de confirmación al cliente
            await email_service.send_cotizacion_cliente(cotizacion_data)
            
            logger.info(f"Emails enviados para cotización {new_cotizacion.id}")
        except Exception as email_error:
            # No fallar la creación si los emails fallan
            logger.error(f"Error enviando emails para cotización {new_cotizacion.id}: {str(email_error)}")
        
        return new_cotizacion
        
    except Exception as e:
        logger.error(f"Error al crear cotización: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al procesar la cotización: {str(e)}"
        )


@router.get("/", response_model=list[CotizacionResponse])
async def get_cotizaciones(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Prisma = Depends(get_db)
):
    """
    Obtener lista de cotizaciones (para panel administrativo).
    
    - **skip**: Número de registros a saltar (paginación)
    - **limit**: Número máximo de registros a retornar
    - **status**: Filtrar por estado (pending, contacted, converted, rejected)
    """
    try:
        where_clause = {}
        if status:
            where_clause["status"] = status
        
        cotizaciones = await db.cotizacion.find_many(
            where=where_clause,
            skip=skip,
            take=limit,
            order={"createdAt": "desc"}
        )
        
        return cotizaciones
        
    except Exception as e:
        logger.error(f"Error al obtener cotizaciones: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener cotizaciones: {str(e)}"
        )


@router.get("/{cotizacion_id}", response_model=CotizacionResponse)
async def get_cotizacion(
    cotizacion_id: int,
    db: Prisma = Depends(get_db)
):
    """
    Obtener una cotización específica por ID.
    """
    try:
        cotizacion = await db.cotizacion.find_unique(
            where={"id": cotizacion_id}
        )
        
        if not cotizacion:
            raise HTTPException(
                status_code=404,
                detail=f"Cotización con ID {cotizacion_id} no encontrada"
            )
        
        return cotizacion
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al obtener cotización {cotizacion_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener cotización: {str(e)}"
        )


@router.patch("/{cotizacion_id}/status")
async def update_cotizacion_status(
    cotizacion_id: int,
    status: str,
    db: Prisma = Depends(get_db)
):
    """
    Actualizar el estado de una cotización.
    
    - **status**: Nuevo estado (pending, contacted, converted, rejected)
    """
    valid_statuses = ["pending", "contacted", "converted", "rejected"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Estado inválido. Debe ser uno de: {', '.join(valid_statuses)}"
        )
    
    try:
        cotizacion = await db.cotizacion.update(
            where={"id": cotizacion_id},
            data={"status": status}
        )
        
        logger.info(f"Cotización {cotizacion_id} actualizada a estado: {status}")
        
        return {"message": "Estado actualizado correctamente", "cotizacion": cotizacion}
        
    except Exception as e:
        logger.error(f"Error al actualizar cotización {cotizacion_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar cotización: {str(e)}"
        )


# Schema para conversión
class ConvertCotizacionRequest(BaseModel):
    """Datos para convertir cotización a cliente"""
    empresaNombre: Optional[str] = None  # Si no se provee, usa el de la cotización
    empresaCuit: Optional[str] = None
    empresaDireccion: Optional[str] = None
    empresaTelefono: Optional[str] = None
    cantidadAlumnos: Optional[int] = None  # Si no se provee, usa quantity de cotización

    @validator('empresaNombre', 'empresaCuit', 'empresaDireccion', 'empresaTelefono', pre=True)
    def sanitize_text(cls, v):
        if isinstance(v, str):
            return sanitize_data(v)
        return v


class ConvertCotizacionResponse(BaseModel):
    """Respuesta de conversión exitosa"""
    empresa: dict
    alumnos: list[dict]
    inscripciones: list[dict]
    credenciales: dict
    message: str


@router.post("/{cotizacion_id}/convert", response_model=ConvertCotizacionResponse)
async def convert_cotizacion_to_client(
    cotizacion_id: int,
    data: ConvertCotizacionRequest,
    db: Prisma = Depends(get_db)
):
    """
    Convertir una cotización en cliente activo.
    
    Este endpoint realiza las siguientes acciones:
    1. Valida que la cotización exista y esté en estado 'contacted'
    2. Crea una nueva empresa con los datos de la cotización
    3. Genera N alumnos según la cantidad especificada
    4. Crea inscripciones al curso para todos los alumnos
    5. Envía emails de bienvenida con credenciales
    6. Marca la cotización como 'converted'
    
    Returns:
        - empresa: Datos de la empresa creada
        - alumnos: Lista de alumnos creados con sus credenciales
        - inscripciones: Lista de inscripciones creadas
        - credenciales: Credenciales de acceso para la empresa
    """
    import secrets
    import string
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    try:
        # 1. Obtener y validar cotización
        cotizacion = await db.cotizacion.find_unique(
            where={"id": cotizacion_id}
        )
        
        if not cotizacion:
            raise HTTPException(
                status_code=404,
                detail=f"Cotización {cotizacion_id} no encontrada"
            )
        
        if cotizacion.status != "contacted":
            raise HTTPException(
                status_code=400,
                detail=f"Solo se pueden convertir cotizaciones en estado 'contacted'. Estado actual: {cotizacion.status}"
            )
        
        # 2. Preparar datos de la empresa
        empresa_nombre = data.empresaNombre or cotizacion.empresa
        empresa_cuit = data.empresaCuit or cotizacion.cuit or f"TEMP-{cotizacion_id}"
        empresa_direccion = data.empresaDireccion or ""
        empresa_telefono = data.empresaTelefono or cotizacion.telefono
        cantidad_alumnos = data.cantidadAlumnos or cotizacion.quantity
        
        # Verificar si ya existe una empresa con ese CUIT
        empresa_existente = await db.company.find_unique(
            where={"cuit": empresa_cuit}
        )
        
        if empresa_existente:
            raise HTTPException(
                status_code=400,
                detail=f"Ya existe una empresa con CUIT {empresa_cuit}"
            )
        
        # 3. Crear empresa
        empresa = await db.company.create(
            data={
                "nombre": empresa_nombre,
                "cuit": empresa_cuit,
                "direccion": empresa_direccion,
                "telefono": empresa_telefono,
                "email": cotizacion.email,
                "activa": True
            }
        )
        
        logger.info(f"Empresa creada: {empresa.id} - {empresa.nombre}")
        
        # 4. Mapear curso de cotización a curso en BD
        course_mapping = {
            "defensivo": "COND-DEF",
            "carga_pesada": "COND-CP",
            "4x4": "COND-4X4",
            "completo": "COND-COMP"
        }
        
        curso_codigo = course_mapping.get(cotizacion.course)
        if not curso_codigo:
            raise HTTPException(
                status_code=400,
                detail=f"Curso '{cotizacion.course}' no reconocido"
            )
        
        # Buscar curso en BD
        curso = await db.curso.find_first(
            where={"codigo": curso_codigo}
        )
        
        if not curso:
            raise HTTPException(
                status_code=404,
                detail=f"Curso con código '{curso_codigo}' no encontrado en la base de datos"
            )
        
        # 5. Generar contraseña temporal para alumnos
        def generate_password(length=12):
            """Genera una contraseña segura aleatoria"""
            alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
            return ''.join(secrets.choice(alphabet) for _ in range(length))
        
        # 6. Crear alumnos
        alumnos_creados = []
        inscripciones_creadas = []
        credenciales_alumnos = []
        
        for i in range(1, cantidad_alumnos + 1):
            # Generar datos del alumno
            alumno_nombre = f"Alumno {i}"
            alumno_apellido = empresa_nombre
            alumno_dni = f"TEMP-{empresa.id[:8]}-{i:03d}"
            alumno_email = f"alumno{i}@{empresa_cuit.lower()}.vmp.temp"
            password_temporal = generate_password()
            
            # Crear alumno
            alumno = await db.user.create(
                data={
                    "email": alumno_email,
                    "passwordHash": pwd_context.hash(password_temporal),
                    "nombre": alumno_nombre,
                    "apellido": alumno_apellido,
                    "dni": alumno_dni,
                    "telefono": empresa_telefono,
                    "rol": "ALUMNO",
                    "empresaId": empresa.id,
                    "activo": True
                }
            )
            
            logger.info(f"Alumno creado: {alumno.id} - {alumno.nombre} {alumno.apellido}")
            
            # Crear inscripción al curso
            inscripcion = await db.inscripcion.create(
                data={
                    "alumnoId": alumno.id,
                    "cursoId": curso.id,
                    "progreso": 0,
                    "estado": "NO_INICIADO"
                }
            )
            
            logger.info(f"Inscripción creada: {inscripcion.id} - Alumno {alumno.id} en curso {curso.id}")
            
            # Guardar datos para respuesta
            alumnos_creados.append({
                "id": alumno.id,
                "nombre": alumno.nombre,
                "apellido": alumno.apellido,
                "email": alumno.email,
                "dni": alumno.dni,
                "password_temporal": password_temporal  # Solo para mostrar una vez
            })
            
            inscripciones_creadas.append({
                "id": inscripcion.id,
                "alumnoId": alumno.id,
                "cursoId": curso.id,
                "curso": curso.nombre
            })
            
            credenciales_alumnos.append({
                "email": alumno.email,
                "password": password_temporal
            })
        
        # 7. Actualizar cotización a 'converted'
        await db.cotizacion.update(
            where={"id": cotizacion_id},
            data={"status": "converted"}
        )
        
        logger.info(f"Cotización {cotizacion_id} marcada como convertida")
        
        # 8. Enviar email de bienvenida
        try:
            from services.email_service import email_service
            
            empresa_data = {
                "nombre": empresa.nombre,
                "email": empresa.email,
                "cuit": empresa.cuit,
                "cantidad_alumnos": cantidad_alumnos,
                "curso": curso.nombre,
                "credenciales": credenciales_alumnos
            }
            
            await email_service.send_empresa_bienvenida(empresa_data)
            logger.info(f"Email de bienvenida enviado a {empresa.email}")
        except Exception as email_error:
            logger.error(f"Error enviando email de bienvenida: {str(email_error)}")
            # No fallar la conversión si el email falla
        
        # 9. Retornar resultado
        return {
            "empresa": {
                "id": empresa.id,
                "nombre": empresa.nombre,
                "cuit": empresa.cuit,
                "email": empresa.email
            },
            "alumnos": alumnos_creados,
            "inscripciones": inscripciones_creadas,
            "credenciales": {
                "empresa_email": empresa.email,
                "alumnos": credenciales_alumnos,
                "nota": "Estas credenciales solo se muestran una vez. Guárdalas en un lugar seguro."
            },
            "message": f"Conversión exitosa: Empresa creada con {cantidad_alumnos} alumnos inscritos en {curso.nombre}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al convertir cotización {cotizacion_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al convertir cotización: {str(e)}"
        )
