import asyncio
import os
from prisma import Prisma
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("integrity-audit")

async def run_audit():
    db = Prisma()
    await db.connect()
    
    print("🔍 INICIANDO AUDITORÍA DE INTEGRIDAD DE DATOS...")
    print("-" * 50)
    
    issues_found = 0
    
    # 1. Checar Inscripciones Huérfanas
    inscripciones = await db.inscripcion.find_many(include={"alumno": True, "curso": True})
    for ins in inscripciones:
        if not ins.alumno:
            print(f"❌ ERROR: Inscripción {ins.id} no tiene alumno asociado.")
            issues_found += 1
        if not ins.curso:
            print(f"❌ ERROR: Inscripción {ins.id} no tiene curso asociado.")
            issues_found += 1
            
    # 2. Checar Alumnos sin Empresa (si el rol es ALUMNO)
    alumnos = await db.user.find_many(where={"rol": "ALUMNO"}, include={"empresa": True})
    for alu in alumnos:
        if not alu.empresaId:
            print(f"⚠️ AVISO: Alumno {alu.nombre} {alu.apellido} ({alu.email}) no tiene empresaId.")
            issues_found += 1
            
    # 3. Checar Credenciales Huérfanas
    credenciales = await db.credencial.find_many(include={"alumno": True, "curso": True})
    for cred in credenciales:
        if not cred.alumno:
            print(f"❌ ERROR: Credencial {cred.numero} no tiene alumno.")
            issues_found += 1
        if not cred.curso:
            print(f"❌ ERROR: Credencial {cred.numero} no tiene curso.")
            issues_found += 1

    # 4. Checar Fotos sin Alumno
    fotos = await db.fotocredencial.find_many(include={"alumno": True})
    for foto in fotos:
        if not foto.alumno:
            print(f"❌ ERROR: Foto {foto.id} no tiene alumno.")
            issues_found += 1

    print("-" * 50)
    if issues_found == 0:
        print("✅ INTEGRIDAD PERFECTA: No se encontraron registros huérfanos.")
    else:
        print(f"⚠️ SE ENCONTRARON {issues_found} PROBLEMAS DE INTEGRIDAD.")
        
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(run_audit())
