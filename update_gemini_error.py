import re

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace the json handling part
old_code = """        const json = await res.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "Tahlil natijasi olinmadi.";
        if (geminiLoading) geminiLoading.style.display = 'none';
        if (geminiAnalysisOutput) {
            geminiAnalysisOutput.style.display = 'block';
            geminiAnalysisOutput.innerHTML = parseMarkdownToHtml(text);
        }
        if (downloadGeminiPdfBtn) downloadGeminiPdfBtn.classList.remove('hidden');"""

new_code = """        const json = await res.json();
        if (geminiLoading) geminiLoading.style.display = 'none';
        
        if (json.error) {
            if (geminiAnalysisOutput) {
                geminiAnalysisOutput.style.display = 'block';
                geminiAnalysisOutput.innerHTML = `<div style="color:red; font-weight:bold;">API Xatosi: ${json.error.message}</div>`;
            }
            return;
        }

        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "Tahlil natijasi olinmadi.";
        if (geminiAnalysisOutput) {
            geminiAnalysisOutput.style.display = 'block';
            geminiAnalysisOutput.innerHTML = parseMarkdownToHtml(text);
        }
        if (downloadGeminiPdfBtn && json?.candidates?.[0]?.content?.parts?.[0]?.text) {
            downloadGeminiPdfBtn.classList.remove('hidden');
        }"""

js = js.replace(old_code, new_code)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Updated script.js to show API errors.")
