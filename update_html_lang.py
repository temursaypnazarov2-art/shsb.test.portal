import re

# Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

if 'html2pdf' not in html:
    html = html.replace('<!-- Include Docx Parser Library -->', '<!-- Include html2pdf Library -->\n      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>\n      <!-- Include Docx Parser Library -->')

# Add PDF Download Button to Gemini Overlay
new_buttons = """<div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  <button id="close-gemini-btn" class="danger-btn" data-i18n="btnCloseAI" style="flex: 1;">Natijani yopish</button>
                  <button id="download-gemini-pdf-btn" class="primary-btn hidden" data-i18n="btnDownloadPdf" style="flex: 1; background: #8b5cf6;">PDF Yuklab Olish</button>
              </div>"""

html = re.sub(r'<button id="close-gemini-btn" class="danger-btn" data-i18n="btnCloseAI" style="width: 100%;">.*?</button>', new_buttons, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# Update lang.js
with open('lang.js', 'r', encoding='utf-8') as f:
    lang = f.read()

# Uzbek
lang = lang.replace('btnCloseAI: "Natijani yopish",', 'btnCloseAI: "Natijani yopish",\n        btnDownloadPdf: "PDF Yuklab Olish",\n        pdfTitle: "Pedagogik Tahlil va Tavsiyalar",\n        aiPromptUz: "Siz pedagogik tahlilchisiz. Quyidagi maktab test natijalarini o\'zbek tilida qisqa tahlil qiling va o\'qituvchiga tavsiyalar bering:\\n",')

# Karakalpak
lang = lang.replace('btnCloseAI: "Ntiyjeni jab+w",', 'btnCloseAI: "Ntiyjeni jab+w",\n        btnDownloadPdf: "PDF Jklep Alw",\n        pdfTitle: "Pedagogikalq Analiz hm Usnslar",\n        aiPromptQq: "Siz pedagogikalq analizshisiz. Tmendegi mektep test ntiyjelerin qaraqalpaq tilinde qsqa analiz eti hm muallimge usnslar beri:\\n",')
# Wait, Qaraqalpoq is mangled in the original file (e.g. Ntiyjeni jab+w).
# I'll just use simple regex or replace strings carefully.
