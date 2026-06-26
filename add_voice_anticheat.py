import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add voice anti-cheat functions at the end of the file
voice_logic = """
// Voice Anti-Cheat Logic
let speechRecognitionObj = null;

function startVoiceAntiCheat() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn("SpeechRecognition API ishlamaydi (Balki Safari yoki eski brauzer).");
        return;
    }
    
    speechRecognitionObj = new SpeechRecognition();
    speechRecognitionObj.continuous = true;
    speechRecognitionObj.interimResults = true;
    speechRecognitionObj.lang = 'uz-UZ';

    speechRecognitionObj.onresult = (event) => {
        if (isLocked) return;
        
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
        }
        
        if (transcript.trim().length > 0) {
            triggerVoiceLock();
        }
    };
    
    speechRecognitionObj.onerror = (event) => {
        console.error("SpeechRecognition xatosi:", event.error);
    };

    speechRecognitionObj.onend = () => {
        if (currentScreen === 'quiz' && !isLocked && isTestActive) {
            try { speechRecognitionObj.start(); } catch(e) {}
        }
    };
    
    try {
        speechRecognitionObj.start();
    } catch(e) {
        console.error("Mic start failed", e);
    }
}

function stopVoiceAntiCheat() {
    if (speechRecognitionObj) {
        speechRecognitionObj.onend = null;
        try { speechRecognitionObj.stop(); } catch(e) {}
    }
}

function triggerVoiceLock() {
    if (!isTestActive) return;
    isLocked = true;
    const lockScreen = document.getElementById('lock-screen');
    const lockReasonText = document.getElementById('lockReasonText');
    if (lockReasonText) {
        lockReasonText.textContent = "Ovoz aniqlandi! Test paytida gaplashish taqiqlanadi.";
    }
    if (lockScreen) lockScreen.classList.remove('hidden');
}
"""

if "startVoiceAntiCheat" not in content:
    content += "\n" + voice_logic

# 2. Add startVoiceAntiCheat() in beginTestBtn listener
begin_test_pattern = r"(isTestActive = true;\s*document\.addEventListener\('visibilitychange', handleCheating\);)"
content = re.sub(begin_test_pattern, r"\1\n        startVoiceAntiCheat();", content)

# 3. Add stopVoiceAntiCheat() in finishQuiz()
finish_quiz_pattern = r"(isTestActive = false;\s*document\.removeEventListener\('visibilitychange', handleCheating\);)"
content = re.sub(finish_quiz_pattern, r"\1\n    stopVoiceAntiCheat();", content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)

# Update index.html to add lockReasonText ID
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Finding the specific <p> tag inside lock-screen
html = re.sub(r'(<p class="admin-note" data-i18n="lockAdminNote">Siz test qoidalarini buzgansiz!)', r'<p id="lockReasonText" data-i18n="lockWarningText" style="color: #ef4444; font-weight: bold; font-size: 1.1rem; margin-bottom: 15px;"></p>\n                  \1', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Voice Anti-Cheat applied successfully!")
