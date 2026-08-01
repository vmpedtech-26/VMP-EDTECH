#!/usr/bin/env python3
"""
Keep-Alive Pinger for VMP EdTech API (Render)
Prevents Render free/hobby instances from going into sleep mode by sending periodic GET requests.
"""

import time
import urllib.request
import urllib.error
import sys
from datetime import datetime

TARGET_URL = "https://vmp-edtech-6wgw.onrender.com/"
INTERVAL_SECONDS = 240  # 4 minutes (Render sleeps after 15 minutes of inactivity)

def ping():
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        req = urllib.request.Request(
            TARGET_URL,
            headers={"User-Agent": "VMP-KeepAlive-Pinger/1.0"}
        )
        t0 = time.time()
        with urllib.request.urlopen(req, timeout=15) as response:
            status = response.status
            elapsed = time.time() - t0
            print(f"[{now}] Ping OK -> Status: {status}, Response Time: {elapsed:.2f}s")
            return True
    except urllib.error.HTTPError as e:
        print(f"[{now}] Ping HTTP Status: {e.code}")
        return True
    except Exception as e:
        print(f"[{now}] Ping Error: {e}")
        return False

def main():
    print(f"=== Starting VMP EdTech Keep-Alive Pinger ===")
    print(f"Target URL: {TARGET_URL}")
    print(f"Interval: {INTERVAL_SECONDS} seconds")
    
    if len(sys.argv) > 1 and sys.argv[1] == "--once":
        ping()
        return

    while True:
        ping()
        time.sleep(INTERVAL_SECONDS)

if __name__ == "__main__":
    main()
