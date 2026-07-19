with open('script_strict.js', 'r', encoding='utf-8') as f:
    text = f.read()

print("Backticks:", text.count("`"))
