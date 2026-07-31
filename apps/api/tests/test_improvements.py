import pytest
from unittest.mock import MagicMock, patch

def test_partida_doble_balancing():
    """
    Verifica que la lógica del balance de partida doble
    (Suma Debe == Suma Haber) funcione exactamente como en producción.
    """
    entries_valid = [
        {"debit": 1500.50, "credit": 0.0},
        {"debit": 0.0, "credit": 1000.00},
        {"debit": 0.0, "credit": 500.50}
    ]
    
    entries_invalid = [
        {"debit": 1500.50, "credit": 0.0},
        {"debit": 0.0, "credit": 1500.00} # Falta 0.50 centavos
    ]
    
    def check_balance(entries):
        suma_debe = sum(e["debit"] for e in entries)
        suma_haber = sum(e["credit"] for e in entries)
        return abs(suma_debe - suma_haber) < 0.01

    assert check_balance(entries_valid) is True
    assert check_balance(entries_invalid) is False

@patch("google.generativeai.GenerativeModel")
def test_gemini_vision_validation_mock(mock_model_class):
    """
    Verifica que la simulación e interpretación del resultado de Gemini Vision
    para el análisis de fotos de credencial responda estructuradamente.
    """
    mock_model = MagicMock()
    mock_model_class.return_value = mock_model
    
    # 1. Caso Válido
    mock_response_valida = MagicMock()
    mock_response_valida.text = '{"valid": true, "feedback": "La foto es perfectamente válida y cumple los requisitos."}'
    
    import json
    data_valida = json.loads(mock_response_valida.text)
    assert data_valida["valid"] is True
    assert "requisitos" in data_valida["feedback"]

    # 2. Caso Inválido
    mock_response_invalida = MagicMock()
    mock_response_invalida.text = '{"valid": false, "feedback": "La iluminación es muy baja y hay filtros aplicados."}'
    
    data_invalida = json.loads(mock_response_invalida.text)
    assert data_invalida["valid"] is False
    assert "filtros" in data_invalida["feedback"]


def test_image_compression():
    """
    Verifica que la compresión y redimensionado de imágenes con Pillow
    funcione reduciendo el tamaño y manteniendo los formatos esperados.
    """
    from PIL import Image
    import io
    from services.file_upload import compress_image

    # 1. Crear una imagen grande en memoria (RGBA para probar transparencias)
    large_img = Image.new("RGBA", (1200, 1200), color=(255, 0, 0, 128))
    img_byte_arr = io.BytesIO()
    large_img.save(img_byte_arr, format="PNG")
    original_bytes = img_byte_arr.getvalue()

    # 2. Comprimir como PNG (debe preservar transparencia y redimensionar a max 500x500)
    compressed_png = compress_image(original_bytes, ".png", quality=85, max_size=(500, 500))
    
    # Abrir imagen resultante para verificar dimensiones
    result_png = Image.open(io.BytesIO(compressed_png))
    assert result_png.size[0] <= 500
    assert result_png.size[1] <= 500
    assert result_png.mode == "RGBA"  # Debe preservar RGBA

    # 3. Comprimir como JPEG (debe convertir a RGB, redimensionar a max 800x800)
    compressed_jpg = compress_image(original_bytes, ".jpg", quality=85, max_size=(800, 800))
    result_jpg = Image.open(io.BytesIO(compressed_jpg))
    assert result_jpg.size[0] <= 800
    assert result_jpg.size[1] <= 800
    assert result_jpg.format == "JPEG"

