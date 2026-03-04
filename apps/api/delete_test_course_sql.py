import urllib.parse
import json
import urllib.request
import os

from urllib.parse import urlparse
parsed = urlparse("postgresql://postgres:bngWhFAsXfcaZxWHVzLCDIbleiGMxAvK@nozomi.proxy.rlwy.net:29586/railway")

print("Attempting to connect with raw python...")
import subprocess
try:
    subprocess.run(["python3", "-c", "import psycopg2"], check=True)
except:
    subprocess.run(["pip3", "install", "psycopg2-binary"], check=True)

import psycopg2

conn = psycopg2.connect(
    dbname=parsed.path[1:],
    user=parsed.username,
    password=parsed.password,
    host=parsed.hostname,
    port=parsed.port
)
cur = conn.cursor()
cur.execute("SELECT id, nombre, activo FROM cursos;")
cursos = cur.fetchall()
for c in cursos:
    print(c)
    if "Test" in c[1]:
        print(f"Deleting {c[1]}")
        cur.execute("UPDATE cursos SET activo=false WHERE id=%s", (c[0],))
        # cur.execute("DELETE FROM cursos WHERE id=%s", (c[0],)) # use update to avoid FK constraint for now
conn.commit()
cur.close()
conn.close()
