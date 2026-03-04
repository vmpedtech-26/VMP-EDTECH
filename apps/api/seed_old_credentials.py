import asyncio
import glob
import fitz
import re
import os
import sys
from io import BytesIO

# Adjust path to import from apps.api
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import prisma
from services.credential_service import generate_credential_for_student
from services.file_upload import save_credencial_photo
from fastapi import UploadFile
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

class DummyUploadFile(UploadFile):
    def __init__(self, filename: str, file: BytesIO, content_type: str = "image/jpeg"):
        super().__init__(filename=filename, file=file)
        self.headers = {"content-type": content_type}

def is_portrait_or_square(w, h):
    ratio = w / h if h != 0 else 0
    # Portrait or square, not too small
    return 0.5 <= ratio <= 1.2 and w > 200 and h > 200

async def parse_and_migrate():
    db_url = os.environ.get("DATABASE_URL", "")
    if db_url.startswith('"') and db_url.endswith('"'):
        os.environ["DATABASE_URL"] = db_url.strip('"')

    await prisma.connect()
    
    # We will search for all 'Credencial*.pdf' in Downloads
    downloads_dir = os.path.expanduser("~/Downloads")
    pdf_files = glob.glob(os.path.join(downloads_dir, "Credencial*.pdf"))
    
    # Create or get superadmin to assign things if needed
    admin = await prisma.user.find_first(where={"rol": "SUPER_ADMIN"})
    if not admin:
        print("Super admin not found, aborting.")
        return

    for pdf_path in pdf_files:
        try:
            filename = os.path.basename(pdf_path)
            print(f"\nProcessing {filename}...")
            
            doc = fitz.open(pdf_path)
            page = doc[0]
            text = page.get_text()
            
            lines = text.split("\n")
            
            apellido = ""
            nombre = ""
            dni = ""
            empresa_nombre = ""
            puesto = ""
            curso_nombre = ""
            fecha = ""
            
            for i, line in enumerate(lines):
                if line.startswith("APELLIDO:"):
                    apellido = line.replace("APELLIDO:", "").strip()
                elif line.startswith("NOMBRE:"):
                    nombre = line.replace("NOMBRE:", "").strip()
                elif line.startswith("DNI/PSP:"):
                    dni = line.replace("DNI/PSP:", "").strip()
                elif line.startswith("EMPRESA:"):
                    empresa_nombre = line.replace("EMPRESA:", "").strip()
                elif line.startswith("PUESTO:"):
                    puesto = line.replace("PUESTO:", "").strip()
                elif "Fecha realización" in line:
                    if i + 1 < len(lines):
                        fecha = lines[i+1].strip()
                    if i + 2 < len(lines):
                         # Usually course name is right after the date or related
                         # In Heck's case: "Conducción Segura: Flota Liviana"
                         c_text = lines[i+2].strip()
                         if "Conducción Segura" in c_text or c_text.strip() != "":
                             curso_nombre = c_text
            
            # Additional check for course name if empty or just "VTO:"
            if not curso_nombre or curso_nombre.startswith("Vto"):
                # fallback, just search for "Flota" in the text
                for ln in lines:
                    if "Conducción" in ln or "Flota" in ln:
                         curso_nombre = ln.strip()
                         break
            
            print(f"Extracted: {nombre} {apellido}, DNI: {dni}, Empresa: {empresa_nombre}, Curso: {curso_nombre}")
            
            if not dni or not nombre or not apellido:
                print("Missing basic data, skipping.")
                continue
                
            # Extract photo (assume first large portrait/square image)
            foto_bytes = None
            ext = "jpeg"
            for img in page.get_images():
                xref = img[0]
                img_info = doc.extract_image(xref)
                w = img_info["width"]
                h = img_info["height"]
                if is_portrait_or_square(w, h):
                    # Pick this one
                    foto_bytes = img_info["image"]
                    ext = img_info["ext"]
                    break
            
            if not foto_bytes:
                print("Warning: Portrait photo not found in PDF")
                
            # Ensure Empresa
            empresa = await prisma.company.find_first(where={"nombre": empresa_nombre})
            if not empresa and empresa_nombre:
                 # Create
                 empresa = await prisma.company.create({
                     "nombre": empresa_nombre,
                     "cuit": "00000000000",
                     "email": "contacto@placeholder.com"
                 })
                 print(f"Created new empresa {empresa.nombre}")
                 
            # Ensure Course
            curso = await prisma.curso.find_first(where={"nombre": curso_nombre})
            if not curso:
                 print(f"Course '{curso_nombre}' not found. Let's try to match it.")
                 # fuzzy match
                 all_cursos = await prisma.curso.find_many()
                 for c in all_cursos:
                     if "Flota" in curso_nombre and "Flota" in c.nombre:
                         curso = c
                         break
                 if not curso:
                     print(f"Could not map course '{curso_nombre}', skipping.")
                     continue
                     
            # Ensure Alumno
            alumno = await prisma.user.find_unique(where={"dni": dni})
            if not alumno:
                # generate password
                from auth.jwt import hash_password
                pwd = hash_password(dni)
                
                # Check email unique
                email_base = f"{nombre.split()[0].lower()}.{apellido.split()[0].lower()}"
                test_email = f"{email_base}@vmpedtech.com"
                
                existing_email = await prisma.user.find_unique(where={"email": test_email})
                if existing_email:
                    test_email = f"{email_base}{dni[-3:]}@vmpedtech.com"
                    
                alumno = await prisma.user.create({
                    "email": test_email,
                    "passwordHash": pwd,
                    "nombre": nombre,
                    "apellido": apellido,
                    "dni": dni,
                    "rol": "ALUMNO",
                    "activo": True,
                    "empresaId": empresa.id if empresa else None
                })
                print(f"Created new alumno: {test_email}")
            elif empresa and alumno.empresaId != empresa.id:
                # Update enterprise if empty
                await prisma.user.update(where={"id": alumno.id}, data={"empresaId": empresa.id})
                
            # Upload Photo if present
            if foto_bytes:
                # remove existing
                existing_foto = await prisma.fotocredencial.find_unique(where={"alumnoId": alumno.id})
                if existing_foto:
                    from services.file_upload import delete_credencial_photo
                    delete_credencial_photo(existing_foto.fotoUrl)
                    await prisma.fotocredencial.delete(where={"id": existing_foto.id})
                    
                # simulate upload
                f_obj = BytesIO(foto_bytes)
                dummy_file = DummyUploadFile(filename=f"photo_{dni}.{ext}", file=f_obj, content_type=f"image/{ext}")
                try:
                    foto_url = await save_credencial_photo(dummy_file)
                    # create
                    await prisma.fotocredencial.create(data={
                        "alumnoId": alumno.id,
                        "fotoUrl": foto_url,
                        "estado": "APROBADA",
                        "evaluadorId": admin.id
                    })
                    print("Photo uploaded and approved.")
                except Exception as e:
                    print(f"Error saving photo: {e}")
            else:
                print("No photo bytes for", dni)

            # Generate Credential
            print(f"Generating credential for {nombre} {apellido}...")
            res = await generate_credential_for_student(
                alumno_id=alumno.id,
                curso_id=curso.id,
                emisor_id=admin.id,
                force=True
            )
            print("Success! ->", res["pdfUrl"])
            
        except Exception as e:
            print(f"Error processing {pdf_path}: {e}")
            import traceback
            traceback.print_exc()

    await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(parse_and_migrate())
