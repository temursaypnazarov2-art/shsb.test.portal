import re

with open('script_strict.js', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')
consts = set()

# Find const declarations
for line in lines:
    matches = re.finditer(r'\bconst\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=', line)
    for match in matches:
        consts.add(match.group(1))

# Find assignments
for i, line in enumerate(lines):
    # ignore if it is a const declaration itself
    if re.search(r'\bconst\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=', line):
        continue
    
    # check for assignments like `x = ` or `x += `
    matches = re.finditer(r'\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(\+|-|\*|/|%|\||\&|\^|<<|>>|>>>)?=', line)
    for match in matches:
        var_name = match.group(1)
        # ignore `==` and `===` and `>=` and `<=` etc.
        # simple check:
        idx = match.end() - 1
        if line[idx] == '=' and (idx+1 < len(line) and line[idx+1] in ['=', '>']):
            continue
            
        if var_name in consts:
            print(f"CONST REASSIGNMENT at line {i+1}: {var_name}")
