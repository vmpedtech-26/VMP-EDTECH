import argparse
import requests
import sys

def check_health(api_url):
    print(f"📡 Checking API Health at: {api_url}")
    try:
        # Try both /health and /api/health just in case
        urls = [f"{api_url}/health", f"{api_url}/api/health", f"{api_url}/"]
        
        for url in urls:
            try:
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    print(f"✅ Success! Connected to {url}")
                    return True
            except:
                continue
        
        print("❌ Could not connect to any health endpoint.")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def check_public_endpoint(api_url):
    print(f"🔍 Checking Public Endpoint...")
    url = f"{api_url}/api/public/validar/000000"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code in [200, 404]: # 404 is fine (means code verify works but not found)
            print(f"✅ Public API seems active (Status: {response.status_code})")
        else:
            print(f"⚠️ Warning: Public API returned {response.status_code}")
    except Exception as e:
        print(f"❌ Error checking public endpoint: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Smoke Test for VMP Production")
    parser.add_argument("--api-url", required=True, help="Production API URL (e.g. https://xxx.up.railway.app)")
    args = parser.parse_args()
    
    url = args.api_url.rstrip('/')
    
    if check_health(url):
        check_public_endpoint(url)
        print("\n🚀 API seems to be UP and RUNNING!")
    else:
        print("\n💥 validation FAILED. Check Railway logs.")
        sys.exit(1)
