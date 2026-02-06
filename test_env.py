import os
import sys
import subprocess

with open("env_info.txt", "w") as f:
    f.write(f"CWD: {os.getcwd()}\n")
    f.write(f"Python: {sys.version}\n")
    try:
        ls_out = subprocess.check_output(["ls"], text=True)
        f.write(f"LS:\n{ls_out}\n")
    except Exception as e:
        f.write(f"LS Error: {e}\n")
