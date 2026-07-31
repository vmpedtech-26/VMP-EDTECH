import psycopg2
import bcrypt

db_url = "postgresql://postgres:bngWhFAsXfcaZxWHVzLCDIbleiGMxAvK@nozomi.proxy.rlwy.net:29586/railway?sslmode=require"
password = "TestAlumno2026!".encode('utf-8')
password_hash = bcrypt.hashpw(password, bcrypt.gensalt()).decode('utf-8')
email = 'joaquin.alfaro@vmpedtech.com'

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("UPDATE users SET password_hash = %s WHERE email = %s", (password_hash, email))
    conn.commit()
    print(f"Password set for {email}: TestAlumno2026!")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
