import urllib.request
from markitdown import MarkItDown

urllib.request.urlretrieve("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "real.pdf")
try:
    md_converter = MarkItDown()
    result = md_converter.convert("real.pdf")
    print("MarkItDown successful! Length:", len(result.text_content))
    print(result.text_content[:200])
except Exception as e:
    import traceback
    traceback.print_exc()
