from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from schemas.accounting import (
    AccountResponse, CreateAccountRequest, 
    JournalEntryResponse, CreateJournalEntryRequest,
    VentaResponse, CreateVentaRequest,
    CompraResponse, CreateCompraRequest,
    CajaMovimientoResponse, BalanceRow
)
from auth.dependencies import get_current_user
from core.database import prisma
from datetime import datetime

router = APIRouter()

# --- Plan de Cuentas ---

@router.get("/accounts", response_model=List[AccountResponse])
async def listar_cuentas(current_user=Depends(get_current_user)):
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
    return await prisma.account.find_many(order={"code": "asc"})

@router.post("/accounts", response_model=AccountResponse)
async def crear_cuenta(data: CreateAccountRequest, current_user=Depends(get_current_user)):
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
    return await prisma.account.create(data=data.dict())

# --- Libro Diario ---

@router.get("/journal", response_model=List[JournalEntryResponse])
async def listar_asientos(current_user=Depends(get_current_user)):
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
    return await prisma.journalentry.find_many(include={"entries": True}, order={"date": "desc"})

# --- Ventas ---

@router.post("/ventas", response_model=VentaResponse)
async def registrar_venta(data: CreateVentaRequest, current_user=Depends(get_current_user)):
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # 1. Validar que las cuentas contables existan ANTES de empezar la transacción
    account_ventas = await prisma.account.find_unique(where={"code": "4.1.01"}) # Ventas de Servicios
    account_iva_df = await prisma.account.find_unique(where={"code": "2.1.05"}) # IVA Débito Fiscal
    
    # Cuenta de contrapartida (Caja o Banco)
    pago_code = "1.1.01" if data.metodoPago == "EFECTIVO" else "1.1.02"
    account_pago = await prisma.account.find_unique(where={"code": pago_code})
    
    if not all([account_ventas, account_iva_df, account_pago]):
        missing = []
        if not account_ventas: missing.append("4.1.01")
        if not account_iva_df: missing.append("2.1.05")
        if not account_pago: missing.append(pago_code)
        raise HTTPException(
            status_code=400, 
            detail=f"Faltan cuentas contables configuradas: {', '.join(missing)}. Por favor, ejecute el seed de contabilidad."
        )

    # 2. Iniciar Transacción
    try:
        # Nota: Usamos una transacción para asegurar que la venta y el asiento se creen juntos
        async with prisma.tx() as transaction:
            # A. Crear la venta
            venta = await transaction.venta.create(
                data={
                    "numero": data.numero,
                    "fecha": data.fecha,
                    "companyId": data.companyId,
                    "condicionIva": data.condicionIva,
                    "subtotal": data.subtotal,
                    "iva": data.iva,
                    "percepciones": data.percepciones,
                    "total": data.total,
                    "metodoPago": data.metodoPago,
                    "estado": data.estado,
                    "items": {
                        "create": [item.dict() for item in data.items]
                    }
                },
                include={"items": True}
            )
            
            # B. Generar Asiento
            company = await transaction.company.find_unique(where={"id": data.companyId})
            company_name = company.nombre if company else data.companyId
            
            entries = [
                {"accountId": account_pago.id, "debit": data.total, "credit": 0, "description": f"Cobro Venta {data.numero}"},
                {"accountId": account_ventas.id, "debit": 0, "credit": data.subtotal, "description": f"Venta {data.numero}"},
                {"accountId": account_iva_df.id, "debit": 0, "credit": data.iva, "description": f"IVA DF Venta {data.numero}"}
            ]
            
            # Agregar percepciones si existen
            if data.percepciones > 0:
                # Usamos una cuenta genérica de pasivo por ahora o ajustamos contra Ventas
                entries.append({"accountId": account_iva_df.id, "debit": 0, "credit": data.percepciones, "description": f"Percepciones Venta {data.numero}"})

            await transaction.journalentry.create(
                data={
                    "concept": f"Venta {data.numero} - {company_name}",
                    "reference": data.numero,
                    "type": "SALES",
                    "entries": {
                        "create": entries
                    }
                }
            )
            
            return venta
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar venta: {str(e)}")

