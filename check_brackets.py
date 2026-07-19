import re

with open('script_strict.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Check brackets {}, (), []
def check_brackets(text):
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    for i, char in enumerate(text):
        if char in '({[':
            stack.append((char, i))
        elif char in ')}]':
            if not stack:
                print(f"Unmatched closing bracket '{char}' at index {i}")
                return False
            top_char, top_i = stack.pop()
            if pairs[char] != top_char:
                print(f"Mismatched bracket: '{top_char}' closed by '{char}' at index {i}")
                return False
    if stack:
        print(f"Unclosed brackets remaining: {stack}")
        return False
    return True

# To correctly check brackets, we must remove comments and strings first!
def strip_comments_and_strings(code):
    # Regex to remove string literals, template literals, and comments
    # This is a basic approximation
    code = re.sub(r'//.*', '', code)
    code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
    code = re.sub(r'"(?:\\.|[^"\\])*"', '""', code)
    code = re.sub(r"'(?:\\.|[^'\\])*'", "''", code)
    code = re.sub(r'`(?:\\.|[^`\\])*`', '``', code)
    return code

clean_text = strip_comments_and_strings(text)
if check_brackets(clean_text):
    print("Brackets match!")
