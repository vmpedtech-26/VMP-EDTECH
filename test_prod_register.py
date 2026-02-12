import http.client
import json
import ssl
import uuid

def test_register_login():
    host = "web-production-1b0066.up.railway.app"
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    password = "VmpTestPassword123"
    
    # Create an unverified context
    context = ssl._create_unverified_context()
    
    conn = http.client.HTTPSConnection(host, context=context)
    
    # 1. Register
    payload = json.dumps({
        "email": email,
        "password": password,
        "nombre": "Test",
        "apellido": "User",
        "dni": f"{uuid.uuid4().hex[:8]}", # Random DNI
        "telefono": "12345678"
    })
    headers = {'Content-Type': 'application/json'}
    
    print(f"Intentando registro en {host} con {email}...")
    
    try:
        conn.request("POST", "/api/auth/register", payload, headers)
        res = conn.getresponse()
        data = res.read()
        print(f"Register Status: {res.status}")
        print(f"Register Response: {data.decode('utf-8')}")
        
        if res.status == 200:
            print("✅ Registro exitoso! Intentando login...")
            # 2. Login
            login_payload = json.dumps({"email": email, "password": password})
            conn.request("POST", "/api/auth/login", login_payload, headers)
            res_login = conn.getresponse()
            data_login = res_login.read()
            print(f"Login Status: {res_login.status}")
            print(f"Login Response: {data_login.decode('utf-8')}")
            
            if res_login.status == 200:
                print("✅ Login exitoso con el nuevo usuario!")
            else:
                print("❌ Login falló para el nuevo usuario.")
        else:
            print("❌ Registro falló.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    test_register_login()
