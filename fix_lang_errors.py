import re

with open('lang.js', 'r', encoding='utf-8') as f:
    lang = f.read()

# Fix 1: Fix multiline string errors in aiPrompts
lang = re.sub(r'aiPromptUz: "([^"]*)\n"', r'aiPromptUz: "\1\\n"', lang)
lang = re.sub(r'aiPromptQq: "([^"]*)\n"', r'aiPromptQq: "\1\\n"', lang)
lang = re.sub(r'aiPromptEn: "([^"]*)\n"', r'aiPromptEn: "\1\\n"', lang)

# In case it didn't match perfectly, just replace the exact problematic strings
lang = lang.replace('aiPromptUz: "Siz pedagogik tahlilchisiz. Quyidagi maktab test natijalarini o\'zbek tilida qisqa tahlil qiling va o\'qituvchiga tavsiyalar bering:\n",', 'aiPromptUz: "Siz pedagogik tahlilchisiz. Quyidagi maktab test natijalarini o\'zbek tilida qisqa tahlil qiling va o\'qituvchiga tavsiyalar bering:\\n",')
lang = lang.replace('aiPromptQq: "Siz pedagogikalıq analizshisiz. Tómendegi mektep test nátiyjelerin qaraqalpaq tilinde qısqa analiz etiń hám muallimge usınıslar beriń:\n",', 'aiPromptQq: "Siz pedagogikalıq analizshisiz. Tómendegi mektep test nátiyjelerin qaraqalpaq tilinde qısqa analiz etiń hám muallimge usınıslar beriń:\\n",')
lang = lang.replace('aiPromptEn: "You are a pedagogical analyst. Please provide a brief pedagogical analysis and recommendations for the teacher in English based on the following school test results:\n",', 'aiPromptEn: "You are a pedagogical analyst. Please provide a brief pedagogical analysis and recommendations for the teacher in English based on the following school test results:\\n",')

# Fix 2: Remove duplicate btnShowAnswersOn/Off in qq section
qq_dup = """    btnShowAnswersOn: "Juwaplardı kórsetiw: QOSILǴAN",
    btnShowAnswersOff: "Juwaplardı kórsetiw: ÓSHIRILGEN",
    btnShowAnswersOn: "Juwaplardı kórsetiw: QOSÍLGAN",
    btnShowAnswersOff: "Juwaplardı kórsetiw: ÓSHIRILGEN","""
qq_fixed = """    btnShowAnswersOn: "Juwaplardı kórsetiw: QOSILǴAN",
    btnShowAnswersOff: "Juwaplardı kórsetiw: ÓSHIRILGEN","""
lang = lang.replace(qq_dup, qq_fixed)

# Fix 3: Translate un-translated voice and answer strings in EN block
en_voice_old = """        secAnswersLabel: "Test yakunida to'g'ri javoblarni o'quvchiga ko'rsatish:",
        secVoiceTitle: "Ovozli Anti-Cheat Himoyasi",
        secVoiceLabel: "Test paytida gaplashishni aniqlash va bloklash:",
        btnVoiceOn: "Ovozli himoya: YONIQ",
        btnVoiceOff: "Ovozli himoya: O'CHIRILGAN",
    btnShowAnswersOn: "Javoblarni ko'rsatish: YOQILGAN",
    btnShowAnswersOff: "Javoblarni ko'rsatish: O'CHIRILGAN","""

en_voice_new = """        secAnswersLabel: "Show correct answers to the student at the end of the test:",
        secVoiceTitle: "Voice Anti-Cheat Protection",
        secVoiceLabel: "Detect and block talking during the test:",
        btnVoiceOn: "Voice protection: ON",
        btnVoiceOff: "Voice protection: OFF",
    btnShowAnswersOn: "Show answers: ON",
    btnShowAnswersOff: "Show answers: OFF","""

lang = lang.replace(en_voice_old, en_voice_new)

with open('lang.js', 'w', encoding='utf-8') as f:
    f.write(lang)

print("lang.js fixed successfully!")
