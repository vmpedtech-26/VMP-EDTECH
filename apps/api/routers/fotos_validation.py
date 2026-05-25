from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
import os
import json
from auth.dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter()

class ValidationResponse(BaseModel):
    valid: bool
    feedback: str

@router.post("/validate-ia", response_model=ValidationResponse)
async def validar_foto_con_ia(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    """
    Analiza una imagen subida mediante Gemini Vision (gemini-2.5-flash) para pre-validar
    si cumple con los requerimientos contundentes para fotos de credencial oficial.
    """
    # 1. Validar extensión de archivo
    allowed_exts = {".jpg", ".jpeg", ".png", ".webp"}
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Formato no permitido. Por favor use una imagen con formato: {', '.join(allowed_exts)}"
        )

    # 2. Obtener API key de Gemini
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key:
        # Fallback si no está configurada la llave para no bloquear la app
        return ValidationResponse(
            valid=True,
            feedback="Falta configurar GEMINI_API_KEY. Validación IA omitida (Aprobación manual requerida)."
        )

    try:
        # Leer el contenido del archivo
        contents = await file.read()
        
        import google.generativeai as genai
        genai.configure(api_key=gemini_key)
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = """
        Eres un auditor experto de credenciales de identificación oficial para la plataforma EdTech VMP.
        Tu tarea es validar si la foto provista por el alumno es apta para ser impresa en su credencial oficial de conducir profesional.

        Criterios Obligatorios:
        1. Debe mostrar a una única persona, con su rostro claramente visible y enfocado.
        2. Debe ser un retrato tipo carnet/DNI (rostro centrado, mirando al frente).
        3. Debe tener buena iluminación (no a contraluz, no extremadamente oscura ni con sombras duras).
        4. No debe tener filtros de redes sociales, orejas de animales añadidas, ni distorsiones.
        5. No debe ser una foto borrosa ni pixelada de baja calidad.

        Devuelve tu veredicto en este formato JSON exacto:
        {
            "valid": true/false (booleano),
            "feedback": "Explicación clara y constructiva en español para el alumno. Si es válida, felicítalo indicando que cumple los requisitos. Si es inválida, indícale amigablemente qué debe corregir (ej. 'La iluminación es muy baja y tu rostro no se distingue' o 'Por favor mira directamente a la cámara y evita filtros de foto')."
        }
        """

        # Enviar la imagen y el prompt a Gemini
        response = model.generate_content(
            [
                {"mime_type": file.content_type or "image/jpeg", "data": contents},
                prompt
            ],
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        
        result_json = response.text.strip()
        data = json.loads(result_json)
        
        return ValidationResponse(
            valid=bool(data.get("valid", False)),
            feedback=str(data.get("feedback", "No se pudo obtener retroalimentación."))
        )
        
    except Exception as e:
        print(f"Error en validación IA con Gemini: {str(e)}")
        # Fallback amistoso en caso de límite de cuota o error de red
        return ValidationResponse(
            valid=True,
            feedback="El validador inteligente de fotos no está disponible en este momento. Continuaremos con la carga estándar y un instructor validará tu foto manualmente."
        )
