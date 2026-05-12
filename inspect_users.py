import psycopg2

db_url = "postgresql://postgres:bngWhFAsXfcaZxWHVzLCDIbleiGMxAvK@nozomi.proxy.rlwy.net:29586/railway?sslmode=require"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT email, rol FROM users WHERE email LIKE '%admin%'")
    rows = cur.fetchall()
    print("Admin users found:")
    for row in rows:
        print(f"Email: {row[0]}, Rol: {row[1]}")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
