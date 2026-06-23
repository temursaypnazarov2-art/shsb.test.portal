import re

subjects = [
    ("O'zbek tili", "subjOzbek", "O'zbek tili", "Ózbek tili", "Uzbek Language"),
    ("San'at", "subjSanat", "San'at", "ART", "ART"),
    ("Rus tili", "subjRus", "Rus tili", "Rus tili", "Russian Language"),
    ("Ingliz tili", "subjIngliz", "Ingliz tili", "Inglis tili", "English Language"),
    ("Tabiiy fan", "subjTabiiy", "Tabiiy fan", "Tábiiy pán", "Natural Science"),
    ("O'zbekiston tarixi", "subjOzbTarix", "O'zbekiston tarixi", "Ózbekstan tariyxi", "History of Uzbekistan"),
    ("Jahon tarixi", "subjJahonTarix", "Jahon tarixi", "Jahan tariyxi", "World History"),
    ("Qoraqalpog'iston tarixi", "subjQorTarix", "Qoraqalpog'iston tarixi", "Qaraqalpaqstan tariyxi", "History of Karakalpakstan"),
    ("Adabiyot", "subjAdabiyot", "Adabiyot", "Ádebiyat", "Literature"),
    ("Geografiya", "subjGeografiya", "Geografiya", "Geografiya", "Geography"),
    ("Texnologiya", "subjTexnologiya", "Texnologiya", "Texnologiya", "Technology"),
    ("Algebra", "subjAlgebra", "Algebra", "Algebra", "Algebra"),
    ("Geometriya", "subjGeometriya", "Geometriya", "Geometriya", "Geometry"),
    ("Matematika", "subjMatematika", "Matematika", "Matematika", "Mathematics"),
    ("Huquq", "subjHuquq", "Huquq", "Huqıq", "Law"),
    ("Kimyo", "subjKimyo", "Kimyo", "Ximiya", "Chemistry"),
    ("Informatika", "subjInformatika", "Informatika", "Informatika", "Computer Science"),
    ("Ona tili", "subjOnaTili", "Ona tili", "Ana tili", "Mother Tongue"),
    ("Fizika", "subjFizika", "Fizika", "Fizika", "Physics"),
    ("Biologiya", "subjBiologiya", "Biologiya", "Biologiya", "Biology")
]

# Update script.js
with open('script.js', 'r', encoding='utf-8') as f:
    script_content = f.read()

subj_str = ', '.join([f'"{s[0]}"' for s in subjects])
script_content = re.sub(r'const SUBJECTS = \[[^\]]*\];', f'const SUBJECTS = [{subj_str}];', script_content)

pin_ids = ', '.join([f"'pin-{s[1].replace('subj', '').lower()}'" for s in subjects])
script_content = re.sub(r'const PIN_INPUT_IDS = \[[^\]]*\];', f'const PIN_INPUT_IDS = [{pin_ids}];', script_content)

dur_ids = ', '.join([f"'dur-{s[1].replace('subj', '').lower()}'" for s in subjects])
script_content = re.sub(r'const DUR_INPUT_IDS = \[[^\]]*\];', f'const DUR_INPUT_IDS = [{dur_ids}];', script_content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(script_content)


# Update index.html
html_options = '\n'.join([f'                              <option value="{s[0]}" data-i18n="{s[1]}">{s[0]}</option>' for s in subjects])

with open('index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# We need to replace the old 13 options. They start with value="O'zbek tili" and end with value="Geometriya"
pattern = re.compile(r'<option value="O\'zbek tili"[^>]*>.*?</option>\s*<option value="San\'at".*?<option value="Geometriya"[^>]*>.*?</option>', re.DOTALL)
html_content = pattern.sub(html_options, html_content)

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

html_content = admin_block_pattern.sub(admin_replacement, html_content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)


# Update lang.js
with open('lang.js', 'r', encoding='utf-8') as f:
    lang_content = f.read()

def generate_lang_string(lang_idx):
    lines = []
    for s in subjects:
        # e.g., subjOzbek: "O'zbek tili"
        lines.append(f'        {s[1]}: "{s[lang_idx]}"')
    return ',\n'.join(lines) + ','

uz_subs = generate_lang_string(2)
kaa_subs = generate_lang_string(3)
en_subs = generate_lang_string(4)

# Pattern to find the old block of 13 subjects
lang_pattern = re.compile(r'subjOzbek:\s*".*?",\s*subjSanat:\s*".*?",.*?\s*subjGeometriya:\s*".*?",?', re.DOTALL)

matches = lang_pattern.findall(lang_content)
if len(matches) == 3:
    lang_content = lang_content.replace(matches[0], uz_subs)
    lang_content = lang_content.replace(matches[1], kaa_subs)
    lang_content = lang_content.replace(matches[2], en_subs)
    with open('lang.js', 'w', encoding='utf-8') as f:
        f.write(lang_content)
    print("All files updated successfully.")
else:
    print(f"Error in lang.js: found {len(matches)} matches.")
