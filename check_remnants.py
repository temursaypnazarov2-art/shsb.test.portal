import os

patterns = ["Д±", "ГЎ", "Е„", "ГЃ", "µЦ†", "Toplan3pan"]
files_to_check = ["index.html", "script.js", "lang.js", "patch.js"]

found = False
for filepath in files_to_check:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        for i, line in enumerate(lines):
            for p in patterns:
                if p in line:
                    print(f"Found '{p}' in {filepath}:{i+1} -> {line.strip()}")
                    found = True
if not found:
    print("No remnants found.")
