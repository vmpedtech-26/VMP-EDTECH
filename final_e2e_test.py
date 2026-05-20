import http.client
import json
import ssl
import uuid

host = "web-production-1b0066.up.railway.app"
ctx = ssl._create_unverified_context()
results = []

def request(method, path, body=None, token=None):
    conn = http.client.HTTPSConnection(host, context=ctx)
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    conn.request(method, path, json.dumps(body) if body else None, headers)
    res = conn.getresponse()
    try:
        data = json.loads(res.read().decode())
    except:
        data = {}
    conn.close()
    return res.status, data

def log(test, ok, detail=""):
    icon = "✅" if ok else "❌"
    results.append((ok, f"{icon} {test}: {detail}"))
    print(results[-1][1])

print("=" * 60)
print("PRUEBA E2E FINAL — VMP EdTech Producción")
print("=" * 60)

# === AUTENTICACIÓN ===
print("\n--- AUTENTICACIÓN ---")
status, data = request("POST", "/api/auth/login", {"email": "administracion@vmp-edtech.com", "password": "VmpAdmin2026!"})
log("Login Super Admin", status == 200, f"HTTP {status}")
admin_token = data.get("access_token", "")

status, data = request("POST", "/api/auth/login", {"email": "joaquin.alfaro@vmpedtech.com", "password": "TestAlumno2026!"})
log("Login Alumno", status == 200, f"HTTP {status}")
alumno_token = data.get("access_token", "")

status, data = request("GET", "/api/auth/me", token=admin_token)
log("Token válido (me endpoint)", status == 200 and data.get("rol") == "SUPER_ADMIN", f"rol={data.get('rol')}")

# === CURSOS ===
print("\n--- CURSOS ---")
unique_code = f"VMP-E2E-{uuid.uuid4().hex[:4].upper()}"
status, data = request("POST", "/api/cursos", {
    "nombre": "Curso E2E Auditoria Final",
    "codigo": unique_code,
    "descripcion": "Test automatizado completo",
    "duracionHoras": 8,
    "vigenciaMeses": 12
}, admin_token)
log("Crear curso (admin)", status in (200, 201), f"HTTP {status}, codigo={unique_code}")
curso_id = data.get("id", "")

status, data = request("GET", "/api/cursos", token=admin_token)
found = any(c.get("codigo") == unique_code for c in data) if isinstance(data, list) else False
log("Listar cursos (aparece el nuevo)", isinstance(data, list) and found, f"total={len(data) if isinstance(data,list) else '?'}, encontrado={found}")

if curso_id:
    status, data = request("GET", f"/api/cursos/{curso_id}", token=admin_token)
    log("Ver detalle de curso", status == 200, f"HTTP {status}")

# === MÓDULOS ===
print("\n--- MÓDULOS ---")
if curso_id:
    status, data = request("POST", f"/api/cursos/{curso_id}/modulos", {
        "titulo": "Módulo 1 - Teoría",
        "descripcion": "Contenido teórico básico",
        "tipo": "TEORIA",
        "orden": 1
    }, admin_token)
    log("Crear módulo en curso", status in (200, 201), f"HTTP {status}")
    modulo_id = data.get("id", "")

    status, data = request("GET", f"/api/cursos/{curso_id}/modulos", token=alumno_token)
    log("Alumno: ver módulos del curso", status == 200, f"HTTP {status}")
else:
    log("Crear módulo", False, "sin curso_id")

# === INSCRIPCIONES ===
print("\n--- INSCRIPCIONES ---")
if curso_id and alumno_token:
    status, data = request("POST", f"/api/inscripciones/{curso_id}/inscribir", {}, alumno_token)
    log("Inscribir alumno al curso", status in (200, 201), f"HTTP {status}")
    
    status, data = request("GET", "/api/inscripciones/mis-cursos", token=alumno_token)
    enrolled = any(str(curso_id) in str(item) for item in (data if isinstance(data, list) else [data]))
    log("Alumno: ver mis inscripciones", status == 200, f"HTTP {status}, inscriptos={len(data) if isinstance(data,list) else '?'}")

# === CREDENCIALES ===
print("\n--- CREDENCIALES ---")
status, data = request("GET", "/api/credenciales/mis-credenciales", token=alumno_token)
log("Alumno: ver mis credenciales", status == 200, f"HTTP {status}")

status, data = request("GET", "/api/credenciales/", token=admin_token)
log("Admin: ver todas las credenciales", status == 200, f"HTTP {status}")

# === MÉTRICAS Y SISTEMA ===
print("\n--- MÉTRICAS Y SISTEMA ---")
status, data = request("GET", "/api/metrics/overview", token=admin_token)
log("Métricas del sistema", status == 200, f"HTTP {status}")

status, data = request("GET", "/health")
log("Health check backend", status == 200 and data.get("status") == "ok", f"HTTP {status}")

# === USUARIOS Y EMPRESAS ===
print("\n--- USUARIOS Y EMPRESAS ---")
status, data = request("GET", "/api/users/", token=admin_token)
log("Listar todos los usuarios", status == 200, f"HTTP {status}, total={len(data) if isinstance(data,list) else '?'}")

status, data = request("GET", "/api/empresas/", token=admin_token)
log("Listar empresas", status == 200, f"HTTP {status}")

# === SEGURIDAD: acceso no autorizado ===
print("\n--- SEGURIDAD ---")
status, data = request("GET", "/api/cursos/")  # sin token
log("Cursos sin token (debe dar 401)", status == 401, f"HTTP {status}")

status, data = request("GET", "/api/users/", token=alumno_token)  # alumno no puede ver todos
log("Alumno no puede listar todos los usuarios", status in (401, 403), f"HTTP {status}")

# === CLEANUP ===
print("\n--- LIMPIEZA ---")
if curso_id:
    status, data = request("DELETE", f"/api/cursos/{curso_id}", token=admin_token)
    log("Eliminar curso de prueba", status in (200, 204), f"HTTP {status}")

# === RESUMEN ===
print("\n" + "=" * 60)
print("RESUMEN FINAL")
print("=" * 60)
passed = sum(1 for ok, _ in results if ok)
failed = sum(1 for ok, _ in results if not ok)
total = len(results)
print(f"  APROBADAS: {passed}/{total}")
print(f"  FALLIDAS:  {failed}/{total}")
print(f"  PORCENTAJE: {int(passed/total*100)}%")
if failed > 0:
    print("\n  ❌ DETALLE DE FALLAS:")
    for ok, msg in results:
        if not ok:
            print(f"    {msg}")
