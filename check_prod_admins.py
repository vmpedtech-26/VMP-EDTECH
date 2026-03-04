import psycopg2
import traceback
import sys

DATABASE_URL = "postgresql://postgres:bngWhFAsXfcaZxWHVzLCDIbleiGMxAvK@nozomi.proxy.rlwy.net:29586/railway"

def get_prod_admins():
    conn = None
    cur = None
    try:
        print("Connecting to db...")
        sys.stdout.flush()
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        cur.execute("SELECT email, activo, rol FROM \"User\" WHERE rol = 'SUPER_ADMIN';")
        admins = cur.fetchall()
        
        print("Producción SUPER_ADMINs in User:")
        for admin in admins:
            print(f"Email: {admin[0]}, Activo: {admin[1]}, Rol: {admin[2]}")
            
    except psycopg2.errors.UndefinedTable:
        if conn:
            conn.rollback()
        print("Table 'User' not found, trying 'users'")
        try:
            cur.execute("SELECT email, activo, rol FROM users;")
            admins = cur.fetchall()
            print("All users:")
            for admin in admins:
                print(f"Email: {admin[0]}, Activo: {admin[1]}, Rol: {admin[2]}")
        except Exception as e2:
            print("Error parsing 'users':", e2)
    except Exception as e:
        print("General error:")
        traceback.print_exc()
    finally:
        if cur: cur.close()
        if conn: conn.close()

if __name__ == "__main__":
    get_prod_admins()
