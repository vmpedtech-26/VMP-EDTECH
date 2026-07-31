import http.client
import json
import ssl

def test_login():
    host = "vmp-edtech-production.up.railway.app"
    email = "admin@vmpservicios.com"
    password = "AdminVMP2026!"
    
    context = ssl._create_unverified_context()
    conn = http.client.HTTPSConnection(host, context=context)
    payload = json.dumps({
        "email": email,
        "password": password
    })
    headers = {
        'Content-Type': 'application/json'
    }
    
    print(f"Intentando login en producción: {host} con {email}...")
    
    try:
        conn.request("POST", "/api/auth/login", payload, headers)
        res = conn.getresponse()
        data = res.read()
        
        print(f"Status: {res.status}")
        data_decoded = data.decode('utf-8')
        print(f"Response: {data_decoded}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    test_login()
