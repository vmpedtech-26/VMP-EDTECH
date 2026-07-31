import fitz  # PyMuPDF
import os

def extract_data():
    files = [
        {"pdf": "/Users/matias/Downloads/VMP Credencial - Silva Matias Noel.pdf", "name": "Matias"},
        {"pdf": "/Users/matias/Downloads/VMP Credencial - Tonelotto Mia.pdf", "name": "Mia"},
        {"pdf": "/Users/matias/Downloads/VMP Credencial - Noranbuena Gabriel.pdf", "name": "Gabriel"}
    ]
    
    data = {}
    
    for f in files:
        if not os.path.exists(f["pdf"]):
            continue
            
        doc = fitz.open(f["pdf"])
        page = doc[0]
        text = page.get_text()
        print(f"--- Texto de {f['name']} ---")
        print(text)
        data[f["name"]] = text
        doc.close()
    return data

if __name__ == "__main__":
    extract_data()
