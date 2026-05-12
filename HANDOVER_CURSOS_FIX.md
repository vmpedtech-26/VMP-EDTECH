# Resumen de Estado - Fix de Visibilidad de Cursos

## El Problema Original
El usuario reportó que "ahora al crear un curso no lo veo en la gestion de cursos". Sin embargo, las pruebas automatizadas del backend (E2E) confirmaban que los cursos se creaban correctamente en la base de datos y se listaban en la API.

## Causa Raíz Descubierta
El problema era exclusivamente del Frontend (Next.js) y la comunicación con la API (FastAPI) en producción, originado por dos factores combinados:

1. **Redirección por Trailing Slash (HTTP 307):**
   Las rutas del backend (`/api/cursos`) exigían una barra final (`@router.get("/")`). Cuando el frontend pedía `/api/cursos` sin barra, FastAPI respondía con un `307 Temporary Redirect` hacia `/api/cursos/`. Este redireccionamiento causaba que el navegador perdiera los encabezados de autenticación (`Authorization`), resultando en un acceso denegado (HTTP 403) y haciendo que el frontend mostrara la lista vacía ("No se encontraron cursos").

2. **Bloqueo por Mixed Content (CORS / HTTP vs HTTPS):**
   La variable de entorno del frontend en producción (Vercel) apuntaba a una URL insegura: `http://web-production...` en lugar de `https://`. Dado que la web carga por HTTPS (`https://www.vmp-edtech.com`), el navegador bloqueaba las peticiones por políticas de "Contenido Mixto" (Mixed Content) y CORS.

## Soluciones Implementadas y Desplegadas
1. **En el Backend (FastAPI - Commit `d4ab517`):**
   - Se modificaron los routers (`cursos.py`, `empresas.py`, `users.py`, `credenciales.py`, `cotizaciones.py`) cambiando `@router.get("/")` por `@router.get("")`.
   - *Resultado:* La API ahora responde directamente a `/api/cursos` sin redirecciones 307, siendo 100% compatible con el cliente de Next.js.
   
2. **En el Frontend (Next.js - Commit `93d9022`):**
   - Se actualizó el archivo `apps/web/lib/api-client.ts`.
   - Se eliminó la dependencia de las variables de entorno para evitar configuraciones erróneas de Vercel.
   - Se forzó el uso del dominio oficial y seguro: `export const API_URL = 'https://api.vmp-edtech.com';`.
   - *Resultado:* Todas las peticiones desde el frontend viajan obligatoriamente cifradas por HTTPS hacia el backend oficial.

## Próximos Pasos (Al retomar)
1. **Verificar el Despliegue en Vercel:** Los cambios del frontend ya fueron subidos al repositorio principal (`main`), pero hay que esperar a que Vercel termine el proceso de *build*.
2. **Prueba Manual Final:** Ingresar a `https://www.vmp-edtech.com/dashboard/super/cursos` como Super Administrador y verificar que los cursos creados ahora sí aparecen en la lista.
3. El documento de auditoría final se actualizó para reflejar estos últimos descubrimientos: `artifacts/audit_stabilization_report.md`.
