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
    "conduccion_preventiva": "Conducción Preventiva",
    "carga_pesada": "Carga Pesada",
    "conduccion_2_traccion": "Conducción 2 Tracción",
    "varios": "Varios cursos",
}


@router.post("/contact")
async def submit_contact_form(data: ContactFormRequest):
    """
    Receive a contact form submission and send notification email to sales team.
    """
    try:
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

        await email_service.send_email(
            to_email=email_service.email_ventas,
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
                    Nuestro equipo de ventas se pondrá en contacto con vos dentro de las próximas
                    <strong>24 horas hábiles</strong> para ofrecerte una propuesta personalizada.
                </p>
                <div style="margin-top: 20px; padding: 16px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
                    <p style="margin: 0; color: #166534; font-size: 14px;">
                        <strong>¿Urgente?</strong> Llamanos al +54 9 11 2345-6789 o escribinos por
                        <a href="https://wa.me/5491123456789" style="color: #166534;">WhatsApp</a>
                    </p>
                </div>
                <p style="margin-top: 24px; color: #94a3b8; font-size: 13px;">
                    — Equipo VMP Servicios
                </p>
            </div>
        </div>
        """

        await email_service.send_email(
            to_email=data.email,
            subject="Recibimos tu consulta - VMP Servicios",
            html_content=auto_reply,
        )

        logger.info(f"Contact form submitted: {data.nombre} ({data.empresa}) - {data.email}")

        return {"status": "ok", "message": "Consulta enviada correctamente"}

    except Exception as e:
        logger.error(f"Error processing contact form: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al procesar la consulta")
