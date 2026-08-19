import time
from urllib.parse import urlencode

import requests
from jose import jwt as jose_jwt

from services.sso_crypto import decrypt_secret

AUTHORITY = "https://login.microsoftonline.com"
SCOPE = "openid profile email"

_jwks_cache: dict[str, dict] = {}


def build_authorize_url(empresa, redirect_uri: str, state: str) -> str:
    """Arma la URL de autorización de Microsoft Entra ID (Azure AD) para el tenant de la empresa."""
    params = {
        "client_id": empresa.ssoClientId,
        "response_type": "code",
        "redirect_uri": redirect_uri,
        "response_mode": "query",
        "scope": SCOPE,
        "state": state,
    }
    return f"{AUTHORITY}/{empresa.ssoTenantId}/oauth2/v2.0/authorize?{urlencode(params)}"


def exchange_code_for_id_token(empresa, code: str, redirect_uri: str) -> str:
    """Canjea el código de autorización por un id_token contra el token endpoint de Azure AD."""
    client_secret = decrypt_secret(empresa.ssoClientSecret) if empresa.ssoClientSecret else ""

    response = requests.post(
        f"{AUTHORITY}/{empresa.ssoTenantId}/oauth2/v2.0/token",
        data={
            "client_id": empresa.ssoClientId,
            "client_secret": client_secret,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "scope": SCOPE,
        },
        timeout=10,
    )
    if response.status_code != 200:
        raise ValueError(f"Azure AD rechazó el canje del código de autorización: {response.text}")

    id_token = response.json().get("id_token")
    if not id_token:
        raise ValueError("Azure AD no devolvió un id_token")
    return id_token


def _get_jwks(tenant_id: str) -> dict:
    cached = _jwks_cache.get(tenant_id)
    if cached and cached["expires_at"] > time.time():
        return cached["keys"]

    response = requests.get(f"{AUTHORITY}/{tenant_id}/discovery/v2.0/keys", timeout=10)
    response.raise_for_status()
    keys = response.json()
    _jwks_cache[tenant_id] = {"keys": keys, "expires_at": time.time() + 3600}
    return keys


def validate_id_token(empresa, id_token: str) -> dict:
    """Valida firma, issuer y audience del id_token contra las claves públicas del tenant."""
    jwks = _get_jwks(empresa.ssoTenantId)
    try:
        claims = jose_jwt.decode(
            id_token,
            jwks,
            algorithms=["RS256"],
            audience=empresa.ssoClientId,
            issuer=f"{AUTHORITY}/{empresa.ssoTenantId}/v2.0",
        )
    except Exception as exc:
        raise ValueError(f"Token de identidad inválido: {exc}")
    return claims
