import sys

def check_brackets(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    stack = []
    brackets = {'}': '{', ']': '[', ')': '('}
    
    for i, line in enumerate(lines):
        # Very simple check, ignores strings and comments
        in_string = False
        string_char = ''
        escape = False
        
        for j, char in enumerate(line):
            if escape:
                escape = False
                continue
                
            if char == '\\':
                escape = True
                continue
                
            if char in ("'", '"', '`'):
                if not in_string:
                    in_string = True
                    string_char = char
                elif string_char == char:
                    in_string = False
                continue
                
            if in_string:
                continue
                
            if char in "({[":
                stack.append((char, i+1))
            elif char in ")}]":
                if not stack:
                    print(f"Error: Unexpected closing bracket {char} on line {i+1}")
                    return
                top, line_num = stack.pop()
                if top != brackets[char]:
                    print(f"Error: Mismatched bracket {char} on line {i+1}. Expected closing for {top} from line {line_num}")
                    return
                    
    if stack:
        print(f"Error: Unclosed brackets remaining: {[(c, l) for c, l in stack]}")
    else:
        print("Brackets are balanced.")

check_brackets('script.js')
