import json
import sys

try:
    import esprima
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "esprima"])
    import esprima

def check_syntax(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    try:
        esprima.parseScript(content)
        print("Syntax check passed.")
    except Exception as e:
        print(f"Syntax error: {e}")

if __name__ == "__main__":
    check_syntax('script.js')
