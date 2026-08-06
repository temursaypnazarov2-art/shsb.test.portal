import sys

def check_brackets(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        text = f.read()
    
    stack = []
    line = 1
    for i, c in enumerate(text):
        if c == '\n': line += 1
        if c in '{[(': stack.append((c, line))
        elif c in '}])':
            if not stack:
                print(f"{filename}: Unmatched {c} at line {line}")
                return
            last_c, last_line = stack.pop()
            if (last_c == '{' and c != '}') or (last_c == '[' and c != ']') or (last_c == '(' and c != ')'):
                print(f"{filename}: Mismatched {last_c} at line {last_line} with {c} at line {line}")
                return
    if stack:
        print(f"{filename}: Unclosed {stack[-1][0]} from line {stack[-1][1]}")
    else:
        print(f"{filename}: Brackets are balanced.")

check_brackets('script.js')
check_brackets('script_strict.js')
