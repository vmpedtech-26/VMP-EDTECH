import asyncio
from prisma import Prisma
from auth.jwt import verify_password

async def main():
    db = Prisma()
    await db.connect()
    u = await db.user.find_unique(where={"email": "admin@vmpservicios.com"})
    if not u:
        print("❌ User not found!")
    else:
        print("User found!")
        for test_pass in ["VmpAdmin2024!", "AdminVMP2026!", "admin123"]:
            ok = verify_password(test_pass, u.passwordHash)
            print(f"Password '{test_pass}' verification: {'✅ SUCCESS' if ok else '❌ FAIL'}")
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
