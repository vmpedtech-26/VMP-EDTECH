"""
Contact form API endpoint
Handles contact form submissions from the landing page
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging
from services.email_service import email_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Contact"])


class ContactFormRequest(BaseModel):
    nombre: str
    empresa: str
    email: EmailStr
    telefono: Optional[str] = ""
    mensaje: str
    curso_interes: Optional[str] = ""


COURSE_LABELS = {
    "conduccion-preventiva": "Conducción Preventiva (Inicial)",
    "conduccion-renovacion": "Curso Intensivo de Renovación",
    "conduccion-invernal": "Conducción Invernal",
    "conduccion-segura": "Conducción Segura e Implementos Técnicos",
    "flota-liviana-pesada": "Conducción Flota Liviana / Pesada",
    "doble-traccion": "Conducción Doble Tracción (4x4)",
    "trabajo-en-altura": "Trabajo en Altura (Seguridad Industrial)",
    # Soporte para claves antiguas
    "conduccion_preventiva": "Conducción Preventiva (Inicial)",
    "carga_pesada": "Conducción Flota Liviana / Pesada",
    "conduccion_2_traccion": "Conducción Doble Tracción (4x4)",
    "varios": "Varios cursos",
}


@router.post("/contact")
async def submit_contact_form(data: ContactFormRequest):
    """
    Receive a contact form submission, store it in the database as a Cotizacion,
    and send notification email to the sales team.
    """
    try:
        from core.database import prisma
        curso_label = COURSE_LABELS.get(data.curso_interes, data.curso_interes or "No especificado")

        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0A192F, #1a365d); color: white; padding: 24px; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 22px;">📩 Nueva Consulta desde la Web</h1>
            </div>
            <div style="background: white; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569; width: 140px;">Nombre</td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">{data.nombre}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Empresa</td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">{data.empresa}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Email</td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;"><a href="mailto:{data.email}" style="color: #0A192F;">{data.email}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Teléfono</td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">{data.telefono or 'No proporcionado'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Curso de interés</td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">{curso_label}</td>
                    </tr>
                </table>
                <div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 8px;">
                    <p style="margin: 0 0 8px 0; font-weight: bold; color: #475569;">Mensaje:</p>
                    <p style="margin: 0; color: #1e293b; line-height: 1.6;">{data.mensaje}</p>
                </div>
            </div>
        </div>
        """

        # Guardar en la base de datos como una Cotización para que llegue al panel del LMS
        await prisma.cotizacion.create(
            data={
                "empresa": data.empresa,
                "nombre": data.nombre,
                "email": data.email,
                "telefono": data.telefono or "",
                "comentarios": data.mensaje,
                "quantity": 1,
                "course": curso_label,
                "modality": "a-definir",
                "totalPrice": 0.0,
                "pricePerStudent": 0.0,
                "discount": 0,
                "acceptMarketing": False,
                "acceptTerms": True,
                "status": "pending",
            }
        )
        logger.info(f"Cotización guardada en base de datos para {data.empresa} ({data.email})")

        # Notificación por email al equipo administrativo (administracion@vmp-edtech.com)
        admin_recipient = os.getenv("EMAIL_ADMIN", os.getenv("EMAIL_VENTAS", "administracion@vmp-edtech.com"))
        
        await email_service.send_email(
            to_email=admin_recipient,
            subject=f"Nueva consulta web: {data.empresa} - {data.nombre}",
            html_content=html_content,
        )

        # Auto-reply to client
        auto_reply = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0A192F, #1a365d); color: white; padding: 24px; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 22px;">Recibimos tu consulta ✓</h1>
            </div>
            <div style="background: white; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                <p style="color: #1e293b; font-size: 16px;">Hola <strong>{data.nombre}</strong>,</p>
                <p style="color: #475569; line-height: 1.6;">
                    Gracias por contactarte con <strong>VMP Servicios</strong>. Recibimos tu consulta sobre
                    capacitación vial para <strong>{data.empresa}</strong>.
                </p>
                <p style="color: #475569; line-height: 1.6;">
                    Nuestro equipo se pondrá en contacto con vos dentro de las próximas
                    <strong>24 horas hábiles</strong> para ofrecerte una propuesta personalizada.
                </p>
                <div style="margin-top: 20px; padding: 16px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
                    <p style="margin: 0; color: #166534; font-size: 14px;">
                        <strong>¿Urgente?</strong> Escribinos por
                        <a href="https://wa.me/5492995370173" style="color: #166534;">WhatsApp</a>
                    </p>
                </div>
                <p style="margin-top: 24px; color: #94a3b8; font-size: 13px;">
                    — Equipo VMP
                </p>
            </div>
        </div>
        """

        await email_service.send_email(
            to_email=data.email,
            subject="Recibimos tu consulta - VMP",
            html_content=auto_reply,
        )

        logger.info(f"Contact form submitted and auto-replied: {data.nombre} ({data.empresa}) - {data.email}")

        return {"status": "ok", "message": "Consulta enviada correctamente"}

    except Exception as e:
        logger.error(f"Error processing contact form: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al procesar la consulta")


@router.post("/test-email")
async def test_email_sending(target_email: Optional[str] = "administracion@vmp-edtech.com"):
    """
    Diagnostic endpoint to test email delivery to administracion@vmp-edtech.com
    """
    import os
    resend_key = os.getenv("RESEND_API_KEY", "")
    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASSWORD", "")

    has_resend = bool(resend_key.strip())
    has_smtp = bool(smtp_pass and smtp_pass != "TU_API_KEY_AQUI")

    test_html = f"""
    <div style="font-family: sans-serif; padding: 20px; background: #0A192F; color: white; border-radius: 10px;">
        <h2>🧪 Prueba de Diagnóstico de Email - VMP-EDTECH</h2>
        <p>Este es un mensaje de prueba automático para verificar la entrega a <strong>{target_email}</strong>.</p>
        <p>Driver usado: <strong>{'Resend HTTPS API' if has_resend else ('SMTP' if has_smtp else 'Modo Desarrollo (No configurado)')}</strong></p>
    </div>
    """

    success = await email_service.send_email(
        to_email=target_email,
        subject="🧪 Prueba de Diagnóstico de Correo VMP",
        html_content=test_html
    )

    return {
        "status": "success" if success else "error",
        "target_email": target_email,
        "resend_configured": has_resend,
        "smtp_configured": has_smtp,
        "sent": success
    }

