from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from core.database import ensure_db_connected
import logging

logger = logging.getLogger("db-middleware")

class DatabaseConnectionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip for health check if desired, but safest to just ensure connection
        if not request.url.path.startswith("/health"):
            try:
                # Ensure DB is connected before any endpoint logic runs
                await ensure_db_connected()
            except Exception as e:
                logger.error(f"Failed to ensure database connection: {e}")
                # We let it proceed, the endpoint will likely fail with a 500
                # but it's better than hanging the entire request
        
        response = await call_next(request)
        return response
