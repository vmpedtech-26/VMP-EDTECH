import psycopg2
import json
import os

# Credenciales de Railway del log anterior
DATABASE_URL = "postgresql://postgres:bngWhFAsXfcaZxWHVzLCDIbleiGMxAvK@nozomi.proxy.rlwy.net:29586/railway"

def audit_users():
    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Listar usuarios
        cur.execute("SELECT id, email, rol, nombre FROM \"User\";")
        users = cur.fetchall()
        
        user_list = []
        for u in users:
            user_list.append({
                "id": u[0],
                "email": u[1],
                "rol": u[2],
                "nombre": u[3]
            })
            
        print(json.dumps(user_list, indent=2))
        
        cur.close()
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    audit_users()
