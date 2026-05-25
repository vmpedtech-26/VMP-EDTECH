import os
import psycopg2
from psycopg2.extras import RealDictCursor

def diagnostico_compras():
    database_url = "postgresql://postgres:IwcEOvwvqqrKORJeBLRVIJFJgHlJXAlv@kodama.proxy.rlwy.net:22678/railway"

    print("🔗 Conectando a la base de datos de producción en Railway...")
    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # 1. Listar todas las compras y sus ítems
        print("\n📥 Obteniendo listado de compras de producción...")
        cur.execute("""
            SELECT c.id, c.proveedor, c.cuit, c.numero, c.fecha, c.total, c.categoria, c.metodo_pago,
                   COALESCE(json_agg(ci.descripcion) FILTER (WHERE ci.id IS NOT NULL), '[]') as items
            FROM compras c
            LEFT JOIN compra_items ci ON c.id = ci.compra_id
            GROUP BY c.id
            ORDER BY c.fecha DESC
        """)
        
        compras = cur.fetchall()
        print(f"📊 Total de compras encontradas en base de datos: {len(compras)}")
        
        print("\n--- DETALLE DE COMPRAS ---")
        for i, comp in enumerate(compras, 1):
            print(f"\n[{i}] ID: {comp['id']}")
            print(f"    Proveedor: {comp['proveedor']} | CUIT: {comp['cuit']} | Nro: {comp['numero']}")
            print(f"    Fecha: {comp['fecha']} | Total: ${comp['total']} | Categoria: {comp['categoria']}")
            print(f"    Metodo Pago: {comp['metodo_pago']}")
            print(f"    Items: {comp['items']}")
            
            # Clasificación simple para ver
            desc_text = str(comp['items']).lower() + " " + str(comp['proveedor']).lower()
            is_combustible = any(x in desc_text for x in ["combustible", "combustibles", "nafta", "gasoil", "diesel", "ypf", "shell", "axion", "pampa"])
            
            if is_combustible:
                print("    👉 CLASIFICACIÓN: CONSERVAR (Es combustible del usuario)")
            else:
                print("    👉 CLASIFICACIÓN: ELIMINAR (Compra falsa / de prueba)")
                
        # 2. Listar movimientos de caja asociados a compras
        cur.execute("""
            SELECT id, fecha, tipo, monto, concepto, referencia, metodo
            FROM caja_movimientos
            WHERE tipo = 'EGRESO'
        """)
        movimientos = cur.fetchall()
        print(f"\n📊 Total de egresos en caja_movimientos: {len(movimientos)}")
        for m in movimientos:
            print(f"   - ID: {m['id']} | Monto: ${m['monto']} | Concepto: {m['concepto']} | Referencia: {m['referencia']}")
            
    except Exception as e:
        print(f"❌ Error durante el diagnóstico: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    diagnostico_compras()
