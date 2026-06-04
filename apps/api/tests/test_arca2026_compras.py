"""
Tests para endpoints de compras y asientos contables según las normas ARCA 2026 y FACPCE RT 54.
"""
import pytest
from httpx import AsyncClient
from core.database import prisma

@pytest.mark.asyncio
class TestArca2026Compras:
    """Pruebas de persistencia y asientos contables ARCA 2026 / RT 54"""

    async def run_seed(self, client: AsyncClient, admin_token: str):
        """Helper para inicializar el plan de cuentas contable"""
        response = await client.post(
            "/api/accounting/seed",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        return response.json()

    async def test_seed_accounting_arca_accounts(self, client: AsyncClient, admin_token: str):
        """Verifica que el seed cargue las nuevas cuentas puente y de retenciones"""
        data = await self.run_seed(client, admin_token)
        assert "Plan de cuentas" in data["message"]

        # Verificar existencia física de las nuevas cuentas
        acc_bridge = await prisma.account.find_unique(where={"code": "1.1.09"})
        assert acc_bridge is not None
        assert acc_bridge.name == "Retenciones a Conciliar"
        assert acc_bridge.type == "ASSET"

        acc_ret_iva = await prisma.account.find_unique(where={"code": "2.1.08"})
        assert acc_ret_iva is not None
        assert acc_ret_iva.name == "Retenciones IVA a Pagar"

        acc_ret_gan = await prisma.account.find_unique(where={"code": "2.1.09"})
        assert acc_ret_gan is not None
        assert acc_ret_gan.name == "Retenciones Ganancias a Pagar"

    async def test_registrar_compra_regular(self, client: AsyncClient, admin_token: str, test_admin):
        """Prueba de registro de una compra A común sin retenciones especiales"""
        await self.run_seed(client, admin_token)

        payload = {
            "proveedor": "La Colonia S.A.",
            "cuit": "30-12345678-9",
            "numero": "0001-00004321",
            "fecha": "2026-05-27T00:00:00Z",
            "subtotal": 100000.0,
            "iva": 21000.0,
            "percepciones": 0.0,
            "total": 121000.0,
            "metodoPago": "EFECTIVO",
            "categoria": "OTROS",
            "tipoFactura": "A",
            "esImportacionServicio": False,
            "items": [
                {
                    "descripcion": "Combustible para flota",
                    "cantidad": 1,
                    "precioUnit": 100000.0,
                    "subtotal": 100000.0
                }
            ]
        }

        response = await client.post(
            "/api/accounting/compras",
            json=payload,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        compra = response.json()
        assert compra["proveedor"] == "La Colonia S.A."
        assert compra["tipoFactura"] == "A"
        assert compra["esImportacionServicio"] is False

        # Verificar que se haya creado el asiento contable (Debe = Haber)
        asiento = await prisma.journalentry.find_first(
            where={"reference": "0001-00004321"},
            include={"entries": {"include": {"account": True}}}
        )
        assert asiento is not None
        assert asiento.concept == "Compra 0001-00004321 - La Colonia S.A."

        debe = sum(entry.debit for entry in asiento.entries)
        haber = sum(entry.credit for entry in asiento.entries)
        assert abs(debe - haber) < 0.01
        assert debe == 121000.0

    async def test_registrar_compra_con_retencion(self, client: AsyncClient, admin_token: str, test_admin):
        """Prueba del nuevo flujo de Factura A con Retención Obligatoria (IVA 100% y Ganancias 6%)"""
        await self.run_seed(client, admin_token)

        payload = {
            "proveedor": "Distribuidora Mayorista S.R.L.",
            "cuit": "30-98765432-1",
            "numero": "0002-00005555",
            "fecha": "2026-05-27T00:00:00Z",
            "subtotal": 100000.0,
            "iva": 21000.0,
            "percepciones": 0.0,
            "total": 121000.0,
            "metodoPago": "TRANSFERENCIA",
            "categoria": "SERVICIOS",
            "tipoFactura": "A_RETENCION",
            "esImportacionServicio": False,
            "items": [
                {
                    "descripcion": "Consultoría y Asesoramiento Técnico",
                    "cantidad": 1,
                    "precioUnit": 100000.0,
                    "subtotal": 100000.0
                }
            ]
        }

        response = await client.post(
            "/api/accounting/compras",
            json=payload,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        compra = response.json()
        assert compra["tipoFactura"] == "A_RETENCION"

        # Verificar el asiento contable balanceado
        # Retención IVA = 100% de IVA = 21000
        # Retención Ganancias = 6% de subtotal = 6000
        # Pago Neto = Total - Ret. IVA - Ret. Ganancias = 121000 - 21000 - 6000 = 94000
        asiento = await prisma.journalentry.find_first(
            where={"reference": "0002-00005555"},
            include={"entries": {"include": {"account": True}}}
        )
        assert asiento is not None
        
        debe = sum(entry.debit for entry in asiento.entries)
        haber = sum(entry.credit for entry in asiento.entries)
        assert abs(debe - haber) < 0.01
        assert debe == 121000.0 # Subtotal (100k) + IVA (21k)

        # Buscar partidas específicas del asiento
        pago_entry = next(e for e in asiento.entries if e.account.code == "1.1.02")
        assert pago_entry.credit == 94000.0 # Banco pagó el neto

        ret_iva_entry = next(e for e in asiento.entries if e.account.code == "2.1.08")
        assert ret_iva_entry.credit == 21000.0

        ret_gan_entry = next(e for e in asiento.entries if e.account.code == "2.1.09")
        assert ret_gan_entry.credit == 6000.0

    async def test_registrar_compra_cbu_validation_and_force_bank(self, client: AsyncClient, admin_token: str, test_admin):
        """Verifica la validación estricta de CBU de 22 dígitos y el desvío forzado al Banco para A_CBU"""
        await self.run_seed(client, admin_token)

        payload_invalid_cbu = {
            "proveedor": "Estudio Contable Castillo",
            "cuit": "30-55555555-3",
            "numero": "0003-00006666",
            "fecha": "2026-05-27T00:00:00Z",
            "subtotal": 50000.0,
            "iva": 10500.0,
            "percepciones": 0.0,
            "total": 60500.0,
            "metodoPago": "EFECTIVO",
            "categoria": "SERVICIOS",
            "tipoFactura": "A_CBU",
            "cbuProveedor": "12345", # CBU Inválida (muy corta)
            "esImportacionServicio": False,
            "items": [
                {
                    "descripcion": "Auditoría mensual",
                    "cantidad": 1,
                    "precioUnit": 50000.0,
                    "subtotal": 50000.0
                }
            ]
        }

        # 1. Enviar con CBU inválida debe dar 400
        res_invalid = await client.post(
            "/api/accounting/compras",
            json=payload_invalid_cbu,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res_invalid.status_code == 400
        assert "CBU del proveedor válida" in res_invalid.json()["detail"]

        # 2. Corregir CBU a 22 dígitos y enviar.
        # Debe forzar que el pago sea por Banco (1.1.02), a pesar de que el JSON dice metodoPago: "EFECTIVO"
        payload_valid_cbu = payload_invalid_cbu.copy()
        payload_valid_cbu["cbuProveedor"] = "0170000000000000000088" # CBU válida

        res_valid = await client.post(
            "/api/accounting/compras",
            json=payload_valid_cbu,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res_valid.status_code == 200
        compra = res_valid.json()
        assert compra["cbuProveedor"] == "0170000000000000000088"

        # Verificar que el asiento use Banco (1.1.02)
        asiento = await prisma.journalentry.find_first(
            where={"reference": "0003-00006666"},
            include={"entries": {"include": {"account": True}}}
        )
        assert asiento is not None
        pago_entry = next(e for e in asiento.entries if e.credit > 0)
        assert pago_entry.account.code == "1.1.02" # Forzado a Banco!
