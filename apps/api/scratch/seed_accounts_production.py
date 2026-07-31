import asyncio
from prisma import Prisma
import os

async def main():
    os.environ["PRISMA_PY_DEBUG_GENERATOR"] = "1"
    prisma = Prisma()
    await prisma.connect()
    try:
        print("🌱 Seeding plan de cuentas contables básico en la base de datos...")
        cuentas = [
            {"code": "1", "name": "ACTIVO", "type": "ASSET", "isSelectable": False},
            {"code": "1.1", "name": "ACTIVO CORRIENTE", "type": "ASSET", "parentCode": "1", "isSelectable": False},
            {"code": "1.1.01", "name": "Caja", "type": "ASSET", "parentCode": "1.1"},
            {"code": "1.1.02", "name": "Banco", "type": "ASSET", "parentCode": "1.1"},
            {"code": "1.1.05", "name": "IVA Crédito Fiscal", "type": "ASSET", "parentCode": "1.1"},
            {"code": "2", "name": "PASIVO", "type": "LIABILITY", "isSelectable": False},
            {"code": "2.1", "name": "PASIVO CORRIENTE", "type": "LIABILITY", "parentCode": "2", "isSelectable": False},
            {"code": "2.1.01", "name": "Proveedores", "type": "LIABILITY", "parentCode": "2.1"},
            {"code": "2.1.05", "name": "IVA Débito Fiscal", "type": "LIABILITY", "parentCode": "2.1"},
            {"code": "3", "name": "PATRIMONIO NETO", "type": "EQUITY", "isSelectable": False},
            {"code": "3.1.01", "name": "Capital Social", "type": "EQUITY", "parentCode": "3"},
            {"code": "4", "name": "INGRESOS", "type": "REVENUE", "isSelectable": False},
            {"code": "4.1.01", "name": "Ventas de Servicios", "type": "REVENUE", "parentCode": "4"},
            {"code": "5", "name": "EGRESOS", "type": "EXPENSE", "isSelectable": False},
            {"code": "5.1.01", "name": "Otros Gastos", "type": "EXPENSE", "parentCode": "5"},
            {"code": "5.1.02", "name": "Servicios Públicos", "type": "EXPENSE", "parentCode": "5"},
            {"code": "5.1.03", "name": "Impuestos y Tasas", "type": "EXPENSE", "parentCode": "5"},
            {"code": "5.1.04", "name": "Sueldos y Jornales", "type": "EXPENSE", "parentCode": "5"}
        ]
        
        created = 0
        for c in cuentas:
            existing = await prisma.account.find_unique(where={"code": c["code"]})
            if not existing:
                code_parts = c["code"].split(".")
                c["level"] = len(code_parts)
                await prisma.account.create(data=c)
                print(f"   + Creada cuenta: {c['code']} - {c['name']}")
                created += 1
            else:
                print(f"   o Cuenta ya existe: {c['code']} - {c['name']}")
                
        print(f"🎉 Seed contable completado! {created} cuentas nuevas agregadas.")
        
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
