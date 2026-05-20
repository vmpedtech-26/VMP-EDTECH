import http.client, json, ssl, uuid

host = "web-production-1b0066.up.railway.app"
ctx = ssl._create_unverified_context()

def request(method, path, body=None, token=None):
    conn = http.client.HTTPSConnection(host, context=ctx)
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    conn.request(method, path, json.dumps(body) if body else None, headers)
    res = conn.getresponse()
    data = res.read().decode()
    conn.close()
    return res.status, data

# Login
status, data = request("POST", "/api/auth/login", {"email": "administracion@vmp-edtech.com", "password": "VmpAdmin2026!"})
admin_token = json.loads(data).get("access_token", "")

# Create course
unique_code = f"VMP-DBG-{uuid.uuid4().hex[:4].upper()}"
status, data = request("POST", "/api/cursos/", {"nombre":"Debug Test","codigo":unique_code,"descripcion":"debug","duracionHoras":8,"vigenciaMeses":12}, admin_token)
curso_id = json.loads(data).get("id","")
print(f"Curso creado: {curso_id}")

# Debug: Create module - exact error
print("\n=== FALLA 1: Crear módulo ===")
status, data = request("POST", f"/api/cursos/{curso_id}/modulos", {"titulo":"Test","descripcion":"Test","tipo":"TEORIA","orden":1}, admin_token)
print(f"HTTP {status}: {data}")

# Debug: Metrics
print("\n=== FALLA 2: Métricas ===")
status, data = request("GET", "/api/metrics/overview", token=admin_token)
print(f"HTTP {status}: {data[:500]}")

# Debug: Auth without token returns 403 not 401
print("\n=== FALLA 3: Cursos sin token ===")
status, data = request("GET", "/api/cursos/")
print(f"HTTP {status} (403=esperado por FastAPI, no es bug real)")

# Cleanup
request("DELETE", f"/api/cursos/{curso_id}", token=admin_token)
