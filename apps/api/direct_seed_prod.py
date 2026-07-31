import psycopg2
import uuid
from datetime import datetime
import bcrypt

def seed():
    # Production Database URL
    db_url = "postgresql://postgres:bngWhFAsXfcaZxWHVzLCDIbleiGMxAvK@nozomi.proxy.rlwy.net:29586/railway?sslmode=require"
    
    # Pre-compute hash for "VmpAdmin2026!" using direct bcrypt
    # This avoids any passlib CryptContext discrepancy
    password = "VmpAdmin2026!".encode('utf-8')
    # Use a standard salt for the seed admin
    password_hash = bcrypt.hashpw(password, bcrypt.gensalt()).decode('utf-8')
    
    print("🌱 Iniciando seed de producción con hash directo...")
    
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        # Eliminar el admin anterior si existe (limpieza ante fallos previos)
        admin_email = "admin@vmpservicios.com"
        now = datetime.now()
        
        cur.execute("DELETE FROM users WHERE email = %s", (admin_email,))
        
        print(f"Creando Super Admin: {admin_email}")
        admin_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO users (id, email, password_hash, nombre, apellido, dni, rol, activo, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            admin_id,
            admin_email,
            password_hash,
            "Administrador",
            "VMP",
            "00000000",
            "SUPER_ADMIN",
            True,
            now,
            now
        ))
            
        conn.commit()
        cur.close()
        conn.close()
        print("✅ Seed de Admin completado exitosamente con hash directo!")
        
    except Exception as e:
        print(f"❌ Error durante el seed: {e}")

if __name__ == "__main__":
    seed()
