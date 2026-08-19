import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from jose import JWTError, jwt as jose_jwt
from pydantic import BaseModel, EmailStr

from auth.jwt import create_access_token, hash_password
from core.config import settings
from core.database import prisma
from middleware.security import rate_limit_login, rate_limit_public
from services import sso_service

router = APIRouter()

STATE_TYPE = "sso_state"
STATE_TTL_MINUTES = 10


def _domain_from_email(email: str) -> str:
    return email.rsplit("@", 1)[-1].strip().lower()


def _sign_state(domain: str) -> str:
    payload = {
        "typ": STATE_TYPE,
        "domain": domain,
        "nonce": secrets.token_urlsafe(16),
        "exp": datetime.utcnow() + timedelta(minutes=STATE_TTL_MINUTES),
    }
    return jose_jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def _verify_state(state: str) -> str:
    try:
        payload = jose_jwt.decode(state, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Estado de SSO inválido o expirado")

    if payload.get("typ") != STATE_TYPE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Estado de SSO inválido")

    return payload["domain"]


async def _find_empresa_sso(domain: str):
    return await prisma.company.find_first(
        where={"ssoActive": True, "ssoDomain": domain, "activa": True}
    )


class SsoCheckRequest(BaseModel):
    email: EmailStr


@router.post("/check")
@rate_limit_public()
async def sso_check(request: Request, data: SsoCheckRequest):
    """Indica si el dominio del email tiene SSO corporativo activo."""
    domain = _domain_from_email(data.email)
    empresa = await _find_empresa_sso(domain)

    if not empresa:
        return {"sso_active": False}

    return {
        "sso_active": True,
        "domain": empresa.ssoDomain,
        "provider": empresa.ssoProvider,
        "empresa_nombre": empresa.nombre,
    }


@router.get("/login")
@rate_limit_public()
async def sso_login(request: Request, domain: str):
    """Redirige al usuario al proveedor de identidad de su empresa (Azure AD)."""
    domain = domain.strip().lower()
    empresa = await _find_empresa_sso(domain)

    if not empresa:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No hay SSO activo para ese dominio")

    if not (empresa.ssoClientId and empresa.ssoTenantId and empresa.ssoClientSecret):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="La configuración de SSO de la empresa está incompleta",
        )

    state = _sign_state(domain)
    redirect_uri = f"{settings.FRONTEND_URL}/auth/sso/callback"
    authorize_url = sso_service.build_authorize_url(empresa, redirect_uri, state)

    return RedirectResponse(authorize_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)


class SsoCallbackRequest(BaseModel):
    code: str
    state: str


@router.post("/callback")
@rate_limit_login()
async def sso_callback(request: Request, data: SsoCallbackRequest):
    """Recibe el código de autorización (reenviado por el frontend tras el redirect de Azure),
    lo canjea server-side y crea/vincula el usuario (Just-In-Time provisioning)."""
    domain = _verify_state(data.state)
    empresa = await _find_empresa_sso(domain)

    if not empresa:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No hay SSO activo para ese dominio")

    redirect_uri = f"{settings.FRONTEND_URL}/auth/sso/callback"
    try:
        id_token = sso_service.exchange_code_for_id_token(empresa, data.code, redirect_uri)
        claims = sso_service.validate_id_token(empresa, id_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))

    email = (claims.get("email") or claims.get("preferred_username") or "").strip().lower()
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El proveedor de identidad no devolvió un email",
        )

    if _domain_from_email(email) != empresa.ssoDomain:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El email autenticado no pertenece al dominio autorizado para esta empresa",
        )

    user = await prisma.user.find_unique(where={"email": email})

    if not user:
        dni = f"sso-{secrets.token_hex(6)}"
        for _ in range(3):
            if not await prisma.user.find_unique(where={"dni": dni}):
                break
            dni = f"sso-{secrets.token_hex(6)}"

        user = await prisma.user.create(
            data={
                "email": email,
                "passwordHash": hash_password(secrets.token_urlsafe(32)),
                "nombre": claims.get("given_name") or "Usuario",
                "apellido": claims.get("family_name") or "",
                "dni": dni,
                "rol": "ALUMNO",
                "empresaId": empresa.id,
                "activo": True,
            }
        )
    elif not user.empresaId:
        user = await prisma.user.update(where={"id": user.id}, data={"empresaId": empresa.id})

    if not user.activo:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="El usuario está inactivo")

    access_token = create_access_token(data={"sub": user.id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "nombre": user.nombre,
            "apellido": user.apellido,
            "dni": user.dni,
            "rol": user.rol,
            "empresaId": user.empresaId,
        },
    }
