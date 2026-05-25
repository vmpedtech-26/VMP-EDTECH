import psycopg2
from psycopg2.extras import RealDictCursor

def clean_compras_production():
    database_url = "postgresql://postgres:IwcEOvwvqqrKORJeBLRVIJFJgHlJXAlv@kodama.proxy.rlwy.net:22678/railway"
    
    # IDs de las compras falsas identificadas en el diagnóstico
    compras_a_eliminar = [
        {"id": "84c48a7d-cce4-4d7f-9492-b053b9fb3b62", "proveedor": "ARCA (ex AFIP)", "factura": "F2051-04-2026"},
        {"id": "8cecd69b-cecd-42ee-80c0-224c138cf55d", "proveedor": "CASTILLO MARIANO JESUS", "factura": "0002-00000914"}
    ]
    
    print("🔗 Conectando a la base de datos de producción Postgres en Railway...")
    conn = None
    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Iniciar transacción para asegurar atomicidad
        cur.execute("BEGIN;")
        
        print("\n🧹 Iniciando proceso de limpieza de asientos contables asociados...")
        for comp in compras_a_eliminar:
            comp_id = comp["id"]
            factura = comp["factura"]
            proveedor = comp["proveedor"]
            
            print(f"\n👉 Procesando compra de {proveedor} (Factura: {factura})...")
            
            # 1. Buscar asientos en journal_entries relacionados por referencia o concepto
            cur.execute("""
                SELECT id, concept, reference, date 
                FROM journal_entries 
                WHERE reference = %s OR concept LIKE %s OR reference LIKE %s
            """, (factura, f"%{proveedor}%", f"%{factura}%"))
            
            asientos = cur.fetchall()
            print(f"   🔎 Asientos encontrados: {len(asientos)}")
            
            for asient in asientos:
                asiento_id = asient["id"]
                print(f"   🗑️ Eliminando Ledger Entries para asiento ID: {asiento_id} ({asient['concept']})")
                # Eliminar las Ledger Entries (apuntes del libro diario/mayor)
                cur.execute("DELETE FROM ledger_entries WHERE journal_id = %s", (asiento_id,))
                
                # Eliminar el Asiento del Diario
                print(f"   🗑️ Eliminando Journal Entry ID: {asiento_id}")
                cur.execute("DELETE FROM journal_entries WHERE id = %s", (asiento_id,))
            
            # 2. Eliminar egresos de caja_movimientos relacionados si los hubiera
            cur.execute("DELETE FROM caja_movimientos WHERE referencia = %s", (comp_id,))
            
            # 3. Eliminar la compra en sí (compra_items se elimina por onDelete: Cascade)
            print(f"   🗑️ Eliminando compra de tabla 'compras' con ID: {comp_id}")
            cur.execute("DELETE FROM compras WHERE id = %s", (comp_id,))
            
        # Confirmar todos los cambios
        conn.commit()
        print("\n✅ ¡Limpieza de base de datos de producción completada con ÉXITO absoluto!")
        
        # 4. PASO DE VERIFICACIÓN: Listar compras resultantes
        print("\n📋 VERIFICACIÓN FINAL - COMPRAS RESTANTES EN PRODUCCIÓN:")
        cur.execute("""
            SELECT c.id, c.proveedor, c.cuit, c.numero, c.fecha, c.total, c.categoria,
                   COALESCE(json_agg(ci.descripcion) FILTER (WHERE ci.id IS NOT NULL), '[]') as items
            FROM compras c
            LEFT JOIN compra_items ci ON c.id = ci.compra_id
            GROUP BY c.id
            ORDER BY c.fecha DESC
        """)
        compras_restantes = cur.fetchall()
        for i, comp in enumerate(compras_restantes, 1):
            print(f"[{i}] Proveedor: {comp['proveedor']} | Nro: {comp['numero']} | Fecha: {comp['fecha']} | Total: ${comp['total']}")
            print(f"    Items: {comp['items']}")
            
        print(f"\n📊 Total de compras remanentes: {len(compras_restantes)} (Debe ser exactamente 2 de La Colonia S.A.)")

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"❌ ERROR durante la limpieza. Se realizó rollback de la transacción: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    clean_compras_production()
