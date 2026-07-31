from pydantic import BaseModel, Field
from core.security_utils import SanitizedBaseModel
from typing import List, Optional
from datetime import datetime

# --- Plan de Cuentas ---
class AccountBase(SanitizedBaseModel):
    code: str
    name: str
    type: str # ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    parentCode: Optional[str] = None
    level: int = 1
    isSelectable: bool = True

class AccountResponse(AccountBase):
    id: str
    createdAt: datetime
    updatedAt: datetime

class CreateAccountRequest(AccountBase):
    pass

# --- Libro Diario / Mayor ---
class LedgerEntryBase(SanitizedBaseModel):
    accountId: str
    description: Optional[str] = None
    debit: float = 0.0
    credit: float = 0.0

class LedgerEntryResponse(LedgerEntryBase):
    id: str
    journalId: str
    createdAt: datetime
    account: Optional[AccountResponse] = None

class JournalEntryBase(SanitizedBaseModel):
    date: datetime = Field(default_factory=datetime.now)
    concept: str
    reference: Optional[str] = None
    type: str = "GENERAL"

class CreateJournalEntryRequest(JournalEntryBase):
    entries: List[LedgerEntryBase]

class CreateManualJournalEntryRequest(SanitizedBaseModel):
    date: Optional[datetime] = None
    concept: str
    reference: Optional[str] = None
    entries: List[LedgerEntryBase]

class JournalEntryResponse(JournalEntryBase):
    id: str
    entries: List[LedgerEntryResponse]
    createdAt: datetime

# --- Ventas ---
class VentaItemBase(SanitizedBaseModel):
    descripcion: str
    cantidad: int
    precioUnit: float
    subtotal: float

class VentaBase(SanitizedBaseModel):
    numero: str
    fecha: datetime = Field(default_factory=datetime.now)
    companyId: str
    condicionIva: str = "RI"
    subtotal: float
    iva: float
    percepciones: float = 0.0
    total: float
    metodoPago: str = "TRANSFERENCIA"
    estado: str = "PENDIENTE"

class CreateVentaRequest(VentaBase):
    items: List[VentaItemBase]

class VentaResponse(VentaBase):
    id: str
    items: List[VentaItemBase]
    createdAt: datetime

# --- Compras ---
class CompraItemBase(SanitizedBaseModel):
    descripcion: str
    cantidad: int
    precioUnit: float
    subtotal: float

class CompraBase(SanitizedBaseModel):
    proveedor: str
    cuit: Optional[str] = None
    numero: Optional[str] = None
    fecha: datetime = Field(default_factory=datetime.now)
    subtotal: float
    iva: float
    percepciones: float = 0.0
    total: float
    metodoPago: str = "EFECTIVO"
    categoria: str = "OTROS"
    tipoFactura: Optional[str] = "A"
    cbuProveedor: Optional[str] = None
    esImportacionServicio: Optional[bool] = False

class CreateCompraRequest(CompraBase):
    items: List[CompraItemBase]

class CompraResponse(CompraBase):
    id: str
    items: List[CompraItemBase]
    createdAt: datetime

# --- Caja ---
class CajaMovimientoBase(SanitizedBaseModel):
    tipo: str # INGRESO, EGRESO
    monto: float
    concepto: str
    referencia: Optional[str] = None
    metodo: str = "EFECTIVO"

class CajaMovimientoResponse(CajaMovimientoBase):
    id: str
    fecha: datetime
    createdAt: datetime

# --- Reportes ---
class BalanceRow(SanitizedBaseModel):
    accountCode: str
    accountName: str
    debit: float
    credit: float
    balance: float
