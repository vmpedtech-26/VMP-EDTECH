import psycopg2

DATABASE_URL = "postgresql://postgres:bngWhFAsXfcaZxWHVzLCDIbleiGMxAvK@nozomi.proxy.rlwy.net:29586/railway"

def find_dni():
    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        dni = "00000000"
        cur.execute("SELECT email, nombre, apellido, rol FROM users WHERE dni = %s;", (dni,))
        user = cur.fetchone()
        
        if user:
            print(f"User with DNI {dni}:")
            print(f"- Email: {user[0]}")
            print(f"- Nombre: {user[1]} {user[2]}")
            print(f"- Rol: {user[3]}")
        else:
            print(f"No user found with DNI {dni}")
            
        cur.close()
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    find_dni()
