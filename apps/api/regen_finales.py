"""
Regenera las 12 credenciales finales (una por DNI único) con el diseño actualizado
que incluye la fecha de vencimiento.
"""
import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import prisma
from services.credential_service import generate_credential_for_student
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Los 12 números de credencial finales (con firma corresta)
CREDENCIALES_FINALES = [
    "VMP-2026-00067",  # PEDRO HECK
    "VMP-2026-00068",  # LINAY
    "VMP-2026-00069",  # EMANUEL BELTRAN
    "VMP-2026-00070",  # PAOLA GUERRERO
    "VMP-2026-00072",  # IVAN BRAVO
    "VMP-2026-00073",  # ALMENDRA
    "VMP-2026-00074",  # LUCAS ALFARO
    "VMP-2026-00075",  # BRAVO
    "VMP-2026-00076",  # CAYUMIL
    "VMP-2026-00077",  # PINO AGUILAR
    "VMP-2026-00078",  # FRANCISCO BARROS
    "VMP-2026-00079",  # GARCIA
]


async def regen():
    db_url = os.environ.get("DATABASE_URL", "")
    if db_url.startswith('"') and db_url.endswith('"'):
        os.environ["DATABASE_URL"] = db_url.strip('"')

    await prisma.connect()

    admin = await prisma.user.find_first(where={"rol": "SUPER_ADMIN"})
    if not admin:
        print("Super admin no encontrado, abortando.")
        return

    ok = 0
    for numero in CREDENCIALES_FINALES:
        try:
            cred = await prisma.credencial.find_first(where={"numero": numero})
            if not cred:
                print(f"  CREDENCIAL {numero} no encontrada en BD, salteando.")
                continue

            result = await generate_credential_for_student(
                alumno_id=cred.alumnoId,
                curso_id=cred.cursoId,
                emisor_id=admin.id,
                force=True,
            )
            print(f"  ✓ {numero} -> {result['pdfUrl']}")
            ok += 1
        except Exception as e:
            print(f"  ✗ {numero}: {e}")
            import traceback
            traceback.print_exc()

    print(f"\nListas: {ok}/{len(CREDENCIALES_FINALES)} credenciales regeneradas.")
    await prisma.disconnect()


if __name__ == "__main__":
    asyncio.run(regen())
