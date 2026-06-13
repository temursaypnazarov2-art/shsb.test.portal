import os

with open("lang.js", "rb") as f:
    lang_content = f.read()

# Replace QQ messages using exact bytes found:
qq_warning_old = b'lockWarningText: "Sistemadan paydalan\xc4\xb1w qa\xc7\xa5\xc4\xb1ydalar\xc4\xb1 buz\xc4\xb1ld\xc4\xb1 (ekran \xd0\x93\xd1\x96zgertildi yamasa tol\xc4\xb1q ekran rejiminen sh\xc4\xb1\xc7\xa5\xc4\xb1ld\xc4\xb1).",\r'
qq_warning_new = 'lockWarningText: "Siz test qaǵıydasın buzdińız! Test bloklandı.",\r'.encode('utf-8')

qq_admin_old = b'lockAdminNote: "Siz test qa\xc7\xa5\xc4\xb1ydas\xc4\xb1n buzdi\xc5\x84\xc4\xb1z! Oq\xc4\xb1t\xc4\xb1wsh\xc4\xb1 parolin kiriti\xc5\x84:",\r'
qq_admin_new = 'lockAdminNote: "Dawam etiw ushın oqıtıwshı parolin kiritiń:",\r'.encode('utf-8')

lang_content = lang_content.replace(qq_warning_old, qq_warning_new)
lang_content = lang_content.replace(qq_admin_old, qq_admin_new)

with open("lang.js", "wb") as f:
    f.write(lang_content)

print("lang.js updated with QQ strings")
