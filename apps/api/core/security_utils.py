import bleach
from typing import Any, Dict, List, Union
from pydantic import BaseModel, model_validator

# Define a safe set of HTML tags for rich content (like module HTML content)
SAFE_TAGS = [
    'a', 'abbr', 'acronym', 'b', 'blockquote', 'code', 'em', 'i', 'li', 'ol', 'strong', 'ul',
    'p', 'br', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'table', 'thead', 'tbody',
    'tr', 'th', 'td', 'pre', 'hr'
]

SAFE_ATTRIBUTES = {
    'a': ['href', 'title', 'target'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    '*': ['class', 'style']
}

def sanitize_html(text: str) -> str:
    """
    Sanitize HTML content to prevent XSS.
    Allows only a safe set of tags if needed, or strips all tags by default.
    """
    if not text:
        return text
    # Strip all tags by default for simple text fields
    return bleach.clean(text, tags=[], attributes={}, strip=True)

def sanitize_data(data: Any, key: str = "") -> Any:
    """
    Recursively sanitize strings in a data structure.
    Skips fields like password, email, token, url, and link to avoid corruption.
    If the key contains 'html' (like 'contenidoHtml'), allows a safe set of HTML tags.
    """
    if isinstance(data, str):
        low_key = key.lower()
        if any(ignored in low_key for ignored in ["password", "email", "token", "url", "link"]):
            return data
        if "html" in low_key:
            return bleach.clean(data, tags=SAFE_TAGS, attributes=SAFE_ATTRIBUTES, strip=True)
        return sanitize_html(data)
    elif isinstance(data, dict):
        return {k: sanitize_data(v, k) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_data(i, key) for i in data]
    return data

class SanitizedBaseModel(BaseModel):
    """
    Modelo base de Pydantic v2 que sanitiza de forma recursiva todos los campos
    del tipo string en las peticiones entrantes para mitigar vulnerabilidades XSS.
    """
    @model_validator(mode="before")
    @classmethod
    def sanitize_inputs(cls, data: Any) -> Any:
        if isinstance(data, dict):
            return sanitize_data(data)
        return data


