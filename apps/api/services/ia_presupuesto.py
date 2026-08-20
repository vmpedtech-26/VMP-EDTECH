"""
Servicio de IA para asistir en la creación de presupuestos HSE.
Usa Google Gemini API.
"""
import os
import json
import logging
from typing import Optional

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


async def completar_formulario_desde_texto(texto: str, historial_clientes: list = None) -> dict:
    """
    Dada una descripción en lenguaje natural, extrae los datos del presupuesto.
    Retorna un dict con los campos del formulario completados.
    """
    if not GEMINI_API_KEY:
        return {"error": "GEMINI_API_KEY no configurada"}
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        historial_ctx = ""
        if historial_clientes:
            historial_ctx = f"\n\nCLIENTES CONOCIDOS (para autocompletar CUIT y condiciones):\n{json.dumps(historial_clientes[:10], ensure_ascii=False)}"
        
        prompt = f"""Eres un asistente especializado en presupuestos técnicos HSE para VMP EDTECH (empresa de servicios técnicos en Higiene y Seguridad, Patagonia Argentina).

El usuario describió en lenguaje natural el presupuesto que quiere crear:
\"{texto}\"
{historial_ctx}

Extrae los datos y retorna SOLO un JSON válido con los siguientes campos (usa null para los que no tengas datos):
{{
  "cliente_nombre": "nombre de la empresa cliente",
  "cliente_cuit": "CUIT si se menciona o se conoce",
  "recurso_nombre": "nombre del técnico asignado",
  "recurso_titulo": "título profesional (ej: Técnico en Higiene y Seguridad)",
  "recurso_matricula": "matrícula profesional",
  "fecha_desde": "fecha inicio formato DD/MM/YYYY",
  "fecha_hasta": "fecha fin formato DD/MM/YYYY",
  "jornadas": número_de_jornadas_entero,
  "horario": "horario (ej: 09:00 a 18:00 hs)",
  "lugar": "ciudad/lugar de prestación",
  "tipo_servicio": "descripción del servicio"
}}

Retorna SOLO el JSON, sin markdown, sin explicaciones."""
        
        response = model.generate_content(prompt)
        raw = response.text.strip()
        # Limpiar markdown si hay
        if raw.startswith('```'):
            raw = raw.split('```')[1]
            if raw.startswith('json'):
                raw = raw[4:]
        raw = raw.strip().rstrip('```').strip()
        return json.loads(raw)
    except Exception as e:
        logger.error(f"Error en IA completar_formulario: {e}")
        return {"error": str(e)}


async def redactar_alcance(tipo_servicio: str, datos: dict) -> dict:
    """
    Genera texto de alcance técnico, entregables, exclusiones y condiciones.
    """
    if not GEMINI_API_KEY:
        return {"error": "GEMINI_API_KEY no configurada"}
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        cliente = datos.get('cliente_nombre', 'el cliente')
        lugar = datos.get('lugar', 'Neuquén')
        jornadas = datos.get('jornadas', 1)
        
        prompt = f"""Eres redactor técnico especializado en documentos HSE para VMP EDTECH, empresa de servicios técnicos en Higiene y Seguridad de Patagonia Argentina.

Redactá el texto para un presupuesto de:
- Tipo de servicio: {tipo_servicio}
- Cliente: {cliente}
- Lugar: {lugar}
- Duración: {jornadas} jornadas

Retorna SOLO un JSON con los siguientes campos en texto plano (bullets con •, sin markdown):
{{
  "alcance_texto": "texto del alcance técnico con bullets",
  "entregables_texto": "texto de entregables con bullets",
  "exclusiones_texto": "texto de exclusiones con bullets",
  "condiciones_texto": "texto de condiciones comerciales con bullets"
}}

El tono debe ser formal, técnico y profesional. Retorna SOLO el JSON."""
        
        response = model.generate_content(prompt)
        raw = response.text.strip()
        if raw.startswith('```'):
            raw = raw.split('```')[1]
            if raw.startswith('json'):
                raw = raw[4:]
        raw = raw.strip().rstrip('```').strip()
        return json.loads(raw)
    except Exception as e:
        logger.error(f"Error en IA redactar_alcance: {e}")
        return {"error": str(e)}


async def sugerir_tarifas(tipo_servicio: str, historial_presupuestos: list = None) -> dict:
    """
    Sugiere valores tarifarios basándose en el historial.
    """
    if not GEMINI_API_KEY:
        return {"error": "GEMINI_API_KEY no configurada"}
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        historial_ctx = ""
        if historial_presupuestos:
            historial_ctx = f"\n\nHISTORIAL DE PRESUPUESTOS PREVIOS:\n{json.dumps(historial_presupuestos[:5], ensure_ascii=False)}"
        
        prompt = f"""Eres asesor comercial de VMP EDTECH, empresa de servicios HSE en Patagonia Argentina.

Servicio a cotizar: {tipo_servicio}{historial_ctx}

Basándote en el historial y en precios del mercado HSE argentino (agosto 2026), sugerí una tabla tarifaria.
Retorna SOLO un JSON:
{{
  "items": [
    {{"codigo": "SCIO-HSE-001", "concepto": "descripción", "unidad": "Días", "cantidad": 1, "precio_unitario": 840000}},
    {{"codigo": "EXT-HSE-001", "concepto": "Hora adicional", "unidad": "Hora", "cantidad": 1, "precio_unitario": 140000}},
    {{"codigo": "JOR-HSE-001", "concepto": "Jornada adicional", "unidad": "Jornada", "cantidad": 1, "precio_unitario": 840000}},
    {{"codigo": "MOV-HSE-001", "concepto": "Viáticos/movilidad", "unidad": "Según corresponda", "cantidad": 0, "precio_unitario": 0}}
  ],
  "justificacion": "breve explicación de los valores"
}}"""
        
        response = model.generate_content(prompt)
        raw = response.text.strip()
        if raw.startswith('```'):
            raw = raw.split('```')[1]
            if raw.startswith('json'):
                raw = raw[4:]
        raw = raw.strip().rstrip('```').strip()
        return json.loads(raw)
    except Exception as e:
        logger.error(f"Error en IA sugerir_tarifas: {e}")
        return {"error": str(e)}
