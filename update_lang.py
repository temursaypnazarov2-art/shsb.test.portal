import re

with open('lang.js', 'r', encoding='utf-8') as f:
    lang = f.read()

def insert_after(pattern, insertion, text):
    return re.sub(f'({pattern})', r'\1' + '\n' + insertion, text)

lang = insert_after(r'btnCloseAI:\s*"Natijani yopish",', '        btnDownloadPdf: "PDF Yuklab Olish",\n        pdfTitle: "Pedagogik Tahlil va Tavsiyalar",\n        aiPromptUz: "Siz pedagogik tahlilchisiz. Quyidagi maktab test natijalarini o\'zbek tilida qisqa tahlil qiling va o\'qituvchiga tavsiyalar bering:\\n",', lang)

lang = insert_after(r'btnCloseAI:\s*"N.*tiyjeni jab.*?w",', '        btnDownloadPdf: "PDF Jüklep Alıw",\n        pdfTitle: "Pedagogikalıq Analiz hám Usınıslar",\n        aiPromptQq: "Siz pedagogikalıq analizshisiz. Tómendegi mektep test nátiyjelerin qaraqalpaq tilinde qısqa analiz etiń hám muallimge usınıslar beriń:\\n",', lang)

lang = insert_after(r'btnCloseAI:\s*"Close Result",', '        btnDownloadPdf: "Download PDF",\n        pdfTitle: "Pedagogical Analysis & Recommendations",\n        aiPromptEn: "You are a pedagogical analyst. Please provide a brief pedagogical analysis and recommendations for the teacher in English based on the following school test results:\\n",', lang)

with open('lang.js', 'w', encoding='utf-8') as f:
    f.write(lang)

print("lang.js updated!")
