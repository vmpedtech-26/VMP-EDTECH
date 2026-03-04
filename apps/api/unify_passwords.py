import psycopg2
import bcrypt
import traceback

DATABASE_URL = "postgresql://postgres:bngWhFAsXfcaZxWHVzLCDIbleiGMxAvK@nozomi.proxy.rlwy.net:29586/railway"

def unify_passwords():
    unified_password = "VmpAdmin2026!"
    hashed_pw = bcrypt.hashpw(unified_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    conn = None
    cur = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # We will make sure all existing SUPER_ADMIN accounts and local accounts have the same password
        cur.execute("UPDATE users SET password_hash = %s WHERE rol = 'SUPER_ADMIN';", (hashed_pw,))
        print(f"Updated all SUPER_ADMIN accounts to use password: {unified_password}")
        
        # Furthermore, explicitly insert the emails to test:
        emails = [
            "administracion@vmp-edtech.com",
            "admin@vmpservicios.com",
            "admin@vmp.com" 
        ]
        
        for email in emails:
            cur.execute("SELECT id FROM users WHERE email = %s;", (email,))
            exists = cur.fetchone()
            if exists:
                cur.execute("UPDATE users SET password_hash = %s, activo = true, rol = 'SUPER_ADMIN' WHERE email = %s;", (hashed_pw, email))
                print(f"Verified and updated specific account: {email}")
            else:
                pass
                
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        print("Error unified_passwords:")
        traceback.print_exc()
    finally:
        if cur: cur.close()
        if conn: conn.close()

if __name__ == "__main__":
    unify_passwords()
