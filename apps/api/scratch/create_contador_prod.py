import http.client
import json
import ssl

def create_contador_in_production():
    # URL de producción de la API de VMP
    host = "vmp-edtech-production.up.railway.app"
    
    # Credenciales de Super Administrador de producción
    admin_email = "admin@vmpservicios.com"
    admin_password = "VmpAdmin2026!"
    
    # Crear un contexto SSL que no verifique certificados (para evitar fallos por configuraciones locales de certificados)
    context = ssl._create_unverified_context()
    
    # 1. PASO 1: Iniciar sesión como Super Admin en producción para obtener el token JWT
    conn = http.client.HTTPSConnection(host, context=context)
    login_payload = json.dumps({
        "email": admin_email,
        "password": admin_password
    })
    headers = {
        'Content-Type': 'application/json'
    }
    
    print(f"🔗 Conectando con el servidor de producción: {host}...")
    print(f"🔑 Intentando iniciar sesión como Super Admin ({admin_email})...")
    
    try:
        conn.request("POST", "/api/auth/login", login_payload, headers)
        res = conn.getresponse()
        data = res.read()
        
        if res.status != 200:
            print(f"❌ Error al iniciar sesión como Super Admin. Status: {res.status}")
            print(f"Respuesta: {data.decode('utf-8')}")
            return
            
        response_data = json.loads(data.decode('utf-8'))
        token = response_data.get("access_token")
        
        if not token:
            print("❌ No se pudo obtener el token JWT de la respuesta.")
            return
            
        print("✅ Inicio de sesión exitoso! Token obtenido correctamente.")
        
        # 2. PASO 2: Crear el usuario contador para EstudioCastillo
        print("\n⚙️ Enviando solicitud para crear el usuario contador para EstudioCastillo...")
        
        contador_payload = json.dumps({
            "email": "contacto@estudiocastillo.com",
            "password": "CastilloContable2026!",
            "nombre": "Estudio",
            "apellido": "Castillo",
            "dni": "99887766",
            "telefono": "1122334455",
            "rol": "CONTADOR",
            "activo": True
        })
        
        contador_headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        }
        
        conn.request("POST", "/api/users", contador_payload, contador_headers)
        res_user = conn.getresponse()
        data_user = res_user.read()
        
        print(f"Status creación: {res_user.status}")
        print(f"Respuesta creación: {data_user.decode('utf-8')}")
        
        if res_user.status in (200, 201):
            print("\n🎉 ¡Usuario Contador para EstudioCastillo Creado Exitosamente en Producción! 🎉")
            print("   Email: contacto@estudiocastillo.com")
            print("   Contraseña: CastilloContable2026!")
            print("   Rol: CONTADOR")
        elif res_user.status == 400 and "ya está registrado" in data_user.decode('utf-8'):
            print("\n⚠️ El email o DNI ya se encuentra registrado en producción.")
            print("   Intentando actualizar el rol del usuario existente a CONTADOR...")
            
            # Busquemos los usuarios existentes para ver si podemos actualizar el rol del usuario
            # (El Super Admin puede actualizar usuarios vía PUT /api/users/{id})
            # Primero necesitamos encontrar el ID de 'contacto@estudiocastillo.com'
            conn.request("GET", "/api/users?rol=ALUMNO", headers=contador_headers)
            res_list = conn.getresponse()
            data_list = res_list.read()
            
            if res_list.status == 200:
                users = json.loads(data_list.decode('utf-8'))
                target_user = next((u for u in users if u.get("email") == "contacto@estudiocastillo.com"), None)
                
                if target_user:
                    user_id = target_user.get("id")
                    print(f"👤 Usuario encontrado en producción con ID: {user_id}. Actualizando rol a CONTADOR...")
                    
                    update_payload = json.dumps({
                        "rol": "CONTADOR",
                        "activo": True
                    })
                    conn.request("PUT", f"/api/users/{user_id}", update_payload, contador_headers)
                    res_update = conn.getcall = conn.getresponse()
                    res_update = conn.getresponse()
                    data_update = res_update.read()
                    
                    print(f"Status actualización: {res_update.status}")
                    print(f"Respuesta actualización: {data_update.decode('utf-8')}")
                    
                    if res_update.status == 200:
                        print("🎉 ¡Rol actualizado con éxito a CONTADOR en producción! 🎉")
                    else:
                        print("❌ Falló la actualización del rol.")
                else:
                    print("❌ No se encontró el usuario 'contacto@estudiocastillo.com' en la lista de alumnos de producción.")
            else:
                print(f"❌ Falló el listado de usuarios en producción. Status: {res_list.status}")
        else:
            print("❌ Ocurrió un error inesperado al intentar crear el usuario en producción.")
            
    except Exception as e:
        print(f"❌ Excepción durante la ejecución: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    create_contador_in_production()
