import asyncio
from prisma import Prisma
import os

async def main():
    os.environ["PRISMA_PY_DEBUG_GENERATOR"] = "1"
    prisma = Prisma()
    await prisma.connect()
    try:
        print("🧾 1. COMPRAS (PURCHASES) IN DATABASE:")
        compras = await prisma.compra.find_many(
            include={"items": True},
            order={"fecha": "desc"}
        )
        print(f"   Total Compras: {len(compras)}")
        for c in compras:
            print(f"   - Proveedor: {c.proveedor} | CUIT: {c.cuit} | Nro: {c.numero} | Total: ${c.total:.2f} | Items Count: {len(c.items)}")
            
        print("\n💰 2. VENTAS (SALES) IN DATABASE:")
        ventas = await prisma.venta.find_many(
            include={"items": True},
            order={"fecha": "desc"}
        )
        print(f"   Total Ventas: {len(ventas)}")
        for v in ventas:
            print(f"   - Numero: {v.numero} | Total: ${v.total:.2f} | Estado: {v.estado} | Items Count: {len(v.items)}")
            
        print("\n📔 3. JOURNAL ENTRIES IN DATABASE:")
        journals = await prisma.journalentry.find_many(
            take=10,
            order={"date": "desc"}
        )
        print(f"   Total Journal Entries (Recent): {len(journals)}")
        for j in journals:
            print(f"   - Date: {j.date} | Concept: {j.concept} | Ref: {j.reference} | Type: {j.type}")
            
        print("\n📁 4. ACCOUNTS COUNT IN DATABASE:")
        ac_count = await prisma.account.count()
        print(f"   Total Accounts: {ac_count}")
            
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
