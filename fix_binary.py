import os

byte_replacements = [
    # General character fixes
    (b'\xd0\x94\xc2\xb1', b'\xc4\xb1'),           # Д± -> ı
    (b'\xd0\x95\xe2\x80\x9e', b'\xc5\x84'),       # Е„ -> ń
    (b'\xd0\x93\xd0\x8e', b'\xc3\xa1'),           # ГЎ -> á
    (b'\xd0\x93\xd0\x83', b'\xc3\x81'),           # ГЃ -> Á
    (b'\xd0\x97\xc2\xb5', b'\xc7\xa5'),           # Зµ -> ǵ
    
    # Weird prefix before Top-10 Reyting
    (b'\xd1\x80\xd1\x9f\xd0\x8f\xe2\x80\xa0 ', b''), 
    
    # "РГЎndi" -> The first character might be Cyrillic Р (0xd0 0xa0) or something else.
    # We found b'\x8endi' earlier? Let's just fix "P\xc3\xa1ndi"
    (b'\xd0\xa0\xc3\xa1ndi', b'P\xc3\xa1ndi'),
    (b'\x8endi ta', b'P\xc3\xa1ndi ta'),
    (b'\x8endi', b'P\xc3\xa1ndi'),
    
    # Specific word fixes from user
    (b'Oq\xc4\xb1wsh\xc4\xb1n\xc4\xb1\xc5\x84 F.A.\xc3\x81.', b'Oquwsh\xc4\xb1n\xc4\xb1\xc5\x84 F.I.A.'),
    (b'Oq\xc4\xb1wsh\xc4\xb1 F.A.A:', b'Oquwsh\xc4\xb1n\xc4\xb1\xc5\x84 F.I.A.:'),
    (b'Oq\xc4\xb1wsh\xc4\xb1n\xc4\xb1\xc5\x84 F.A.\xc3\x81a.', b'Oquwsh\xc4\xb1n\xc4\xb1\xc5\x84 F.I.A.'),
    (b'Klast\xc4\xb1 ta\xc5\x84la\xc5\x84', b'Klast\xc4\xb1 sayla\xc5\x84'),
    (b'P\xc3\xa1ndi ta\xc5\x84la\xc5\x84', b'P\xc3\xa1ndi sayla\xc5\x84'),
]

files_to_fix = ["index.html", "script.js", "lang.js", "patch.js"]

for filepath in files_to_fix:
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'rb') as f:
        content = f.read()
        
    original_content = content
    
    for bad, good in byte_replacements:
        content = content.replace(bad, good)
        
    if content != original_content:
        print(f"Fixed encoding in {filepath}")
        with open(filepath, 'wb') as f:
            f.write(content)

print("Done fixing all specific byte patterns.")
