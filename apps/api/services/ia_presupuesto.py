"""
Servicio de IA para asistir en la creación de presupuestos HSE.
Usa Google Gemini API.
"""
import os
import json
import logging

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


def _parse_json_response(raw: str) -> dict:
    raw = raw.strip()
    if raw.startswith('```'):
        raw = raw.split('```')[1]
        if raw.startswith('json'):
            raw = raw[4:]
    raw = raw.strip().rstrip('```').strip()
    return json.loads(raw)


async def completar_formulario_desde_texto(texto: str) -> dict:
    """
    Dada una descripción en lenguaje natural, extrae los datos del presupuesto.
    Retorna un dict con los campos del formulario completados (mismos nombres
    de campo que usa el formulario del frontend).
    """
    if not GEMINI_API_KEY:
        return {"error": "GEMINI_API_KEY no configurada"}

    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-3.6-flash')

        prompt = f"""Eres un asistente especializado en presupuestos técnicos HSE para VMP EDTECH (empresa de servicios técnicos en Higiene y Seguridad, Patagonia Argentina).

El usuario describió en lenguaje natural el presupuesto que quiere crear:
\"{texto}\"

Extrae los datos y retorna SOLO un JSON válido con los siguientes campos (usa null para los que no tengas datos):
{{
  "cliente_nombre": "nombre de la empresa cliente",
  "cliente_cuit": "CUIT si se menciona o se conoce",
  "recurso_nombre": "nombre del técnico asignado",
  "recurso_cargo": "título profesional (ej: Técnico en Higiene y Seguridad)",
  "recurso_matricula": "matrícula profesional",
  "fecha_desde": "fecha inicio formato YYYY-MM-DD",
  "fecha_hasta": "fecha fin formato YYYY-MM-DD",
  "cantidad_jornadas": número_de_jornadas_entero,
  "horario": "horario (ej: 09:00 a 18:00 hs)",
  "lugar_prestacion": "ciudad/lugar de prestación"
}}

Retorna SOLO el JSON, sin markdown, sin explicaciones."""

        response = model.generate_content(prompt)
        return _parse_json_response(response.text)
    except Exception as e:
        logger.error(f"Error en IA completar_formulario: {e}")
        return {"error": str(e)}


async def redactar_alcance(texto: str) -> dict:
    """
    Genera texto de alcance técnico, entregables, exclusiones y condiciones
    comerciales a partir de una descripción libre del servicio.
    """
    if not GEMINI_API_KEY:
        return {"error": "GEMINI_API_KEY no configurada"}

    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-3.6-flash')

        prompt = f"""Eres redactor técnico especializado en documentos HSE para VMP EDTECH, empresa de servicios técnicos en Higiene y Seguridad de Patagonia Argentina.

El usuario describió el servicio a presupuestar:
\"{texto}\"

Redactá el contenido del documento para ese servicio. Retorna SOLO un JSON con los siguientes campos en texto plano (bullets con •, sin markdown):
{{
  "alcance_tecnico": "texto del alcance técnico con bullets",
  "entregables": "texto de entregables con bullets",
  "exclusiones": "texto de exclusiones con bullets",
  "condiciones_comerciales": "texto de condiciones comerciales con bullets"
}}

El tono debe ser formal, técnico y profesional. Retorna SOLO el JSON."""

        response = model.generate_content(prompt)
        return _parse_json_response(response.text)
    except Exception as e:
        logger.error(f"Error en IA redactar_alcance: {e}")
        return {"error": str(e)}


async def sugerir_tarifas(texto: str) -> dict:
    """
    Sugiere una tabla tarifaria a partir de una descripción libre del servicio.
    """
    if not GEMINI_API_KEY:
        return {"error": "GEMINI_API_KEY no configurada"}

    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-3.6-flash')

        prompt = f"""Eres asesor comercial de VMP EDTECH, empresa de servicios HSE en Patagonia Argentina.

Servicio a cotizar, descripto por el usuario:
\"{texto}\"

Basándote en precios del mercado HSE argentino (agosto 2026), sugerí una tabla tarifaria.
Retorna SOLO un JSON:
{{
  "items": [
    {{"codigo": "SCIO-HSE-001", "concepto": "descripción", "unidad": "Días", "cantidad": 1, "precio_unitario": 840000, "importe": 840000}},
    {{"codigo": "EXT-HSE-001", "concepto": "Hora adicional", "unidad": "Hora", "cantidad": 1, "precio_unitario": 140000, "importe": 140000}}
  ],
  "justificacion": "breve explicación de los valores"
}}

El campo "importe" de cada ítem debe ser igual a cantidad * precio_unitario."""

        response = model.generate_content(prompt)
        return _parse_json_response(response.text)
    except Exception as e:
        logger.error(f"Error en IA sugerir_tarifas: {e}")
        return {"error": str(e)}
