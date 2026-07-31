import asyncio
import traceback
from prisma import Prisma
from auth.jwt import verify_password, create_access_token
from schemas.models import TokenResponse

async def main():
    db = Prisma()
    await db.connect()
    
    email = "admin@vmpservicios.com"
    password = "AdminVMP2026!"
    
    try:
        user = await db.user.find_unique(where={"email": email})
        if not user:
            print("User not found!")
            return
            
        print("User found!")
        print(f"Role: {user.rol} (type: {type(user.rol)})")
        
        # Verify password
        if not verify_password(password, user.passwordHash):
            print("Verify password failed!")
            return
        print("Password verified!")
        
        # Access token
        access_token = create_access_token(data={"sub": user.id})
        print("Access token created!")
        
        # Test serializing / constructing response
        res_dict = {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "nombre": user.nombre,
                "apellido": user.apellido,
                "dni": user.dni,
                "rol": user.rol, # Let's see if this fails Pydantic validation or JSON serialization
                "empresaId": user.empresaId,
            }
        }
        
        print("Building TokenResponse...")
        # Test Pydantic validation
        token_resp = TokenResponse(**res_dict)
        print("TokenResponse built successfully!")
        
        # Test JSON serialization
        import json
        from fastapi.encoders import jsonable_encoder
        print("Encoding with jsonable_encoder...")
        encoded = jsonable_encoder(token_resp)
        print("Encoded successfully!")
        print(json.dumps(encoded))
        
    except Exception as e:
        print("❌ ERROR OCCURRED:")
        traceback.print_exc()
        
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
