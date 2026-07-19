import re

with open('script_strict.js', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')

print("Single quote mismatches:")
for i, line in enumerate(lines):
    # Strip comments first
    line_no_comment = line.split('//')[0]
    count = line_no_comment.count("'")
    if count % 2 != 0:
        print(f"Line {i+1}: {line}")

print("\nDouble quote mismatches:")
for i, line in enumerate(lines):
    line_no_comment = line.split('//')[0]
    count = line_no_comment.count('"')
    if count % 2 != 0:
        print(f"Line {i+1}: {line}")
        
# Let's also check for garbled text that IDE might flag as error if it contains invisible characters
for i, line in enumerate(lines):
    if 'Р В РІР‚в„ўР вЂ™Р’В°' in line:
        print(f"Garbled text at line {i+1}")
