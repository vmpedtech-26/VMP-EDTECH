import psycopg2

DATABASE_URL = "postgresql://postgres:bngWhFAsXfcaZxWHVzLCDIbleiGMxAvK@nozomi.proxy.rlwy.net:29586/railway"

def check_db():
    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Check users table columns
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        """)
        columns = cur.fetchall()
        print("Columns in 'users' table:")
        for col in columns:
            print(f"- {col[0]}")
            
        cur.close()
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    check_db()
