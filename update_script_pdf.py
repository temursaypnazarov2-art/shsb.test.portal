import re

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Add download-gemini-pdf-btn variable at the top near gemini variables
if 'const downloadGeminiPdfBtn =' not in js:
    js = js.replace('const closeGeminiBtn = document.getElementById(\'close-gemini-btn\');', 'const closeGeminiBtn = document.getElementById(\'close-gemini-btn\');\nconst downloadGeminiPdfBtn = document.getElementById(\'download-gemini-pdf-btn\');')

# 2. Add event listener for the button
if 'downloadGeminiPdfBtn.addEventListener' not in js:
    js = js.replace('if (geminiAnalyzeBtn) geminiAnalyzeBtn.addEventListener(\'click\', runGeminiAnalysis);', 'if (geminiAnalyzeBtn) geminiAnalyzeBtn.addEventListener(\'click\', runGeminiAnalysis);\nif (downloadGeminiPdfBtn) downloadGeminiPdfBtn.addEventListener(\'click\', exportGeminiPDF);')

# 3. Update runGeminiAnalysis to be dynamic and show PDF button
old_prompt_logic = """    const summary = data.slice(0, 50).map(r =>
        `${r.name} (${r.class}), ${r.subject}, ${r.percentage}%`
    ).join('\\n');

    const prompt = `Siz pedagogik tahlilchisiz. Quyidagi maktab test natijalarini o'zbek tilida qisqa tahlil qiling:\\n${summary || "Natijalar yo'q"}`;"""

new_prompt_logic = """    const summary = data.slice(0, 50).map(r =>
        `${r.name} (${r.class}), ${r.subject}, ${r.percentage}%`
    ).join('\\n');

    let basePrompt = "Siz pedagogik tahlilchisiz. Quyidagi maktab test natijalarini o'zbek tilida qisqa tahlil qiling va o'qituvchiga tavsiyalar bering:\\n";
    if (currentLang === 'qq' && translations['qq'] && translations['qq']['aiPromptQq']) {
        basePrompt = translations['qq']['aiPromptQq'];
    } else if (currentLang === 'en' && translations['en'] && translations['en']['aiPromptEn']) {
        basePrompt = translations['en']['aiPromptEn'];
    } else if (translations['uz'] && translations['uz']['aiPromptUz']) {
        basePrompt = translations['uz']['aiPromptUz'];
    }

    const prompt = `${basePrompt}${summary || "Natijalar yo'q"}`;
    if (downloadGeminiPdfBtn) downloadGeminiPdfBtn.classList.add('hidden');"""

js = js.replace(old_prompt_logic, new_prompt_logic)

# 4. Show the PDF button when analysis succeeds
if 'if (downloadGeminiPdfBtn) downloadGeminiPdfBtn.classList.remove(\'hidden\');' not in js:
    js = js.replace('geminiAnalysisOutput.innerHTML = parseMarkdownToHtml(text);\n        }', 'geminiAnalysisOutput.innerHTML = parseMarkdownToHtml(text);\n        }\n        if (downloadGeminiPdfBtn) downloadGeminiPdfBtn.classList.remove(\'hidden\');')

# 5. Add exportGeminiPDF function
pdf_function = """
function exportGeminiPDF() {
    if (typeof html2pdf === 'undefined') {
        showToast("PDF kutubxonasi yuklanmagan!");
        return;
    }

    const reportContent = geminiAnalysisOutput.innerHTML;
    if (!reportContent || reportContent.trim() === '') {
        showToast("Yuklash uchun tahlil yo'q!");
        return;
    }

    const dateStr = new Date().toLocaleDateString(currentLang === 'uz' ? 'uz-UZ' : 'en-US');
    const teacherName = currentTeacherSession ? currentTeacherSession.subject + " O'qituvchisi" : "Asosiy Admin";
    const pdfTitleText = t('pdfTitle') || "Pedagogik Tahlil va Tavsiyalar";

    // Create a temporary hidden container for PDF generation to apply custom styling
    const pdfContainer = document.createElement('div');
    pdfContainer.style.padding = '30px';
    pdfContainer.style.fontFamily = 'Arial, sans-serif';
    pdfContainer.style.color = '#333';
    pdfContainer.style.background = '#fff';
    
    // Add School Logo placeholder or real logo if available
    // Currently using a text-based styled header
    pdfContainer.innerHTML = `
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 24px;">&#127891; Maktab Test Portali</h1>
            <h2 style="color: #4b5563; margin: 10px 0 0 0; font-size: 18px;">${pdfTitleText}</h2>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; color: #6b7280;">
            <span><strong>Sana:</strong> ${dateStr}</span>
            <span><strong>Hisobot egasi:</strong> ${teacherName}</span>
        </div>
        <div style="line-height: 1.6; font-size: 14px;">
            ${reportContent}
        </div>
        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 10px;">
            AI tomonidan avtomatik generatsiya qilingan - ${dateStr}
        </div>
    `;

    const opt = {
        margin:       10,
        filename:     `Tahlil_${dateStr.replace(/\\//g, '-')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const originalText = downloadGeminiPdfBtn.textContent;
    downloadGeminiPdfBtn.textContent = "Yuklanmoqda...";
    downloadGeminiPdfBtn.disabled = true;

    html2pdf().set(opt).from(pdfContainer).save().then(() => {
        downloadGeminiPdfBtn.textContent = originalText;
        downloadGeminiPdfBtn.disabled = false;
    }).catch(err => {
        console.error("PDF generation error:", err);
        showToast("PDF yaratishda xatolik yuz berdi");
        downloadGeminiPdfBtn.textContent = originalText;
        downloadGeminiPdfBtn.disabled = false;
    });
}
"""

if 'function exportGeminiPDF()' not in js:
    js += pdf_function

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("script.js updated with PDF and dynamic language logic!")
