from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Request
import re
import io
import os
import json
from pypdf import PdfReader
from typing import List, Optional
from schemas.accounting import (
    AccountResponse, CreateAccountRequest, 
    JournalEntryResponse, CreateJournalEntryRequest,
    CreateManualJournalEntryRequest,
    VentaResponse, CreateVentaRequest,
    CompraResponse, CreateCompraRequest,
    CajaMovimientoResponse, BalanceRow
)
from auth.dependencies import get_current_user, RequireRole
from core.database import prisma
from datetime import datetime
from services.webhook_service import emit, WebhookEvent
from services.audit_service import log_audit_action

router = APIRouter(dependencies=[Depends(RequireRole(["SUPER_ADMIN", "CONTADOR"]))])

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
    return await prisma.account.create(data=data.model_dump())

# --- Libro Diario ---

@router.get("/journal", response_model=List[JournalEntryResponse])
async def listar_asientos(desde: Optional[str] = None, hasta: Optional[str] = None, current_user=Depends(get_current_user)):
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    where_clause = {}
    if desde or hasta:
        where_clause["date"] = {}
        if desde:
            try:
                where_clause["date"]["gte"] = datetime.strptime(f"{desde} 00:00:00", "%Y-%m-%d %H:%M:%S")
            except ValueError:
                raise HTTPException(status_code=400, detail="Formato 'desde' inválido. Debe ser YYYY-MM-DD")
        if hasta:
            try:
                where_clause["date"]["lte"] = datetime.strptime(f"{hasta} 23:59:59", "%Y-%m-%d %H:%M:%S")
            except ValueError:
                raise HTTPException(status_code=400, detail="Formato 'hasta' inválido. Debe ser YYYY-MM-DD")

    return await prisma.journalentry.find_many(
        where=where_clause,
        include={
            "entries": {
                "include": {
                    "account": True
                }
            }
        }, 
        order={"date": "desc"}
    )

@router.post("/journal", response_model=JournalEntryResponse)
async def crear_asiento_manual(request: Request, data: CreateManualJournalEntryRequest, current_user=Depends(get_current_user)):
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # 1. Validar partida doble: Suma Debe == Suma Haber
    suma_debe = sum(entry.debit for entry in data.entries)
    suma_haber = sum(entry.credit for entry in data.entries)
    
    # Tolerancia de decimales (centavos)
    if abs(suma_debe - suma_haber) > 0.01:
        raise HTTPException(
            status_code=400,
            detail=f"El asiento contable no balancea. Suma Debe (${suma_debe:,.2f}) debe ser igual a Suma Haber (${suma_haber:,.2f}). Diferencia: ${abs(suma_debe - suma_haber):,.2f}"
        )
    
    # 2. Validar que al menos haya 2 movimientos y que los montos sean válidos
    if len(data.entries) < 2:
        raise HTTPException(status_code=400, detail="Un asiento contable debe tener al menos dos movimientos (partidas).")
        
    for entry in data.entries:
        if entry.debit < 0 or entry.credit < 0:
            raise HTTPException(status_code=400, detail="Los importes del Debe y Haber no pueden ser negativos.")
        if entry.debit > 0 and entry.credit > 0:
            raise HTTPException(status_code=400, detail="Un movimiento individual no puede registrar Debe y Haber al mismo tiempo.")
        if entry.debit == 0 and entry.credit == 0:
            raise HTTPException(status_code=400, detail="Cada movimiento debe tener un importe mayor a cero en el Debe o en el Haber.")

    # 3. Validar cuentas existentes
    account_ids = [entry.accountId for entry in data.entries]
    db_accounts = await prisma.account.find_many(where={"id": {"in": account_ids}})
    db_account_ids = {acc.id for acc in db_accounts}
    
    missing_accounts = [acc_id for acc_id in account_ids if acc_id not in db_account_ids]
    if missing_accounts:
        raise HTTPException(status_code=400, detail=f"Las siguientes cuentas contables no existen: {', '.join(missing_accounts)}")

    # 4. Crear Asiento dentro de una transacción robusta de Prisma
    try:
        asiento_date = data.date or datetime.now()
        async with prisma.tx() as transaction:
            asiento = await transaction.journalentry.create(
                data={
                    "concept": data.concept,
                    "reference": data.reference,
                    "type": "GENERAL",
                    "date": asiento_date,
                    "entries": {
                        "create": [
                            {
                                "accountId": entry.accountId,
                                "description": entry.description,
                                "debit": entry.debit,
                                "credit": entry.credit
                            } for entry in data.entries
                        ]
                    }
                },
                include={
                    "entries": {
                        "include": {
                            "account": True
                        }
                    }
                }
            )
            
            # Log audit
            request_id = getattr(request.state, "request_id", "N/A")
            ip_address = request.client.host if request.client else "N/A"
            await log_audit_action(
                action="JOURNAL_MANUAL_ENTRY_CREATE",
                user_id=current_user.id,
                user_email=current_user.email,
                details=f"Asiento manual registrado: '{data.concept}' (Ref: {data.reference or 'N/A'}). Partidas: {len(data.entries)}. Total: ${suma_debe:,.2f} ARS.",
                ip_address=ip_address,
                request_id=request_id
            )
            
            return asiento
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar el asiento contable: {str(e)}")

