import os
import sys

# Add apps/api to path
sys.path.append('apps/api')

routers_dir = 'apps/api/routers'
routers = [f[:-3] for f in os.listdir(routers_dir) if f.endswith('.py') and f != '__init__.py']

print(f"Checking {len(routers)} routers...")

for router in routers:
    try:
        # Mock some dependencies if needed, or just try to import
        # We need to set up the environment so core, schemas, etc. are findable
        __import__(f"routers.{router}")
        print(f"✅ {router}: OK")
    except ImportError as e:
        print(f"❌ {router}: ImportError: {e}")
    except Exception as e:
        # Other exceptions might occur due to lack of DB or env vars, but we care about ImportErrors
        print(f"⚠️ {router}: Exception (likely not ImportError): {type(e).__name__}: {e}")
