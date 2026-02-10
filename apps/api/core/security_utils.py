import bleach
from typing import Any, Dict, List, Union

def sanitize_html(text: str) -> str:
    """
    Sanitize HTML content to prevent XSS.
    Allows only a safe set of tags if needed, or strips all tags by default.
    """
    if not text:
        return text
    # Strip all tags by default for simple text fields
    return bleach.clean(text, tags=[], attributes={}, strip=True)

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
