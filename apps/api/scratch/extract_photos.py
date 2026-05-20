import fitz  # PyMuPDF
import os

def extract_photos():
    files = [
        {"pdf": "/Users/matias/Downloads/VMP Credencial - Silva Matias Noel.pdf", "name": "Matias"},
        {"pdf": "/Users/matias/Downloads/VMP Credencial - Tonelotto Mia.pdf", "name": "Mia"},
        {"pdf": "/Users/matias/Downloads/VMP Credencial - Noranbuena Gabriel.pdf", "name": "Gabriel"}
    ]
    
    photo_paths = {}
    
    for f in files:
        if not os.path.exists(f["pdf"]):
            print(f"No existe {f['pdf']}")
            continue
            
        doc = fitz.open(f["pdf"])
        # Buscamos imágenes en el PDF (suelen estar en la página 1)
        for page_index in range(len(doc)):
            page = doc[page_index]
            image_list = page.get_images(full=True)
            
            if image_list:
                # Tomamos la imagen que parezca ser la del alumno (suele ser la más grande o la primera)
                # En este formato MuPDF, suele haber un logo y una foto.
                for img_index, img in enumerate(image_list):
                    xref = img[0]
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    ext = base_image["ext"]
                    
                    # Guardamos temporalmente
                    photo_path = f"/Users/matias/.gemini/antigravity/scratch/vmp-abril/apps/api/scratch/foto_{f['name']}_{img_index}.{ext}"
                    with open(photo_path, "wb") as image_file:
                        image_file.write(image_bytes)
                    
                    # Si la imagen es pequeña (logo), la ignoramos (asumimos > 10kb para la foto)
                    if len(image_bytes) > 5000: 
                        photo_paths[f["name"]] = photo_path
                        print(f"Extraída foto para {f['name']} en {photo_path}")
                        break
        doc.close()
    return photo_paths

if __name__ == "__main__":
    extract_photos()