@router.get("/journal/accounts/{code}")
async def listar_mayor_cuenta(code: str, desde: Optional[str] = None, hasta: Optional[str] = None, current_user=Depends(get_current_user)):
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
        
    # 1. Buscar la cuenta
    account = await prisma.account.find_unique(where={"code": code})
    if not account:
        raise HTTPException(status_code=404, detail=f"Cuenta contable con código {code} no encontrada.")
        
    # 2. Filtrar movimientos
    where_clause = {
        "accountId": account.id
    }
    
    # Filtrar por la fecha del asiento padre
    date_filter = {}
    if desde:
        try:
            date_filter["gte"] = datetime.strptime(f"{desde} 00:00:00", "%Y-%m-%d %H:%M:%S")
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato 'desde' inválido. Debe ser YYYY-MM-DD")
    if hasta:
        try:
            date_filter["lte"] = datetime.strptime(f"{hasta} 23:59:59", "%Y-%m-%d %H:%M:%S")
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato 'hasta' inválido. Debe ser YYYY-MM-DD")
            
    if date_filter:
        where_clause["journal"] = {
            "is": {
                "date": date_filter
            }
        }
        
    # 3. Consultar los movimientos en orden cronológico del asiento
    ledger_entries = await prisma.ledgerentry.find_many(
        where=where_clause,
        include={
            "journal": True,
            "account": True
        },
        order=[
            {"journal": {"date": "asc"}},
            {"createdAt": "asc"}
        ]
    )
    
    # 4. Formatear la respuesta con balance dinámico
    movimientos = []
    saldo_acumulado = 0.0
    
    for entry in ledger_entries:
        # Calcular según el tipo de cuenta
        if account.type in ["ASSET", "EXPENSE"]:
            saldo_acumulado += (entry.debit - entry.credit)
        else:
            saldo_acumulado += (entry.credit - entry.debit)
            
        movimientos.append({
            "id": entry.id,
            "date": entry.journal.date,
            "concept": entry.journal.concept,
            "reference": entry.journal.reference,
            "type": entry.journal.type,
            "description": entry.description or entry.journal.concept,
            "debit": entry.debit,
            "credit": entry.credit,
            "balance": saldo_acumulado
        })
        
    return {
        "account": {
            "id": account.id,
            "code": account.code,
            "name": account.name,
            "type": account.type
        },
        "balance": saldo_acumulado,
        "entries": movimientos
    }

# --- Ventas ---

