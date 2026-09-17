"""
Regresión: registrar_venta/registrar_compra con percepciones > 0 generaban
un asiento contable roto -- en ventas, las percepciones se acreditaban a la
cuenta de IVA Débito Fiscal (inflando esa cuenta); en compras, directamente
no se registraban en ningún lado, dejando el asiento desbalanceado
(Debe != Haber).
"""
import pytest
from httpx import AsyncClient


async def _seed_and_get_account(client: AsyncClient, admin_token: str, code: str):
    await client.post("/api/accounting/seed", headers={"Authorization": f"Bearer {admin_token}"})
    resp = await client.get("/api/accounting/accounts", headers={"Authorization": f"Bearer {admin_token}"})
    accounts = {a["code"]: a for a in resp.json()}
    return accounts[code]


class TestPercepciones:
    @pytest.mark.asyncio
    async def test_venta_con_percepciones_balancea_y_no_infla_iva(self, client: AsyncClient, admin_token, db):
        company = await db.company.create(data={"nombre": "Cliente Test", "cuit": "30-99999999-0", "email": "cliente@test.com"})

        await _seed_and_get_account(client, admin_token, "2.1.05")
        account_percepciones = await _seed_and_get_account(client, admin_token, "2.1.10")

        response = await client.post(
            "/api/accounting/ventas",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "numero": "V-TEST-001",
                "companyId": company.id,
                "subtotal": 1000.0,
                "iva": 210.0,
                "percepciones": 50.0,
                "total": 1260.0,
                "metodoPago": "TRANSFERENCIA",
                "items": [{"descripcion": "Servicio", "cantidad": 1, "precioUnit": 1000.0, "subtotal": 1000.0}],
            },
        )
        assert response.status_code == 200

        journal = await db.journalentry.find_first(where={"reference": "V-TEST-001"}, include={"entries": True})
        assert journal is not None
        assert sum(e.debit for e in journal.entries) == pytest.approx(sum(e.credit for e in journal.entries))

        percepcion_entries = [e for e in journal.entries if e.accountId == account_percepciones.id]
        assert len(percepcion_entries) == 1
        assert percepcion_entries[0].credit == pytest.approx(50.0)

        await db.journalentry.delete(where={"id": journal.id})
        await db.venta.delete(where={"numero": "V-TEST-001"})
        await db.company.delete(where={"id": company.id})

    @pytest.mark.asyncio
    async def test_compra_con_percepciones_balancea(self, client: AsyncClient, admin_token, db):
        account_percepciones = await _seed_and_get_account(client, admin_token, "1.1.06")

        response = await client.post(
            "/api/accounting/compras",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "proveedor": "Proveedor Test",
                "numero": "C-TEST-001",
                "subtotal": 1000.0,
                "iva": 210.0,
                "percepciones": 30.0,
                "total": 1240.0,
                "metodoPago": "TRANSFERENCIA",
                "categoria": "OTROS",
                "tipoFactura": "A",
                "items": [{"descripcion": "Insumo", "cantidad": 1, "precioUnit": 1000.0, "subtotal": 1000.0}],
            },
        )
        assert response.status_code == 200
        compra_id = response.json()["id"]

        journal = await db.journalentry.find_first(where={"reference": "C-TEST-001"}, include={"entries": True})
        assert journal is not None
        assert sum(e.debit for e in journal.entries) == pytest.approx(sum(e.credit for e in journal.entries))

        percepcion_entries = [e for e in journal.entries if e.accountId == account_percepciones.id]
        assert len(percepcion_entries) == 1
        assert percepcion_entries[0].debit == pytest.approx(30.0)

        await db.journalentry.delete(where={"id": journal.id})
        await db.compra.delete(where={"id": compra_id})
