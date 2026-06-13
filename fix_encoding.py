import os

replacements = {
    "Xojeli rayonД± qГЎnigelestirilgen mektebi": "Xojeli rayonı qánigelestirilgen mektebi",
    "OqД±wshД±nД±Е„ F.A.ГЃ.": "Oquwshınıń F.I.A.",
    "KlastД± taЕ„laЕ„": "Klastı saylań",
    "РГЎndi taЕ„laЕ„": "Pándi saylań",
    "PIN-kodtД± kiritiЕ„": "PIN-kodtı kiritiń",
    "OqД±tД±wshД±lar hГЎm Admin kiriwi": "Oqıtıwshılar hám Admin kiriwi",
    "pµЦ† Top-10 Reyting": "Top-10 Reyting",
    "OrД±n": "Orın",
    "Toplan3pan ball": "Toplanǵan ball",
    "Reyting kestesi bos.": "Reyting kestesi bos."
}

files_to_fix = ["index.html", "script.js", "lang.js", "patch.js"]

for filepath in files_to_fix:
    if not os.path.exists(filepath):
        continue
        
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        # If it somehow fails as utf-8, try cp1251
        with open(filepath, 'r', encoding='cp1251') as f:
            content = f.read()
            
    original_content = content
    
    for bad, good in replacements.items():
        content = content.replace(bad, good)
        
    # Also do a general fallback if some characters are left behind:
    # "Д±" -> "ı"
    # "ГЎ" -> "á"
    # "Е„" -> "ń"
    # "ГЃ" -> "Á"
    # "РГЎndi" -> "Pándi" (Wait, Р in РГЎndi is just a Cyrillic Р?)
    
    if content != original_content:
        print(f"Fixed specific strings in {filepath}")
        
    # Save as clean UTF-8
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Done fixing encodings and strings.")
