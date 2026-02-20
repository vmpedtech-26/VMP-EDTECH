import psycopg2
import bcrypt
import uuid

DATABASE_URL = "postgresql://postgres:bngWhFAsXfcaZxWHVzLCDIbleiGMxAvK@nozomi.proxy.rlwy.net:29586/railway"

def restore_instructor():
    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Hash de password
        password = "instructor123"
        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Insertar instructor
        user_id = str(uuid.uuid4())
        cur.execute(
            "INSERT INTO users (id, email, password, nombre, rol, activo) VALUES (%s, %s, %s, %s, %s, %s) ON CONFLICT (email) DO NOTHING;",
            (user_id, "instructor@vmp.com", hashed_pw, "Instructor de Prueba", "INSTRUCTOR", True)
        )
        
        conn.commit()
        print(f"Instructor user created/checked successfully.")
        
        cur.close()
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    restore_instructor()
