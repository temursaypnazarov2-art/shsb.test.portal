import re

with open('script_strict.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace garbled degree symbol
text = text.replace('Р В РІР‚в„ўР вЂ™Р’В°', '°')
# Replace garbled checkmark
text = text.replace('Р В Р вЂ Р РЋРЎв„ўР Р†Р вЂљР’В¦', '✅')

# Count how many replacements were made
degree_count = text.count('°')
check_count = text.count('✅')
print(f"Degrees: {degree_count}, Checkmarks: {check_count}")

with open('script_strict.js', 'w', encoding='utf-8') as f:
    f.write(text)
