import logging
from typing import Optional
from core.database import prisma

logger = logging.getLogger(__name__)

class SecurityService:
    """
    Centralized service for logging security and audit events.
    Aligns with the NICE Framework categories:
    - Oversight & Govern (compliance & logging)
    - Protect & Defend (intrusion and abuse logging)
    - Investigate (evidence gathering)
    """

    @staticmethod
    async def log_event(
        action: str,
        details: Optional[str] = None,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        ip_address: Optional[str] = None,
        request_id: Optional[str] = None
    ) -> None:
        """
        Base method to write a structured security log to the database and standard logging.
        """
        try:
            # 1. Log to database in background
            if prisma.is_connected():
                await prisma.auditlog.create(
                    data={
                        "action": action,
                        "details": details,
                        "userId": user_id,
                        "userEmail": user_email,
                        "ipAddress": ip_address,
                        "requestId": request_id
                    }
                )
            
            # 2. Log to corporate stdout/syslog for SIEM ingestion (Data Analysis & System Admin roles)
            log_msg = f"[SECURITY EVENT] Action: {action} | IP: {ip_address or 'N/A'} | User: {user_email or 'N/A'} | ReqID: {request_id or 'N/A'} | Details: {details or 'None'}"
            if "FAILURE" in action or "DENIED" in action or "EXCEEDED" in action:
                logger.warning(log_msg)
            else:
                logger.info(log_msg)
        except Exception as e:
            # Fallback to local standard logger so security logging never crashes the app
            logger.error(f"Error writing security audit log: {str(e)}", exc_info=True)

    @classmethod
    async def log_auth_success(
        cls,
        email: str,
        user_id: str,
        ip_address: Optional[str] = None,
        request_id: Optional[str] = None
    ) -> None:
        await cls.log_event(
            action="AUTH_SUCCESS",
            details="User logged in successfully",
            user_id=user_id,
            user_email=email,
            ip_address=ip_address,
            request_id=request_id
        )

    @classmethod
    async def log_auth_failure(
        cls,
        email: str,
        reason: str,
        ip_address: Optional[str] = None,
        request_id: Optional[str] = None
    ) -> None:
        await cls.log_event(
            action="AUTH_FAILURE",
            details=f"Login failed: {reason}",
            user_email=email,
            ip_address=ip_address,
            request_id=request_id
        )

    @classmethod
    async def log_access_denied(
        cls,
        email: str,
        resource_path: str,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        request_id: Optional[str] = None
    ) -> None:
        await cls.log_event(
            action="ACCESS_DENIED",
            details=f"Attempted unauthorized access to resource: {resource_path}",
            user_id=user_id,
            user_email=email,
            ip_address=ip_address,
            request_id=request_id
        )

    @classmethod
    async def log_rate_limit_exceeded(
        cls,
        ip_address: str,
        endpoint: str,
        request_id: Optional[str] = None
    ) -> None:
        await cls.log_event(
            action="RATE_LIMIT_EXCEEDED",
            details=f"Rate limit hit on endpoint: {endpoint}",
            ip_address=ip_address,
            request_id=request_id
        )

    @classmethod
    async def log_sso_config_change(
        cls,
        email: str,
        company_id: str,
        details: str,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        request_id: Optional[str] = None
    ) -> None:
        await cls.log_event(
            action="SSO_CONFIG_CHANGE",
            details=f"Company ID {company_id} SSO modified: {details}",
            user_id=user_id,
            user_email=email,
            ip_address=ip_address,
            request_id=request_id
        )

    @classmethod
    async def log_user_role_change(
        cls,
        email: str,
        target_user_email: str,
        old_role: str,
        new_role: str,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        request_id: Optional[str] = None
    ) -> None:
        await cls.log_event(
            action="USER_ROLE_CHANGE",
            details=f"Changed role of {target_user_email} from {old_role} to {new_role}",
            user_id=user_id,
            user_email=email,
            ip_address=ip_address,
            request_id=request_id
        )

security_service = SecurityService()
