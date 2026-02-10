import subprocess
import os

def run_tests():
    print("Running tests...")
    try:
        # Run pytest and capture output
        result = subprocess.run(
            ["python3", "-m", "pytest", "tests/"],
            cwd="/Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/api",
            capture_output=True,
            text=True
        )
        
        with open("test_output_manual.txt", "w") as f:
            f.write("STDOUT:\n")
            f.write(result.stdout)
            f.write("\nSTDERR:\n")
            f.write(result.stderr)
            f.write(f"\nReturn Code: {result.returncode}\n")
            
        print(f"Tests finished with code {result.returncode}")
    except Exception as e:
        with open("test_output_manual.txt", "w") as f:
            f.write(f"Error running tests: {str(e)}\n")
        print(f"Error: {e}")

if __name__ == "__main__":
    run_tests()
