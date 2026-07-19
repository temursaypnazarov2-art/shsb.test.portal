import re

with open('script_strict.js', 'r', encoding='utf-8') as f:
    text = f.read()

def strip_comments_and_strings(code):
    code = re.sub(r'//.*', '', code)
    code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
    code = re.sub(r'"(?:\\.|[^"\\])*"', '""', code)
    code = re.sub(r"'(?:\\.|[^'\\])*'", "''", code)
    code = re.sub(r'`(?:\\.|[^`\\])*`', '``', code)
    return code

clean_text = strip_comments_and_strings(text)
index = 22453

# Print the context
start = max(0, index - 100)
end = min(len(clean_text), index + 100)

print(clean_text[start:end])

# Let's map it to line number in original text!
# Find the context string in original text
context_snippet = clean_text[max(0, index-20):index].strip()
print("Context snippet:", repr(context_snippet))

lines = text.split('\n')
for i, line in enumerate(lines):
    if context_snippet.replace(" ", "") in line.replace(" ", ""):
        print(f"Found around line {i+1}: {line}")
