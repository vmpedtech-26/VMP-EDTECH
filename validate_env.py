import os
import sys

def check_env():
    required_vars = [
        "DATABASE_URL",
        "JWT_SECRET",
        "FRONTEND_URL"
    ]
    
    missing = []
    for var in required_vars:
        if not os.getenv(var):
            missing.append(var)
    
    if missing:
        print("\033[91mError: Missing required environment variables:\033[0m")
        for var in missing:
            print(f"  - {var}")
        sys.exit(1)
    
    print("\033[92mEnvironment variables validated successfully.\033[0m")

if __name__ == "__main__":
    check_env()
