import os
import google.generativeai as genai
import tempfile
from markitdown import MarkItDown

gemini_key = os.environ.get("GEMINI_API_KEY", "AIzaSyD2cD22gGwIhkpejMClwobMugiDNnByYow")
genai.configure(api_key=gemini_key)

try:
    md_converter = MarkItDown()
    # Create a dummy PDF to test MarkItDown
    with open("dummy.pdf", "w") as f:
        f.write("test")
    
    result = md_converter.convert("dummy.pdf")
    document_markdown = result.text_content
    print("MarkItDown successful!")
    print(document_markdown)
except Exception as e:
    print(f"Error: {e}")
