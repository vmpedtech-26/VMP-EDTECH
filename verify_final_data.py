import http.client
import json
import ssl

def verify_data():
    host = "web-production-1b0066.up.railway.app"
    email = "admin@vmpservicios.com"
    password = "VmpAdmin2026!"
    
    context = ssl._create_unverified_context()
    conn = http.client.HTTPSConnection(host, context=context)
    headers = {'Content-Type': 'application/json'}
    
    try:
        # 1. Login to get token
        print(f"Obteniendo token para {email}...")
        login_payload = json.dumps({"email": email, "password": password})
        conn.request("POST", "/api/auth/login", login_payload, headers)
        res = conn.getresponse()
        data = json.loads(res.read().decode('utf-8'))
        
        token = data.get("access_token")
        if not token:
            print("ERROR: No se pudo obtener el token.")
            return

        # 2. Get Courses
        print("Consultando lista de cursos...")
        auth_headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        }
        conn.request("GET", "/api/cursos/", "", auth_headers)
        res_courses = conn.getresponse()
        courses = json.loads(res_courses.read().decode('utf-8'))
        
        print(f"Status Cursos: {res_courses.status}")
        print(f"Cursos encontrados: {len(courses)}")
        for c in courses:
            print(f"- [{c.get('codigo')}] {c.get('nombre')}")
            
        if len(courses) >= 3:
            print("✅ Verificación de datos exitosa!")
        else:
            print("⚠️ Faltan algunos cursos en la base de datos.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    verify_data()
