from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from core.database import ensure_db_connected
import logging

logger = logging.getLogger("db-middleware")

class DatabaseConnectionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip for health check
        if not request.url.path.startswith("/health"):
            try:
                import asyncio
                # Use an 8s timeout for initial lazy connection
                try:
                    await asyncio.wait_for(ensure_db_connected(), timeout=8.0)
                except asyncio.TimeoutError:
                    logger.error("Database connection timeout (8s) during request")
                    return JSONResponse(
                        status_code=503,
                        content={"detail": "La base de datos no responde. Por favor, reintente en unos instantes."}
                    )
            except Exception as e:
                logger.error(f"Failed to ensure database connection: {e}")
                return JSONResponse(
                    status_code=503,
                    content={"detail": f"Error de conexión a la base de datos: {str(e)}"}
                )
        
        response = await call_next(request)
        return response
