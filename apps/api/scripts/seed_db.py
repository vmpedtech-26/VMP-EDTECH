"""
Script manual de seed/reset de base de datos. NUNCA debe exponerse como
endpoint HTTP -- por eso vive en scripts/ y no en routers/.

`clean_and_setup()` en particular BORRA TODOS los datos reales (usuarios,
empresas, credenciales, contabilidad, cursos...) y los reemplaza por datos
de ejemplo hardcodeados, incluyendo contraseñas de SUPER_ADMIN fijas en el
código ("VmpAdmin2026!"). Se usó una única vez durante la puesta en marcha
inicial del sistema. Ejecutarlo hoy destruiría datos de producción reales.

Uso (solo manual, desde la terminal, nunca vía API):
    python scripts/seed_db.py run              # crea admin/cursos base si faltan (no destructivo)
    python scripts/seed_db.py clean-and-setup   # BORRA TODO y recarga datos de ejemplo (DESTRUCTIVO)
"""
import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from core.database import prisma
from auth.jwt import hash_password


async def run_seed():
    print("🌱 Iniciando seed...")

    admin_email = os.getenv("ADMIN_EMAIL", "admin@vmpservicios.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "VmpAdmin2026!")

    admin = await prisma.user.find_unique(where={"email": admin_email})

    if not admin:
        print(f"Creando Super Admin: {admin_email}")
        await prisma.user.create(
            data={
                "email": admin_email,
                "passwordHash": hash_password(admin_password),
                "nombre": "Administrador",
                "apellido": "VMP",
                "dni": "00000000",
                "rol": "SUPER_ADMIN",
                "activo": True
            }
        )
    else:
        print("Super Admin ya existe.")

    cursos = [
        {"nombre": "Manejo Defensivo Livianos", "codigo": "MDL-001", "descripcion": "Curso teórico-práctico de manejo defensivo para vehículos livianos.", "duracionHoras": 20, "vigenciaMeses": 24},
        {"nombre": "Manejo Defensivo Pesados", "codigo": "MDP-001", "descripcion": "Curso teórico-práctico de manejo defensivo para vehículos pesados y transporte de carga.", "duracionHoras": 40, "vigenciaMeses": 24},
        {"nombre": "Primeros Auxilios y RCP", "codigo": "PA-001", "descripcion": "Capacitación básica en primeros auxilios y reanimación cardiopulmonar.", "duracionHoras": 8, "vigenciaMeses": 24},
    ]
    for curso_data in cursos:
        existing = await prisma.curso.find_unique(where={"codigo": curso_data["codigo"]})
        if not existing:
            print(f"Creando curso: {curso_data['nombre']}")
            await prisma.curso.create(data=curso_data)

    print("✅ Seed completo.")


async def clean_and_setup():
    confirm = input(
        "\n⚠️  Esto BORRA TODOS los datos reales (usuarios, empresas, credenciales,\n"
        "contabilidad, cursos) y los reemplaza por datos de ejemplo. Escribí\n"
        "'BORRAR TODO' para confirmar: "
    )
    if confirm != "BORRAR TODO":
        print("Cancelado.")
        return

    print("🧹 Iniciando limpieza completa de base de datos...")

    await prisma.cajamovimiento.delete_many()
    await prisma.ledgerentry.delete_many()
    await prisma.journalentry.delete_many()
    await prisma.account.delete_many()
    await prisma.ventaitem.delete_many()
    await prisma.venta.delete_many()
    await prisma.compraitem.delete_many()
    await prisma.compra.delete_many()
    await prisma.credencial.delete_many()
    await prisma.fotocredencial.delete_many()
    await prisma.examen.delete_many()
    await prisma.inscripcion.delete_many()
    await prisma.pregunta.delete_many()
    await prisma.modulo.delete_many()
    await prisma.curso.delete_many()
    await prisma.passwordresettoken.delete_many()
    await prisma.user.delete_many()
    await prisma.company.delete_many()

    print("✅ Base de datos vaciada.")
    print("Recreá el plan de cuentas y usuarios base a mano, o restaurá un backup si esto fue un error.")


async def main():
    load_dotenv()
    await prisma.connect()
    try:
        action = sys.argv[1] if len(sys.argv) > 1 else None
        if action == "run":
            await run_seed()
        elif action == "clean-and-setup":
            await clean_and_setup()
        else:
            print(__doc__)
    finally:
        await prisma.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
