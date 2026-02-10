import subprocess
import os

def check_env():
    out_file = "env_check_results.txt"
    with open(out_file, "w") as f:
        f.write("=== DOCKER PS ===\n")
        try:
            res = subprocess.run(["docker", "ps"], capture_output=True, text=True)
            f.write(res.stdout + "\n" + res.stderr + "\n")
        except Exception as e:
            f.write(f"Error: {e}\n")
            
        f.write("\n=== LSOF -i :5433 ===\n")
        try:
            res = subprocess.run(["lsof", "-i", ":5433"], capture_output=True, text=True)
            f.write(res.stdout + "\n" + res.stderr + "\n")
        except Exception as e:
            f.write(f"Error: {e}\n")

        f.write("\n=== LSOF -i :8001 ===\n")
        try:
            res = subprocess.run(["lsof", "-i", ":8001"], capture_output=True, text=True)
            f.write(res.stdout + "\n" + res.stderr + "\n")
        except Exception as e:
            f.write(f"Error: {e}\n")

if __name__ == "__main__":
    check_env()
