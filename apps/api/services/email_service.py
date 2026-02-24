"""
Email Service for VMP - EDTECH
Handles all email sending with HTML templates
"""

import os
import logging
from typing import Optional, Dict, Any
from pathlib import Path
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib
from jinja2 import Environment, FileSystemLoader

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.sendgrid.net")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "apikey")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.email_from = os.getenv("EMAIL_FROM", "noreply@vmp-edtech.com")
        self.email_ventas = os.getenv("EMAIL_VENTAS", "ventas@vmp-edtech.com")
        
        # Setup Jinja2 for templates
        template_dir = Path(__file__).parent.parent / "templates"
        self.jinja_env = Environment(loader=FileSystemLoader(str(template_dir)))
        
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        from_email: Optional[str] = None,
        attachments: Optional[list[str]] = None
    ) -> bool:
        """
        Send an email using SMTP with optional attachments
        """
        # Development mode: if no SMTP password, just log the email
        if not self.smtp_password:
            logger.info("=" * 80)
            logger.info("📧 EMAIL (DEVELOPMENT MODE - NOT SENT)")
            logger.info(f"To: {to_email}")
            logger.info(f"From: {from_email or self.email_from}")
            logger.info(f"Subject: {subject}")
            logger.info(f"Attachments: {attachments}")
            logger.info(f"Content preview: {html_content[:200]}...")
            logger.info("=" * 80)
            return True
        
        try:
            from email.mime.application import MIMEApplication
            
            message = MIMEMultipart("mixed")
            message["From"] = from_email or self.email_from
            message["To"] = to_email
            message["Subject"] = subject
            
            # Alternative part for HTML
            alt_part = MIMEMultipart("alternative")
            html_part = MIMEText(html_content, "html")
            alt_part.attach(html_part)
            message.attach(alt_part)
            
            # Add attachments
            if attachments:
                for file_path in attachments:
                    if not os.path.exists(file_path):
                        logger.warning(f"Attachment not found: {file_path}")
                        continue
                        
                    with open(file_path, "rb") as f:
                        part = MIMEApplication(f.read(), Name=os.path.basename(file_path))
                        part['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
                        message.attach(part)
            
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user,
                password=self.smtp_password,
                start_tls=True,
            )
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {str(e)}")
            return False
    
    async def send_cotizacion_ventas(self, cotizacion: Dict[str, Any]) -> bool:
        """
        Send notification to sales team about new quote
        """
        template = self.jinja_env.get_template("email_cotizacion_ventas.html")
        html_content = template.render(cotizacion=cotizacion)
        
        subject = f"Nueva Cotización: {cotizacion['empresa']} - {cotizacion['quantity']} conductores"
        
        return await self.send_email(
            to_email=self.email_ventas,
            subject=subject,
            html_content=html_content
        )
    
    async def send_cotizacion_cliente(self, cotizacion: Dict[str, Any]) -> bool:
        """
        Send confirmation email to client
        """
        template = self.jinja_env.get_template("email_cotizacion_cliente.html")
        html_content = template.render(cotizacion=cotizacion)
        
        subject = "Recibimos tu solicitud de cotización - VMP - EDTECH"
        
        return await self.send_email(
            to_email=cotizacion['email'],
            subject=subject,
            html_content=html_content
        )
    
    async def send_bienvenida(self, user: Dict[str, Any], temp_password: str) -> bool:
        """
        Send welcome email to new user
        """
        template = self.jinja_env.get_template("email_bienvenida.html")
        html_content = template.render(user=user, temp_password=temp_password)
        
        subject = "Bienvenido a VMP - EDTECH - Acceso a tu cuenta"
        
        return await self.send_email(
            to_email=user['email'],
            subject=subject,
            html_content=html_content
        )
    
    async def send_credencial(self, user: Dict[str, Any], credencial: Dict[str, Any], pdf_path: str) -> bool:
        """
        Send credential email with PDF attachment
        """
        template = self.jinja_env.get_template("email_credencial.html")
        html_content = template.render(user=user, credencial=credencial)
        
        subject = f"Tu Credencial VMP - EDTECH - {credencial['curso_nombre']}"
        
        return await self.send_email(
            to_email=user['email'],
            subject=subject,
            html_content=html_content,
            attachments=[pdf_path] if pdf_path else None
        )

    
    async def send_reset_password(self, email: str, reset_token: str, reset_url: str) -> bool:
        """
        Send password reset email
        """
        template = self.jinja_env.get_template("email_reset_password.html")
        html_content = template.render(reset_url=reset_url, reset_token=reset_token)
        
        subject = "Restablecer tu contraseña - VMP - EDTECH"
        
        return await self.send_email(
            to_email=email,
            subject=subject,
            html_content=html_content
        )
    
    async def send_empresa_bienvenida(self, empresa_data: Dict[str, Any]) -> bool:
        """
        Send welcome email to new company with all student credentials
        
        Args:
            empresa_data: Dict with keys:
                - nombre: Company name
                - email: Company email
                - cuit: Company CUIT
                - cantidad_alumnos: Number of students
                - curso: Course name
                - credenciales: List of dicts with 'email' and 'password' for each student
        """
        admin_url = settings.ADMIN_URL
        
        template = self.jinja_env.get_template("email_empresa_bienvenida.html")
        html_content = template.render(
            nombre=empresa_data['nombre'],
            email=empresa_data['email'],
            cuit=empresa_data['cuit'],
            cantidad_alumnos=empresa_data['cantidad_alumnos'],
            curso=empresa_data['curso'],
            credenciales=empresa_data['credenciales'],
            admin_url=admin_url
        )
        
        subject = f"Bienvenido a VMP - EDTECH - Credenciales de Acceso para {empresa_data['nombre']}"
        
        return await self.send_email(
            to_email=empresa_data['email'],
            subject=subject,
            html_content=html_content
        )


# Singleton instance
email_service = EmailService()

