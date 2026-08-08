import bleach
from typing import Any, Dict, List, Union
from pydantic import BaseModel, field_validator

ALLOWED_TAGS = [
    'a', 'abbr', 'b', 'blockquote', 'code', 'em', 'i', 'li', 'ol',
    'p', 'strong', 'ul', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr',
    'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span',
    'iframe', 'video', 'source', 'pre', 'sub', 'sup', 'mark'
]

ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height', 'class'],
    'iframe': ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'class'],
    'video': ['src', 'controls', 'width', 'height', 'poster'],
    'source': ['src', 'type'],
    '*': ['class', 'style', 'id']
}

ALLOWED_STYLES = [
    'color', 'background-color', 'text-align', 'font-weight', 'font-style',
    'text-decoration', 'margin', 'padding', 'width', 'height'
]

def sanitize_html(text: str) -> str:
    """
    Sanitize plain text fields to prevent HTML injection.
    Strips all HTML tags.
    """
    if not text:
        return text
    return bleach.clean(text, tags=[], attributes={}, strip=True)

def sanitize_rich_html(text: str) -> str:
    """
    Sanitize rich text HTML content for course modules.
    Allows safe structural and formatting tags while filtering dangerous scripts and attributes.
    """
    if not text:
        return text
    return bleach.clean(
        text,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        styles=ALLOWED_STYLES,
        strip=True
    )

def sanitize_data(data: Union[str, Dict, List]) -> Any:
    """
    Recursively sanitize strings in a data structure.
    """
    if isinstance(data, str):
        return sanitize_html(data)
    elif isinstance(data, dict):
        return {k: sanitize_data(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_data(i) for i in data]
    return data

class SanitizedBaseModel(BaseModel):
    """Pydantic request model that HTML-sanitizes every string field before validation."""

    @field_validator("*", mode="before")
    @classmethod
    def _sanitize_strings(cls, v: Any) -> Any:
        if isinstance(v, str):
            return sanitize_data(v)
        return v