@router.post("/ventas", response_model=VentaResponse)
async def registrar_venta(request: Request, data: CreateVentaRequest, current_user=Depends(get_current_user)):
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
                        "create": [item.model_dump() for item in data.items]
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
            
            # Log audit
            request_id = getattr(request.state, "request_id", "N/A")
            ip_address = request.client.host if request.client else "N/A"
            await log_audit_action(
                action="INVOICE_SALE_CREATE",
                user_id=current_user.id,
                user_email=current_user.email,
                details=f"Venta registrada: Nro {data.numero} por un total de ${data.total:.2f} ARS.",
                ip_address=ip_address,
                request_id=request_id
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
        
@router.delete("/ventas/{id}")
async def eliminar_venta(request: Request, id: str, current_user=Depends(get_current_user)):
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # 1. Buscar la venta
    venta = await prisma.venta.find_unique(where={"id": id})
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
        
    # 2. Eliminar el asiento contable asociado si existe (usamos el numero como referencia)
    journal_entry = await prisma.journalentry.find_first(where={"reference": venta.numero})
    if journal_entry:
        await prisma.journalentry.delete(where={"id": journal_entry.id})
        
    # 3. Eliminar la venta (los items se borran en cascada)
    # Log audit
    request_id = getattr(request.state, "request_id", "N/A")
    ip_address = request.client.host if request.client else "N/A"
    await log_audit_action(
        action="INVOICE_SALE_DELETE",
        user_id=current_user.id,
        user_email=current_user.email,
        details=f"Venta eliminada: Nro {venta.numero} por un total de ${venta.total:.2f} ARS.",
        ip_address=ip_address,
        request_id=request_id
    )
    
    await prisma.venta.delete(where={"id": id})
    return {"message": "Venta eliminada exitosamente"}

@router.delete("/compras/{id}")
async def eliminar_compra(request: Request, id: str, current_user=Depends(get_current_user)):
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    compra = await prisma.compra.find_unique(where={"id": id})
    if not compra:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
        
    # Intentar eliminar el asiento usando el CUIT o Numero como referencia si existe
    if compra.numero:
        journal_entry = await prisma.journalentry.find_first(where={"reference": compra.numero})
        if journal_entry:
            await prisma.journalentry.delete(where={"id": journal_entry.id})
            
    # Log audit
    request_id = getattr(request.state, "request_id", "N/A")
    ip_address = request.client.host if request.client else "N/A"
    await log_audit_action(
        action="INVOICE_PURCHASE_DELETE",
        user_id=current_user.id,
        user_email=current_user.email,
        details=f"Compra eliminada: {compra.proveedor} (Total: ${compra.total:.2f} ARS).",
        ip_address=ip_address,
        request_id=request_id
    )
    
    await prisma.compra.delete(where={"id": id})
    return {"message": "Compra eliminada exitosamente"}

@router.post("/compras", response_model=CompraResponse)
async def registrar_compra(request: Request, data: CreateCompraRequest, current_user=Depends(get_current_user)):
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
                        "create": [item.model_dump() for item in data.items]
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
            # ── Disparar evento invoice.processed hacia n8n ──
            await emit(WebhookEvent.INVOICE_PROCESSED, {
                "compra_id":   compra.id,
                "proveedor":   data.proveedor,
                "numero":      data.numero,
                "total":       data.total,
                "categoria":   data.categoria,
                "metodoPago":  data.metodoPago,
                "fecha":       data.fecha.isoformat() if data.fecha else None,
                "registrado_por": current_user.email,
            })
            # Log audit
            request_id = getattr(request.state, "request_id", "N/A")
            ip_address = request.client.host if request.client else "N/A"
            await log_audit_action(
                action="INVOICE_PURCHASE_CREATE",
                user_id=current_user.id,
                user_email=current_user.email,
                details=f"Compra registrada: {data.proveedor} (Total: ${data.total:.2f} ARS).",
                ip_address=ip_address,
                request_id=request_id
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
        
        # --- EXTRACCIÓN DE TEXTO LOCAL (Ultra rápida) ---
        pdf_file = io.BytesIO(contents)
        full_text = ""
        try:
            import pdfplumber
            with pdfplumber.open(pdf_file) as pdf:
                for page in pdf.pages:
                    text = page.extract_text(layout=True)
                    if text:
                        full_text += text + "\n"
        except ImportError:
            from pypdf import PdfReader
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                full_text += page.extract_text() or ""
                
        # --- OPCION A: EXTRACTION CON GOOGLE GEMINI AI ---
        gemini_key = os.environ.get("GEMINI_API_KEY")
        if gemini_key:
            try:
                import google.generativeai as genai
                
                genai.configure(api_key=gemini_key)
                model = genai.GenerativeModel('gemini-2.5-flash')
                prompt = f"""
                Eres un auditor contable experto. Tu única tarea es extraer los datos reales de esta factura a partir del documento adjunto o del texto proporcionado.
                REGLA CRÍTICA DE ORO: ¡NO INVENTES NINGÚN DATO! Si un dato no está explícitamente en el documento, usa un string vacío "" (o 0 para números). NUNCA uses nombres genéricos como "Librería" o "Proveedor" si no aparecen.
                
                Extrae los datos en este formato JSON exacto:
                {{
                    "proveedor": "Nombre o Razón Social exacta del emisor",
                    "cuit": "CUIT del emisor con guiones (XX-XXXXXXXX-X)",
                    "numero": "Punto de Venta y Número (Ej: 00001-00001234)",
                    "fecha": "Fecha en formato YYYY-MM-DD",
                    "subtotal": Importe Neto Gravado (Float, usa 0 si no existe),
                    "iva": Total de impuestos IVA (Float, usa 0 si no existe),
                    "total": Importe Total de la factura (Float, usa 0 si no existe),
                    "categoria": Clasifica obligatoriamente como "SERVICIOS", "IMPUESTOS", "SUELDOS" u "OTROS",
                    "metodoPago": "TRANSFERENCIA" o "EFECTIVO",
                    "items": [
                        {{
                            "descripcion": "Descripción exacta del artículo o servicio",
                            "cantidad": Numero Float,
                            "precioUnit": Numero Float,
                            "subtotal": Numero Float
                        }}
                    ]
                }}
                IMPORTANTE: Extrae TODOS los ítems detallados de la factura dentro del array 'items'. Si no hay ítems detallados, devuelve un array vacío [].
                """
                
                # OPTIMIZACIÓN DE VELOCIDAD: Si el PDF es digital (tiene texto), enviamos texto.
                # Esto evita el costoso OCR multimodal de Gemini que demora 4-6 segundos extra.
                if len(full_text.strip()) > 100:
                    payload = [
                        f"TEXTO EXTRAÍDO DE LA FACTURA:\n\n{full_text}",
                        prompt
                    ]
                else:
                    # Fallback para imágenes/facturas escaneadas (usa multimodal OCR)
                    payload = [
                        {"mime_type": "application/pdf", "data": contents},
                        prompt
                    ]
                
                response = model.generate_content(
                    payload,
                    generation_config=genai.types.GenerationConfig(
                        response_mime_type="application/json"
                    )
                )
                json_str = response.text.strip()
                data = json.loads(json_str)
                # Validaciones básicas del output de Gemini
                if "proveedor" in data and "items" in data:
                    return data
            except Exception as e:
                import traceback
                error_trace = traceback.format_exc()
                print(f"Error procesando con Gemini AI/MarkItDown: {error_trace}")
                raise HTTPException(status_code=500, detail=f"Error AI: {str(e)}")
        
        # --- OPCION B: EXTRACTION TRADICIONAL (FALLBACK LOCAL MANUAL) ---
        # El PDF ya fue leído en full_text al inicio.
            
        # Parse CUIT
        cuit_match = re.search(r'\b(20|23|24|27|30|33)-?(\d{8})-?(\d)\b', full_text)
        cuit = ""
        if cuit_match:
            cuit = f"{cuit_match.group(1)}-{cuit_match.group(2)}-{cuit_match.group(3)}"
            
        # Parse Invoice Number (AFIP specific Pt Vta + Comp Nro or standard fallback)
        num_match = re.search(r'(?:Punto de Venta|Pt\. Vta|Vta)[:\s]*(\d{4,5})\s*(?:Comp\.?\s*Nro|Nro|N°|Nro\.?|Comp\.?|Nro\. Comprobante)[:\s]*(\d{8})', full_text, re.IGNORECASE)
        numero = ""
        if num_match:
            numero = f"{num_match.group(1).zfill(5)}-{num_match.group(2)}"
        else:
            num_match_fallback = re.search(r'\b(\d{4,5})[ -](\d{8})\b', full_text)
            if num_match_fallback:
                numero = f"{num_match_fallback.group(1).zfill(5)}-{num_match_fallback.group(2)}"
            
        # Parse Date (DD/MM/YYYY)
        date_match = re.search(r'\b(\d{2})[/-](\d{2})[/-](\d{4})\b', full_text)
        fecha = datetime.now().strftime("%Y-%m-%d")
        if date_match:
            day, month, year = date_match.groups()
            fecha = f"{year}-{month}-{day}"
            
        # Extract Items from Table (AFIP standard format)
        # Usually looks like: Código  Producto/Servicio  Cantidad  U.Medida  Precio Unit.  % Bonf  Subtotal
        items_extraidos = []
        lines = [l.strip() for l in full_text.split('\n') if l.strip()]
        
        in_table = False
        for i, line in enumerate(lines):
            # Detectar el inicio de la tabla de items
            line_lower = line.lower()
            if "producto/servicio" in line_lower or "descripción" in line_lower or "codigo" in line_lower:
                in_table = True
                continue
            
            # Si estamos en la tabla y encontramos "Subtotal" o "Importe Otros Tributos", la tabla terminó
            if in_table and ("subtotal" in line_lower and "importe" not in line_lower.replace(" ", "")):
                # Algunos PDFs de AFIP dicen "Subtotal: $ xxx", pero si empieza con Subtotal, probablemente terminamos
                if line_lower.startswith("subtotal"):
                    in_table = False
                    continue
            if in_table and ("importe otros tributos" in line_lower or "importe neto gravado" in line_lower or "iva" in line_lower):
                in_table = False
                continue

            if in_table:
                # Buscar filas que tengan formato de ítem: texto largo seguido de varios números separados por espacios
                # Ejemplo AFIP: 1  Limpieza oficina  1,00  unidades  1000,00  0,00  1000,00
                # Regex busca: [Cantidad (opcional)] [Descripcion] [Cantidad] [Precio] [Subtotal]
                # Por simplicidad, buscaremos una línea que termine con importes (números con decimales)
                importes = re.findall(r'\b\d{1,3}(?:\.\d{3})*,\d{2}\b|\b\d+\.\d{2}\b', line)
                
                if len(importes) >= 2: # Al menos Precio Unitario y Subtotal
                    # Extraer el último importe como subtotal, y el antepenúltimo o penúltimo como precio
                    subt_str = importes[-1]
                    precio_str = importes[-2] if len(importes) > 2 else importes[0]
                    
                    subt = clean_amount(subt_str)
                    precio = clean_amount(precio_str)
                    
                    # Tratar de encontrar la cantidad (usualmente un número entero o decimal pequeño)
                    cant_match = re.search(r'\b(\d+(?:[,.]\d{1,2})?)\s+(?:unidades|u|kg|lts|hs|horas)?\s+'+re.escape(precio_str), line, re.IGNORECASE)
                    cantidad = 1.0
                    if cant_match:
                        cantidad = clean_amount(cant_match.group(1))
                    else:
                        # Si subtotal > precio, inferir cantidad
                        if precio > 0 and subt > precio:
                            cantidad = round(subt / precio, 2)

                    # La descripción suele ser todo el texto al principio de la línea antes de los números
                    # Quitamos todos los importes encontrados
                    desc = line
                    for imp in importes:
                        desc = desc.replace(imp, "")
                    # Limpiamos unidades y códigos de barras si existen
                    desc = re.sub(r'\b(unidades|u|kg|lts|hs|horas)\b', '', desc, flags=re.IGNORECASE)
                    desc = re.sub(r'^[A-Z0-9-]+\s+', '', desc) # Quitar código al inicio
                    desc = re.sub(r'\d+(?:[,.]\d+)?', '', desc) # Quitar otros números sueltos
                    desc = re.sub(r'\s+', ' ', desc).strip()
                    
                    if len(desc) < 3:
                        desc = "Artículo/Servicio"

                    items_extraidos.append({
                        "descripcion": desc,
                        "cantidad": cantidad,
                        "precioUnit": precio,
                        "subtotal": subt
                    })

        # Calculate Totals
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

        # Check if items matched anything, if not fallback to subtotal
        if not items_extraidos:
            if subtotal == 0.0:
                subtotal = total
            items_extraidos = [{
                "descripcion": "Carga rápida desde factura PDF",
                "cantidad": 1,
                "precioUnit": subtotal,
                "subtotal": subtotal
            }]
        else:
            # Reconcile subtotal if we extracted items
            calc_subtotal = sum(float(i.get("subtotal", 0.0)) for i in items_extraidos)
            if subtotal == 0.0:
                subtotal = calc_subtotal
            if total == 0.0:
                total = subtotal + iva

        # Parse Provider Name
        proveedor = ""
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
        full_text_lower = full_text.lower()
        if any(k in full_text_lower for k in ["honorarios", "servicios", "abono", "asesoramiento", "mensual", "alquiler", "limpieza", "seguridad"]):
            categoria = "SERVICIOS"
        elif any(k in full_text_lower for k in ["impuesto", "tasa", "afip", "rentas", "iibb", "municipalidad"]):
            categoria = "IMPUESTOS"
        elif any(k in full_text_lower for k in ["sueldo", "recibo", "jornal", "sac", "vacaciones"]):
            categoria = "SUELDOS"
            
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
            "items": items_extraidos
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
    
    created = 0
    for c in cuentas:
        existing = await prisma.account.find_unique(where={"code": c["code"]})
        if not existing:
            # Set level based on code depth
            code_parts = c["code"].split(".")
            c["level"] = len(code_parts)
            await prisma.account.create(data=c)
            created += 1
        
    return {"message": f"Plan de cuentas inicial creado. {created} cuentas nuevas agregadas."}
