import psycopg2
import bcrypt
import uuid

DATABASE_URL = "postgresql://postgres:bngWhFAsXfcaZxWHVzLCDIbleiGMxAvK@nozomi.proxy.rlwy.net:29586/railway"

def create_fresh_admin():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    email = "adminweb@vmp-edtech.com"
    password = "AccesoWeb2026!"
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Check if exists
    cur.execute("SELECT id FROM users WHERE email = %s;", (email,))
    user = cur.fetchone()
    
    if user:
        cur.execute("UPDATE users SET password_hash = %s, activo = true, rol = 'SUPER_ADMIN' WHERE email = %s;", (hashed_pw, email))
        print("Updated existing user")
    else:
        new_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO users (id, email, password_hash, nombre, apellido, dni, telefono, rol, activo, created_at, updated_at) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        """, (new_id, email, hashed_pw, 'Web', 'Admin', '00000000', '123456', 'SUPER_ADMIN'))
        print("Inserted new admin user")
        
    conn.commit()
    cur.close()
    conn.close()
    
    print(f"DONE. Login: {email} / {password}")

if __name__ == "__main__":
    create_fresh_admin()
