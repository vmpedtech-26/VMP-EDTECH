from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
import re
import io
from pypdf import PdfReader
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

def clean_amount(val_str: str) -> float:
    val_str = val_str.strip()
    if re.search(r',\d{2}$', val_str):
        val_str = val_str.replace(".", "").replace(",", ".")
    elif re.search(r'\.\d{2}$', val_str):
        if "," in val_str:
            val_str = val_str.replace(",", "")
    else:
        if "." in val_str and "," in val_str:
            if val_str.find(",") > val_str.find("."):
                val_str = val_str.replace(".", "").replace(",", ".")
            else:
                val_str = val_str.replace(",", "")
        elif "," in val_str:
            parts = val_str.split(",")
            if len(parts[-1]) != 3:
                val_str = val_str.replace(",", ".")
            else:
                val_str = val_str.replace(",", "")
    try:
        return float(val_str)
    except ValueError:
        return 0.0

@router.post("/compras/upload-pdf")
async def upload_compra_pdf(file: UploadFile = File(...), current_user=Depends(get_current_user)):
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
        
    try:
        contents = await file.read()
        pdf_file = io.BytesIO(contents)
        reader = PdfReader(pdf_file)
        
        # Extract text from all pages
        full_text = ""
        for page in reader.pages:
            full_text += page.extract_text() or ""
            
        # Parse CUIT
        cuit_match = re.search(r'\b(20|23|24|27|30|33)-?(\d{8})-?(\d)\b', full_text)
        cuit = ""
        if cuit_match:
            cuit = f"{cuit_match.group(1)}-{cuit_match.group(2)}-{cuit_match.group(3)}"
            
        # Parse Invoice Number (AFIP specific Pt Vta + Comp Nro or standard fallback)
        num_match = re.search(r'(?:Punto de Venta|Pt\. Vta|Vta)[:\s]*(\d{4,5})\s*(?:Comp\.?\s*Nro|Nro|N°|Nro\.?|Comp\.?|Nro\. Comprobante)[:\s]*(\d{8})', full_text, re.IGNORECASE)
        numero = ""
        if num_match:
            numero = f"{num_match.group(1)}-{num_match.group(2)}"
        else:
            num_match_fallback = re.search(r'\b(\d{4,5})[ -](\d{8})\b', full_text)
            if num_match_fallback:
                numero = f"{num_match_fallback.group(1)}-{num_match_fallback.group(2)}"
            
        # Parse Date (DD/MM/YYYY)
        date_match = re.search(r'\b(\d{2})[/-](\d{2})[/-](\d{4})\b', full_text)
        fecha = datetime.now().strftime("%Y-%m-%d")
        if date_match:
            day, month, year = date_match.groups()
            fecha = f"{year}-{month}-{day}"
            
        # Parse Totals
        total = 0.0
        subtotal = 0.0
        iva = 0.0
        
        # Look for Total amount
        total_patterns = [
            r'(?:Importe Total|Total|TOTAL|Total Facturado)(?:\s*[:$]?\s*)(\d{1,3}(?:\.\d{3})*(?:,\d{2}))',
            r'(?:Importe Total|Total|TOTAL|Total Facturado)(?:\s*[:$]?\s*)(\d+[,.]\d{2})',
            r'TOTAL\s+\$?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2}))',
            r'Importe Total\s+\$?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2}))',
        ]
        
        for p in total_patterns:
            matches = re.findall(p, full_text, re.IGNORECASE)
            if matches:
                total = clean_amount(matches[-1])
                break
                    
        # Look for Subtotal (Net Amount)
        subtotal_patterns = [
            r'(?:Importe Neto Gravado|Neto Gravado|Neto|Subtotal)(?:\s*[:$]?\s*)(\d{1,3}(?:\.\d{3})*(?:,\d{2}))',
            r'(?:Importe Neto Gravado|Neto Gravado|Neto|Subtotal)(?:\s*[:$]?\s*)(\d+[,.]\d{2})',
            r'Neto\s+\$?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2}))',
        ]
        
        for p in subtotal_patterns:
            matches = re.findall(p, full_text, re.IGNORECASE)
            if matches:
                subtotal = clean_amount(matches[-1])
                break
                    
        if subtotal == 0.0 and total > 0.0:
            subtotal = total
            
        # Calculate/find IVA
        iva_patterns = [
            r'(?:IVA\s*(?:21|10\.5|27)%\s*:?\s*\$?)\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2}))',
            r'(?:IVA\s*(?:21|10\.5|27)%\s*:?\s*\$?)\s*(\d+[,.]\d{2})',
        ]
        for p in iva_patterns:
            matches = re.findall(p, full_text, re.IGNORECASE)
            if matches:
                iva = clean_amount(matches[-1])
                break
                    
        # Parse Provider Name
        proveedor = ""
        lines = [l.strip() for l in full_text.split('\n') if l.strip()]
        
        for line in lines:
            if "Razón Social:" in line or "Razon Social:" in line:
                proveedor = line.split(":", 1)[1].strip()
                break
                
        if not proveedor and len(lines) > 0:
            for line in lines:
                if "Razón Social:" in line or "Razon Social:" in line or "Nombre / Razón Social" in line or "Nombre/Razón Social" in line:
                    parts = line.split(":")
                    if len(parts) > 1:
                        proveedor = parts[-1].strip()
                        break
                        
        if not proveedor and len(lines) > 0:
            for l in lines[:5]:
                if not any(k in l.lower() for k in ["factura", "cuit", "fecha", "punto de venta", "pág", "pag", "original", "duplicado", "comprobante"]):
                    proveedor = l
                    break
                    
        if not proveedor:
            proveedor = "Proveedor Desconocido"
            
        if cuit and cuit in proveedor:
            proveedor = proveedor.replace(cuit, "").strip()
        proveedor = re.sub(r'\s+', ' ', proveedor).strip()
        proveedor = proveedor.replace("Apellido y Nombre /", "").replace("Razón Social:", "").replace("Razon Social:", "").strip()
        
        # Determine category based on keywords
        categoria = "OTROS"
        if any(k in full_text.lower() for k in ["honorarios", "servicios", "abono", "asesoramiento", "mensual", "alquiler"]):
            categoria = "SERVICIOS"
        elif any(k in full_text.lower() for k in ["impuesto", "tasa", "afip", "rentas", "iibb", "municipalidad"]):
            categoria = "IMPUESTOS"
        elif any(k in full_text.lower() for k in ["sueldo", "recibo", "jornal", "sac", "vacaciones"]):
            categoria = "SUELDOS"
            
        item_desc = "Carga rápida desde factura PDF"
        if categoria == "SERVICIOS":
            item_desc = "Servicios profesionales / honorarios"
        elif categoria == "IMPUESTOS":
            item_desc = "Tasa / Impuesto nacional o provincial"
            
        items = [{
            "descripcion": item_desc,
            "cantidad": 1,
            "precioUnit": subtotal,
            "subtotal": subtotal
        }]
        
        return {
            "proveedor": proveedor,
            "cuit": cuit,
            "numero": numero,
            "fecha": fecha,
            "subtotal": subtotal,
            "iva": iva,
            "total": total,
            "categoria": categoria,
            "metodoPago": "TRANSFERENCIA" if categoria == "SERVICIOS" else "EFECTIVO",
            "items": items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar PDF de factura: {str(e)}")

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
