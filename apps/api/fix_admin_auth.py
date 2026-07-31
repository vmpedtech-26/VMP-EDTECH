import psycopg2
import bcrypt
from datetime import datetime

def fix_admin():
    # Production Database URL
    db_url = "postgresql://postgres:bngWhFAsXfcaZxWHVzLCDIbleiGMxAvK@nozomi.proxy.rlwy.net:29586/railway?sslmode=require"
    admin_email = "admin@vmpservicios.com"
    new_password = "VmpAdmin2024!"
    
    print(f"🔧 Iniciando recuperación de acceso para: {admin_email}")
    
    # Hash the password correctly
    password_bytes = new_password.encode('utf-8')
    password_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
    
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        now = datetime.now()
        
        # Check if user exists
        cur.execute("SELECT id FROM users WHERE email = %s", (admin_email,))
        user = cur.fetchone()
        
        if user:
            print(f"Actualizando contraseña para el usuario existente...")
            cur.execute("""
                UPDATE users 
                SET password_hash = %s, rol = 'SUPER_ADMIN', activo = True, updated_at = %s 
                WHERE email = %s
            """, (password_hash, now, admin_email))
        else:
            print(f"El usuario no existe. Creándolo desde cero...")
            import uuid
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
        print(f"✅ ÉXITO: Acceso recuperado. Email: {admin_email} | Password: {new_password}")
        
    except Exception as e:
        print(f"❌ Error durante la recuperación: {e}")

if __name__ == "__main__":
    fix_admin()
