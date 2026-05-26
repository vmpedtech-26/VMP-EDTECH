from fastapi import APIRouter, HTTPException, status
from core.database import prisma
from auth.jwt import hash_password
import os

router = APIRouter()

@router.post("/run")
async def run_seed():
    print("🌱 Iniciando seed desde API...")
    
    # 1. Crear Super Admin if not exists
    admin_email = os.getenv("ADMIN_EMAIL", "admin@vmpservicios.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "VmpAdmin2026!")
    
    try:
        admin = await prisma.user.find_unique(where={"email": admin_email})
        
        if not admin:
            print(f"Creando Super Admin: {admin_email}")
            await prisma.user.create(
                data={
                    "email": admin_email,
                    "passwordHash": hash_password(admin_password),
                    "nombre": "Administrador",
                    "apellido": "VMP",
                    "dni": "00000000",
                    "rol": "SUPER_ADMIN",
                    "activo": True
                }
            )
            created_admin = True
        else:
            print("Super Admin ya existe.")
            created_admin = False
            
        # 2. Cursos Fundamentales
        cursos = [
            {
                "nombre": "Manejo Defensivo Livianos",
                "codigo": "MDL-001",
                "descripcion": "Curso teórico-práctico de manejo defensivo para vehículos livianos.",
                "duracionHoras": 20,
                "vigenciaMeses": 24
            },
            {
                "nombre": "Manejo Defensivo Pesados",
                "codigo": "MDP-001",
                "descripcion": "Curso teórico-práctico de manejo defensivo para vehículos pesados y transporte de carga.",
                "duracionHoras": 40,
                "vigenciaMeses": 24
            },
            {
                "nombre": "Primeros Auxilios y RCP",
                "codigo": "PA-001",
                "descripcion": "Capacitación básica en primeros auxilios y reanimación cardiopulmonar.",
                "duracionHoras": 8,
                "vigenciaMeses": 24
            }
        ]
        
        created_cursos = []
        for curso_data in cursos:
            existing = await prisma.curso.find_unique(where={"codigo": curso_data["codigo"]})
            if not existing:
                print(f"Creando curso: {curso_data['nombre']}")
                await prisma.curso.create(data=curso_data)
                created_cursos.append(curso_data['nombre'])
        
        return {
            "status": "success",
            "message": "Seed completed",
            "admin_created": created_admin,
            "cursos_created": created_cursos
        }
    except Exception as e:
        print(f"❌ Error en seed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/clean-and-setup")
async def clean_and_setup():
    """Elimina todos los datos de simulación y carga solo los datos reales requeridos por el usuario"""
    print("🧹 Iniciando limpieza completa de base de datos...")
    
    try:
        # 1. Eliminar datos existentes en orden de dependencia
        await prisma.cajamovimiento.delete_many()
        await prisma.ledgerentry.delete_many()
        await prisma.journalentry.delete_many()
        await prisma.account.delete_many()
        await prisma.ventaitem.delete_many()
        await prisma.venta.delete_many()
        await prisma.compraitem.delete_many()
        await prisma.compra.delete_many()
        await prisma.credencial.delete_many()
        await prisma.fotocredencial.delete_many()
        await prisma.examen.delete_many()
        await prisma.inscripcion.delete_many()
        await prisma.pregunta.delete_many()
        await prisma.modulo.delete_many()
        await prisma.curso.delete_many()
        await prisma.passwordresettoken.delete_many()
        await prisma.user.delete_many()
        await prisma.company.delete_many()
        
        print("✅ Base de datos vaciada con éxito!")

        # 2. Crear Cuentas Contables (Plan de Cuentas Básico)
        cuentas = [
            {"code": "1", "name": "ACTIVO", "type": "ASSET", "isSelectable": False},
            {"code": "1.1", "name": "ACTIVO CORRIENTE", "type": "ASSET", "parentCode": "1", "isSelectable": False},
            {"code": "1.1.01", "name": "Caja", "type": "ASSET", "parentCode": "1.1"},
            {"code": "1.1.02", "name": "Banco", "type": "ASSET", "parentCode": "1.1"},
            {"code": "1.1.05", "name": "IVA Crédito Fiscal", "type": "ASSET", "parentCode": "1.1"},
            {"code": "2", "name": "PASIVO", "type": "LIABILITY", "isSelectable": False},
            {"code": "2.1", "name": "PASIVO CORRIENTE", "type": "LIABILITY", "parentCode": "2", "isSelectable": False},
            {"code": "2.1.01", "name": "Proveedores", "type": "LIABILITY", "parentCode": "2.1"},
            {"code": "2.1.05", "name": "IVA Débito Fiscal", "type": "LIABILITY", "parentCode": "2.1"},
            {"code": "3", "name": "PATRIMONIO NETO", "type": "EQUITY", "isSelectable": False},
            {"code": "3.1.01", "name": "Capital Social", "type": "EQUITY", "parentCode": "3"},
            {"code": "4", "name": "INGRESOS", "type": "REVENUE", "isSelectable": False},
            {"code": "4.1.01", "name": "Ventas de Servicios", "type": "REVENUE", "parentCode": "4"},
            {"code": "5", "name": "EGRESOS", "type": "EXPENSE", "isSelectable": False},
            {"code": "5.1.01", "name": "Otros Gastos", "type": "EXPENSE", "parentCode": "5"},
            {"code": "5.1.02", "name": "Servicios Públicos", "type": "EXPENSE", "parentCode": "5"},
            {"code": "5.1.03", "name": "Impuestos y Tasas", "type": "EXPENSE", "parentCode": "5"},
            {"code": "5.1.04", "name": "Sueldos y Jornales", "type": "EXPENSE", "parentCode": "5"}
        ]
        for c in cuentas:
            await prisma.account.create(data=c)
        print("✅ Plan de cuentas inicializado!")

        # 3. Crear Usuarios Estándar
        # Super Admin
        admin = await prisma.user.create(
            data={
                "email": "administracion@vmp-edtech.com",
                "passwordHash": hash_password("VmpAdmin2026!"),
                "nombre": "Administración",
                "apellido": "VMP",
                "dni": "11111111",
                "rol": "SUPER_ADMIN",
                "activo": True
            }
        )
        # Seed compatibility admin
        await prisma.user.create(
            data={
                "email": "admin@vmpservicios.com",
                "passwordHash": hash_password("VmpAdmin2026!"),
                "nombre": "Administrador",
                "apellido": "VMP",
                "dni": "00000000",
                "rol": "SUPER_ADMIN",
                "activo": True
            }
        )
        # Alumno
        alumno = await prisma.user.create(
            data={
                "email": "gustavo.bravo@vmpedtech.com",
                "passwordHash": hash_password("VmpAlumno2026!"),
                "nombre": "Gustavo",
                "apellido": "Bravo",
                "dni": "22222222",
                "rol": "ALUMNO",
                "activo": True
            }
        )
        print("✅ Usuarios cargados con éxito!")

        # 4. Crear Cursos Fundamentales
        cursos = [
            {
                "nombre": "Manejo Defensivo Livianos",
                "codigo": "MDL-001",
                "descripcion": "Curso teórico-práctico de manejo defensivo para vehículos livianos.",
                "duracionHoras": 20,
                "vigenciaMeses": 24
            },
            {
                "nombre": "Manejo Defensivo Pesados",
                "codigo": "MDP-001",
                "descripcion": "Curso teórico-práctico de manejo defensivo para vehículos pesados y transporte de carga.",
                "duracionHoras": 40,
                "vigenciaMeses": 24
            },
            {
                "nombre": "Primeros Auxilios y RCP",
                "codigo": "PA-001",
                "descripcion": "Capacitación básica en primeros auxilios y reanimación cardiopulmonar.",
                "duracionHoras": 8,
                "vigenciaMeses": 24
            }
        ]
        for curso_data in cursos:
            await prisma.curso.create(data=curso_data)
        print("✅ Cursos cargados con éxito!")

        # 5. Crear la empresa principal VMP S.A.S.
        vmp_company = await prisma.company.create(
            data={
                "nombre": "VMP S.A.S.",
                "cuit": "30-71936908-8",
                "email": "administracion@vmp-edtech.com",
                "direccion": "Juan B. Justo 385 Piso:1 - Neuquen",
                "activa": True
            }
        )
        print("✅ Empresa principal creada!")

        # 6. Insertar Factura de Castillo Mariano Jesus
        compra_castillo = await prisma.compra.create(
            data={
                "proveedor": "CASTILLO MARIANO JESUS",
                "cuit": "20-28066535-6",
                "numero": "0002-00000914",
                "subtotal": 171000.00,
                "iva": 0.00,
                "total": 171000.00,
                "metodoPago": "TRANSFERENCIA",
                "categoria": "SERVICIOS"
            }
        )
        await prisma.compraitem.create(
            data={
                "compraId": compra_castillo.id,
                "descripcion": "Honorarios mensuales (Periodo 04-2026)",
                "cantidad": 1,
                "precioUnit": 171000.00,
                "subtotal": 171000.00
            }
        )

        ac_gastos = await prisma.account.find_unique(where={"code": "5.1.01"})
        ac_banco = await prisma.account.find_unique(where={"code": "1.1.02"})
        
        journal_castillo = await prisma.journalentry.create(
            data={
                "concept": "Honorarios mensuales (Periodo 04-2026) - Castillo Mariano",
                "reference": "Factura C-0002-00000914",
                "type": "PURCHASES"
            }
        )
        await prisma.ledgerentry.create(
            data={
                "journalId": journal_castillo.id,
                "accountId": ac_gastos.id,
                "description": "Gastos Honorarios (Castillo Mariano)",
                "debit": 171000.00,
                "credit": 0.0
            }
        )
        await prisma.ledgerentry.create(
            data={
                "journalId": journal_castillo.id,
                "accountId": ac_banco.id,
                "description": "Pago via Banco (Castillo Mariano)",
                "debit": 0.0,
                "credit": 171000.00
            }
        )

        # 7. Insertar Declaración de IVA F.2051 (Saldo técnico a favor / Crédito Fiscal)
        compra_iva = await prisma.compra.create(
            data={
                "proveedor": "ARCA (ex AFIP)",
                "cuit": "30-71936908-8",
                "numero": "F2051-04-2026",
                "subtotal": 48640.61,
                "iva": 0.00,
                "total": 48640.61,
                "metodoPago": "EFECTIVO",
                "categoria": "IMPUESTOS"
            }
        )
        await prisma.compraitem.create(
            data={
                "compraId": compra_iva.id,
                "descripcion": "IVA Crédito Fiscal (Periodo 04-2026)",
                "cantidad": 1,
                "precioUnit": 48640.61,
                "subtotal": 48640.61
            }
        )
        ac_iva_credito = await prisma.account.find_unique(where={"code": "1.1.05"})
        ac_impuestos = await prisma.account.find_unique(where={"code": "5.1.03"})
        
        journal_iva = await prisma.journalentry.create(
            data={
                "concept": "IVA Crédito Fiscal - Periodo 04-2026",
                "reference": "Transacción 1171187360",
                "type": "GENERAL"
            }
        )
        await prisma.ledgerentry.create(
            data={
                "journalId": journal_iva.id,
                "accountId": ac_iva_credito.id,
                "description": "Crédito Fiscal IVA",
                "debit": 48640.61,
                "credit": 0.0
            }
        )
        await prisma.ledgerentry.create(
            data={
                "journalId": journal_iva.id,
                "accountId": ac_impuestos.id,
                "description": "Registro de Impuestos",
                "debit": 0.0,
                "credit": 48640.61
            }
        )
        
        print("✅ Facturas cargadas y registradas en contabilidad!")

        return {
            "status": "success",
            "message": "Database cleaned and configured successfully with custom invoices and standard credentials!"
        }
    except Exception as e:
        print(f"❌ Error en clean-and-setup: {e}")
        raise HTTPException(status_code=500, detail=str(e))
