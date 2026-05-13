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
    
    # 1. Crear la venta
    venta = await prisma.venta.create(
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
    
    # 2. Generar Asiento Contable Automático
    # Necesitamos IDs de cuentas (esto asume que el Plan de Cuentas existe)
    # Por simplicidad, buscaremos por código
    
    account_ventas = await prisma.account.find_unique(where={"code": "4.1.01"}) # Ventas de Servicios
    account_iva_df = await prisma.account.find_unique(where={"code": "2.1.05"}) # IVA Débito Fiscal
    
    # Cuenta de contrapartida (Caja o Banco)
    if data.metodoPago == "EFECTIVO":
        account_pago = await prisma.account.find_unique(where={"code": "1.1.01"}) # Caja
    else:
        account_pago = await prisma.account.find_unique(where={"code": "1.1.02"}) # Banco
        
    if account_ventas and account_iva_df and account_pago:
        entries = [
            {"accountId": account_pago.id, "debit": data.total, "credit": 0, "description": f"Cobro Venta {data.numero}"},
            {"accountId": account_ventas.id, "debit": 0, "credit": data.subtotal, "description": f"Venta {data.numero}"},
            {"accountId": account_iva_df.id, "debit": 0, "credit": data.iva, "description": f"IVA DF Venta {data.numero}"}
        ]
        
        await prisma.journalentry.create(
            data={
                "concept": f"Venta {data.numero} - {data.companyId}",
                "reference": data.numero,
                "type": "SALES",
                "entries": {
                    "create": entries
                }
            }
        )
        
    return venta

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
    
    compra = await prisma.compra.create(
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
    
    # Lógica de asiento para compras (opcional por ahora)
    return compra

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
        {"code": "2", "name": "PASIVO", "type": "LIABILITY", "isSelectable": False},
        {"code": "2.1.05", "name": "IVA Débito Fiscal", "type": "LIABILITY", "parentCode": "2.1"},
        {"code": "4", "name": "INGRESOS", "type": "REVENUE", "isSelectable": False},
        {"code": "4.1.01", "name": "Ventas de Servicios", "type": "REVENUE", "parentCode": "4"}
    ]
    
    for c in cuentas:
        await prisma.account.upsert(
            where={"code": c["code"]},
            data=c
        )
        
    return {"message": "Plan de cuentas inicial creado"}
