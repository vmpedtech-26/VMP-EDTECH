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
    data = json.loads(res.read().decode())
    conn.close()
    return res.status, data

def log(test, ok, detail=""):
    icon = "✅" if ok else "❌"
    results.append(f"{icon} {test}: {detail}")
    print(results[-1])

print("=" * 60)
print("PRUEBA E2E COMPLETA — VMP EdTech Producción")
print("=" * 60)

# 1. LOGIN SUPER ADMIN
status, data = request("POST", "/api/auth/login", {"email": "administracion@vmp-edtech.com", "password": "VmpAdmin2026!"})
ok = status == 200 and "access_token" in data
log("1. Login Super Admin", ok, f"status={status}")
admin_token = data.get("access_token", "")

# 2. CREAR CURSO
unique_code = f"VMP-TEST-{uuid.uuid4().hex[:4].upper()}"
status, data = request("POST", "/api/cursos/", {
    "nombre": "Curso Test Auditoria",
    "codigo": unique_code,
    "descripcion": "Curso creado en prueba automatizada E2E",
    "duracionHoras": 8,
    "vigenciaMeses": 12
}, admin_token)
ok = status in (200, 201) and "id" in data
log("2. Crear Curso", ok, f"status={status}, codigo={unique_code}")
curso_id = data.get("id", "")

# 3. LISTAR CURSOS (verificar que aparece)
status, data = request("GET", "/api/cursos/", token=admin_token)
ok = status == 200 and isinstance(data, list)
found = any(c.get("codigo") == unique_code for c in data) if ok else False
log("3. Listar Cursos (verificar creado)", ok and found, f"status={status}, total={len(data) if ok else '?'}, encontrado={found}")

# 4. LOGIN ALUMNO
status, data = request("POST", "/api/auth/login", {"email": "joaquin.alfaro@vmpedtech.com", "password": "TestAlumno2026!"})
ok = status == 200 and "access_token" in data
log("4. Login Alumno", ok, f"status={status}")
alumno_token = data.get("access_token", "")

# 5. VER CURSOS DISPONIBLES (como alumno)
status, data = request("GET", "/api/cursos/", token=alumno_token)
ok = status == 200
log("5. Alumno: Ver catálogo de cursos", ok, f"status={status}, cursos={len(data) if ok else '?'}")

# 6. INSCRIBIR ALUMNO AL CURSO
if curso_id and alumno_token:
    status, data = request("POST", f"/api/inscripciones/{curso_id}/inscribir", {}, alumno_token)
    ok = status in (200, 201)
    log("6. Inscribir alumno al curso", ok, f"status={status}")
else:
    log("6. Inscribir alumno al curso", False, "sin curso_id o token")

# 7. VER MIS CURSOS (alumno inscripto)
status, data = request("GET", "/api/inscripciones/mis-cursos", token=alumno_token)
ok = status == 200
log("7. Alumno: Ver mis cursos (post-inscripción)", ok, f"status={status}")

# 8. VER MÓDULOS DEL CURSO
if curso_id:
    status, data = request("GET", f"/api/cursos/{curso_id}/modulos", token=alumno_token)
    ok = status == 200
    log("8. Ver módulos del curso", ok, f"status={status}")
else:
    log("8. Ver módulos del curso", False, "sin curso_id")

# 9. VER CREDENCIALES DEL ALUMNO
status, data = request("GET", "/api/credenciales/mis-credenciales", token=alumno_token)
ok = status == 200
log("9. Alumno: Ver mis credenciales", ok, f"status={status}")

# 10. HEALTH CHECK GENERAL
status, data = request("GET", "/health")
ok = status == 200 and data.get("status") == "ok"
log("10. Health check backend", ok, f"status={status}")

# 11. MÉTRICAS DEL SISTEMA (super admin)
status, data = request("GET", "/api/metrics/", token=admin_token)
ok = status == 200
log("11. Métricas del sistema (admin)", ok, f"status={status}")

# 12. LISTAR ALUMNOS (admin)
status, data = request("GET", "/api/users/", token=admin_token)
ok = status == 200
log("12. Listar usuarios (admin)", ok, f"status={status}")

# 13. LISTAR EMPRESAS (admin)
status, data = request("GET", "/api/empresas/", token=admin_token)
ok = status == 200
log("13. Listar empresas (admin)", ok, f"status={status}")

# 14. ELIMINAR CURSO DE TEST
if curso_id:
    status, data = request("DELETE", f"/api/cursos/{curso_id}", token=admin_token)
    ok = status in (200, 204)
    log("14. Cleanup: Eliminar curso de test", ok, f"status={status}")

print("\n" + "=" * 60)
print("RESUMEN FINAL")
print("=" * 60)
passed = sum(1 for r in results if r.startswith("✅"))
failed = sum(1 for r in results if r.startswith("❌"))
print(f"APROBADAS: {passed}/{len(results)}")
print(f"FALLIDAS:  {failed}/{len(results)}")
