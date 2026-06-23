import re

subjects = [
    ("O'zbek tili", "subjOzbek"),
    ("San'at", "subjSanat"),
    ("Rus tili", "subjRus"),
    ("Ingliz tili", "subjIngliz"),
    ("Tabiiy fan", "subjTabiiy"),
    ("O'zbekiston tarixi", "subjOzbTarix"),
    ("Jahon tarixi", "subjJahonTarix"),
    ("Qoraqalpog'iston tarixi", "subjQorTarix"),
    ("Adabiyot", "subjAdabiyot"),
    ("Geografiya", "subjGeografiya"),
    ("Texnologiya", "subjTexnologiya"),
    ("Algebra", "subjAlgebra"),
    ("Geometriya", "subjGeometriya")
]

html_options = '\n'.join([f'                              <option value="{s[0]}" data-i18n="{s[1]}">{s[0]}</option>' for s in subjects])

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the options
# We'll find blocks of <option value="Ona tili"... to <option value="Informatika"...
pattern = re.compile(r'<option value="Ona tili"[^>]*>.*?</option>\s*<option value="Matematika"[^>]*>.*?</option>\s*<option value="Fizika"[^>]*>.*?</option>\s*<option value="Kimyo"[^>]*>.*?</option>\s*<option value="Biologiya"[^>]*>.*?</option>\s*<option value="Tarix"[^>]*>.*?</option>\s*<option value="Huquq"[^>]*>.*?</option>\s*<option value="Informatika"[^>]*>.*?</option>', re.DOTALL)

content = pattern.sub(html_options, content)

# Generate admin pin fields
admin_fields = ''
for i, s in enumerate(subjects):
    base_id = s[1].replace('subj', '').lower()
    if i % 2 == 0:
        admin_fields += '                              <div style="display: flex; gap: 10px;">\n'
    admin_fields += f'                                  <div style="flex: 1;"><label>{s[0]}:</label><input type="text" id="pin-{base_id}" placeholder="PIN-kod"></div>\n'
    admin_fields += f'                                  <div style="flex: 1;"><label>Vaqt (daqiqa):</label><input type="number" id="dur-{base_id}" placeholder="20"></div>\n'
    if i % 2 == 1 or i == len(subjects) - 1:
        admin_fields += '                              </div>\n'

admin_block_pattern = re.compile(r'<div class="subject-pin-settings"[^>]*>.*?</div>\s*</div>\s*<button id="save-admin-pin-btn"', re.DOTALL)
admin_replacement = f'<div class="subject-pin-settings" style="display: flex; flex-direction: column; gap: 10px;">\n{admin_fields}                          </div>\n                      </div>\n                      <button id="save-admin-pin-btn"'

content = admin_block_pattern.sub(admin_replacement, content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated index.html')

# Update script.js
with open('script.js', 'r', encoding='utf-8') as f:
    script_content = f.read()

# Replace SUBJECTS array
subj_str = ', '.join([f'"{s[0]}"' for s in subjects])
script_content = re.sub(r'const SUBJECTS = \[[^\]]*\];', f'const SUBJECTS = [{subj_str}];', script_content)

# Replace PIN_INPUT_IDS
pin_ids = ', '.join([f"'pin-{s[1].replace('subj', '').lower()}'" for s in subjects])
script_content = re.sub(r'const PIN_INPUT_IDS = \[[^\]]*\];', f'const PIN_INPUT_IDS = [{pin_ids}];', script_content)

# Replace DUR_INPUT_IDS
dur_ids = ', '.join([f"'dur-{s[1].replace('subj', '').lower()}'" for s in subjects])
script_content = re.sub(r'const DUR_INPUT_IDS = \[[^\]]*\];', f'const DUR_INPUT_IDS = [{dur_ids}];', script_content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(script_content)
print('Updated script.js')
