from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth.jwt import decode_access_token
from core.database import prisma

from core.logging import logger

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to get the current authenticated user"""
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        logger.warning(f"Auth failure: Invalid or expired token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    
    user_id: str = payload.get("sub")
    if user_id is None:
        logger.warning(f"Auth failure: Token present but 'sub' claim missing")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    
    user = await prisma.user.find_unique(where={"id": user_id})
    
    if user is None:
        logger.warning(f"Auth failure: User {user_id} not found in database")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
        
    if not user.activo:
        logger.warning(f"Auth failure: User {user_id} is inactive")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User inactive",
        )
    
    return user

async def require_admin(current_user = Depends(get_current_user)):
    """Dependency to require admin role (INSTRUCTOR or SUPER_ADMIN)"""
    if current_user.rol not in ["INSTRUCTOR", "SUPER_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user

async def require_super_admin(current_user = Depends(get_current_user)):
    """Dependency to require super admin role"""
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin permissions required",
        )
    return current_user
