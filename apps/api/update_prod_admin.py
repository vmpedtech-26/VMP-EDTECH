import psycopg2
import bcrypt
import uuid

DATABASE_URL = "postgresql://postgres:bngWhFAsXfcaZxWHVzLCDIbleiGMxAvK@nozomi.proxy.rlwy.net:29586/railway"

def update_prod_admin():
    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        target_email = "administracion@vmp-edtech.com"
        target_password = "pedro1973"
        hashed_pw = bcrypt.hashpw(target_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Check if target email already exists
        cur.execute("SELECT id FROM users WHERE email = %s;", (target_email,))
        target_exists = cur.fetchone()
        
        if target_exists:
            # Update the existing target user
            cur.execute("""
                UPDATE users 
                SET password_hash = %s, rol = 'SUPER_ADMIN', activo = True, nombre = 'Administración', apellido = 'VMP', updated_at = CURRENT_TIMESTAMP
                WHERE email = %s;
            """, (hashed_pw, target_email))
            print(f"✅ User updated in PRODUCTION: {target_email}")
        else:
            # Check if old admin email exists to rename it
            old_admin_email = "admin@vmpservicios.com"
            cur.execute("SELECT id FROM users WHERE email = %s;", (old_admin_email,))
            old_exists = cur.fetchone()
            
            if old_exists:
                cur.execute("""
                    UPDATE users 
                    SET email = %s, password_hash = %s, rol = 'SUPER_ADMIN', activo = True, nombre = 'Administración', apellido = 'VMP', updated_at = CURRENT_TIMESTAMP
                    WHERE email = %s;
                """, (target_email, hashed_pw, old_admin_email))
                print(f"✅ Renamed and updated old admin to: {target_email}")
            else:
                # Create brand new user (using a random DNI suffix if 00000000 is taken, but here we assume it was taken by old admin)
                # But just in case, let's use a unique DNI
                new_dni = "00000001" 
                user_id = str(uuid.uuid4())
                cur.execute("""
                    INSERT INTO users (id, email, password_hash, nombre, apellido, dni, telefono, rol, activo, created_at, updated_at) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
                """, (user_id, target_email, hashed_pw, "Administración", "VMP", new_dni, "2995370173", "SUPER_ADMIN", True))
                print(f"✅ New user created in PRODUCTION: {target_email} with DNI {new_dni}")
        
        conn.commit()
        cur.close()
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    update_prod_admin()
