import requests
import json
import os
from dotenv import load_dotenv

load_dotenv("apps/api/.env")

SECRET = os.getenv("JWT_SECRET", "super-secret-key-for-development-only")
API_URL = "http://localhost:8000" # Local API port

def test_admin_endpoints():
    print("--- Verifying Control Center Endpoints ---")
    
    # In a real test, we'd need a valid token. 
    # Since this is a local environment, maybe we can mock or use a test user if available.
    # For now, let's just check if the endpoints exist in the OpenAPI spec.
    
    try:
        response = requests.get(f"{API_URL}/openapi.json")
        if response.status_code == 200:
            spec = response.json()
            paths = spec.get("paths", {})
            
            endpoints_to_check = [
                "/api/admin/health",
                "/api/admin/backups/create",
                "/api/admin/backups",
                "/api/admin/backups/download/{filename}"
            ]
            
            for endpoint in endpoints_to_check:
                if endpoint in paths:
                    print(f"✅ OK: Endpoint {endpoint} found in OpenAPI spec.")
                else:
                    print(f"❌ FAIL: Endpoint {endpoint} NOT found.")
        else:
            print(f"⚠️ API is not running at {API_URL}. Cannot verify spec.")
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

if __name__ == "__main__":
    test_admin_endpoints()
