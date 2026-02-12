import psycopg2

def inspect_admin():
    db_url = "postgresql://postgres:bngWhFAsXfcaZxWHVzLCDIbleiGMxAvK@nozomi.proxy.rlwy.net:29586/railway?sslmode=require"
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        cur.execute("SELECT email, password_hash FROM users WHERE email = 'admin@vmpservicios.com'")
        admin = cur.fetchone()
        if admin:
            print(f"Email: {admin[0]}")
            print(f"Hash: {admin[1]}")
            print(f"Hash Length: {len(admin[1])}")
        else:
            print("Admin not found!")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_admin()