@router.get("/ventas", response_model=List[VentaResponse])
async def listar_ventas(current_user=Depends(get_current_user)):
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
    return await prisma.venta.find_many(include={"items": True}, order={"fecha": "desc"})

# --- Compras ---

@router.post("/compras", response_model=CompraResponse)
async def registrar_compra(data: CreateCompraRequest, current_user=Depends(get_current_user)):
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # 1. Validar cuentas
    account_iva_cf = await prisma.account.find_unique(where={"code": "1.1.05"}) # IVA Crédito Fiscal
    gasto_code = "5.1.01" # Otros Gastos por defecto
    if data.categoria == "SERVICIOS": gasto_code = "5.1.02"
    elif data.categoria == "IMPUESTOS": gasto_code = "5.1.03"
    elif data.categoria == "SUELDOS": gasto_code = "5.1.04"
    
    account_gasto = await prisma.account.find_unique(where={"code": gasto_code})
    pago_code = "1.1.01" if data.metodoPago == "EFECTIVO" else "1.1.02"
    account_pago = await prisma.account.find_unique(where={"code": pago_code})
    
    if not all([account_gasto, account_pago]):
        raise HTTPException(status_code=400, detail="Faltan cuentas contables de egresos configuradas.")

    try:
        async with prisma.tx() as transaction:
            compra = await transaction.compra.create(
                data={
                    "proveedor": data.proveedor,
                    "cuit": data.cuit,
                    "numero": data.numero,
                    "fecha": data.fecha,
                    "subtotal": data.subtotal,
                    "iva": data.iva,
                    "percepciones": data.percepciones,
                    "total": data.total,
                    "metodoPago": data.metodoPago,
                    "categoria": data.categoria,
                    "items": {
                        "create": [item.dict() for item in data.items]
                    }
                },
                include={"items": True}
            )
            
            entries = [
                {"accountId": account_gasto.id, "debit": data.subtotal, "credit": 0, "description": f"Gasto {data.categoria} - {data.proveedor}"},
                {"accountId": account_pago.id, "debit": 0, "credit": data.total, "description": f"Pago Compra {data.numero}"}
            ]
            
            if data.iva > 0 and account_iva_cf:
                entries.append({"accountId": account_iva_cf.id, "debit": data.iva, "credit": 0, "description": f"IVA CF Compra {data.numero}"})
                
            await transaction.journalentry.create(
                data={
                    "concept": f"Compra {data.numero} - {data.proveedor}",
                    "reference": data.numero,
                    "type": "PURCHASES",
                    "entries": {
                        "create": entries
                    }
                }
            )
            return compra
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar compra: {str(e)}")

@router.get("/compras", response_model=List[CompraResponse])
async def listar_compras(current_user=Depends(get_current_user)):
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
    return await prisma.compra.find_many(include={"items": True}, order={"fecha": "desc"})

# --- Reportes ---

@router.get("/reports/balance", response_model=List[BalanceRow])
async def obtener_balance(current_user=Depends(get_current_user)):
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
        
    accounts = await prisma.account.find_many(include={"ledgerEntries": True}, order={"code": "asc"})
    
    result = []
    for acc in accounts:
        debit = sum(e.debit for e in acc.ledgerEntries)
        credit = sum(e.credit for e in acc.ledgerEntries)
        
        # Calcular saldo según tipo de cuenta
        if acc.type in ["ASSET", "EXPENSE"]:
            balance = debit - credit
        else:
            balance = credit - debit
            
        result.append(BalanceRow(
            accountCode=acc.code,
            accountName=acc.name,
            debit=debit,
            credit=credit,
            balance=balance
        ))
        
    return result

# --- Inicialización ---

@router.post("/seed")
async def seed_accounting(current_user=Depends(get_current_user)):
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
        
    # Plan de cuentas básico
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
        await prisma.account.upsert(
            where={"code": c["code"]},
            data=c
        )
        
    return {"message": "Plan de cuentas inicial creado"}
