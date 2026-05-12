import psycopg2

db_url = "postgresql://postgres:bngWhFAsXfcaZxWHVzLCDIbleiGMxAvK@nozomi.proxy.rlwy.net:29586/railway?sslmode=require"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT email, rol, activo, nombre, apellido FROM users WHERE rol = 'ALUMNO' LIMIT 5")
    rows = cur.fetchall()
    print("Alumnos en producción:")
    for row in rows:
        print(f"  Email: {row[0]}, Rol: {row[1]}, Activo: {row[2]}, Nombre: {row[3]} {row[4]}")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
