import http.client
import json
import ssl

def test_login():
    host = "web-production-1b0066.up.railway.app"
    email = "admin@vmpservicios.com"
    password = "VmpAdmin2026!"
    
    # Create an unverified context
    context = ssl._create_unverified_context()
    
    conn = http.client.HTTPSConnection(host, context=context)
    payload = json.dumps({
        "email": email,
        "password": password
    })
    headers = {
        'Content-Type': 'application/json'
    }
    
    print(f"Intentando login en {host} con {email}...")
    
    try:
        conn.request("POST", "/api/auth/login", payload, headers)
        res = conn.getresponse()
        data = res.read()
        
        print(f"Status: {res.status}")
        data_decoded = data.decode('utf-8')
        print(f"Response: {data_decoded}")
        
        if res.status == 200:
            print("✅ Login exitoso! El Super Admin está activo.")
            token = json.loads(data_decoded).get("access_token")
            if token:
                print(f"Token obtenido: {token[:20]}...")
        else:
            print("❌ Error en login.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    test_login()
