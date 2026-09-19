from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth.jwt import decode_access_token
from core.database import prisma
from services.security_service import security_service

security = HTTPBearer()


async def _log_access_denied(request: Request, current_user) -> None:
    """SecurityService.log_access_denied existía pero nunca se llamaba --
    el panel de Métricas de Seguridad mostraba access_denied siempre en 0."""
    try:
        await security_service.log_access_denied(
            email=current_user.email,
            resource_path=request.url.path,
            user_id=current_user.id,
            ip_address=request.client.host if request.client else "N/A",
            request_id=getattr(request.state, "request_id", None),
        )
    except Exception as audit_err:
        print(f"⚠️ Error al registrar log de auditoria de acceso denegado: {audit_err}")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to get the current authenticated user"""
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    
    user = await prisma.user.find_unique(where={"id": user_id})
    
    if user is None or not user.activo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    
    return user

async def require_admin(request: Request, current_user = Depends(get_current_user)):
    """Dependency to require admin role (INSTRUCTOR or SUPER_ADMIN)"""
    if current_user.rol not in ["INSTRUCTOR", "SUPER_ADMIN"]:
        await _log_access_denied(request, current_user)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user

async def require_super_admin(request: Request, current_user = Depends(get_current_user)):
    """Dependency to require super admin role"""
    if current_user.rol != "SUPER_ADMIN":
        await _log_access_denied(request, current_user)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin permissions required",
        )
    return current_user

class RequireRole:
    """Dependency factory: require the current user's rol to be one of `roles`."""

    def __init__(self, roles: list[str]):
        self.roles = roles

    async def __call__(self, request: Request, current_user = Depends(get_current_user)):
        if current_user.rol not in self.roles:
            await _log_access_denied(request, current_user)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para acceder a este recurso",
            )
        return current_user
