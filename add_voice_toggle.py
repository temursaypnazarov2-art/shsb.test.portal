import re

# 1. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_security_card = """
                      <div class="settings-card" style="margin-top: 20px;">
                          <h3 data-i18n="secVoiceTitle">Ovozli Anti-Cheat Himoyasi (Mikrofon)</h3>
                          <div class="settings-group" style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px;">
                                <span style="font-weight: 600;" data-i18n="secVoiceLabel">Test paytida gaplashishni aniqlash va bloklash:</span>
                                <button id="toggleVoiceAntiCheatBtn" class="settings-btn" style="background-color: #ef4444; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; border: none; transition: 0.3s;" data-i18n="btnVoiceOff">Ovozli himoya: O'CHIRILGAN</button>
                            </div>
                      </div>
"""
html = html.replace('</div>\n                  </div>\n\n                  <!-- QR Code Tab -->', f'</div>\n{new_security_card}                  </div>\n\n                  <!-- QR Code Tab -->')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)


# 2. Update script.js
with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Add global var
js = js.replace('let showAnswersToStudent = false;', 'let showAnswersToStudent = false;\nlet isVoiceAntiCheatEnabled = false;')

# Add to syncFromFirebase
js = js.replace('if (data.showAnswersToStudent !== undefined) showAnswersToStudent = data.showAnswersToStudent;', 'if (data.showAnswersToStudent !== undefined) showAnswersToStudent = data.showAnswersToStudent;\n            if (data.isVoiceAntiCheatEnabled !== undefined) isVoiceAntiCheatEnabled = data.isVoiceAntiCheatEnabled;\n            updateVoiceAntiCheatBtnUI();')

# Update startVoiceAntiCheat
js = js.replace('function startVoiceAntiCheat() {\n    const SpeechRecognition', 'function startVoiceAntiCheat() {\n    if (!isVoiceAntiCheatEnabled) return;\n    const SpeechRecognition')

# Add UI handler
ui_handler = """
// Voice Anti-Cheat Toggle Logic
const toggleVoiceAntiCheatBtn = document.getElementById('toggleVoiceAntiCheatBtn');

function updateVoiceAntiCheatBtnUI() {
    if (!toggleVoiceAntiCheatBtn) return;
    if (isVoiceAntiCheatEnabled) {
        toggleVoiceAntiCheatBtn.style.backgroundColor = '#10b981';
        toggleVoiceAntiCheatBtn.textContent = translations[currentLang] && translations[currentLang]['btnVoiceOn'] ? translations[currentLang]['btnVoiceOn'] : "Ovozli himoya: YONIQ";
    } else {
        toggleVoiceAntiCheatBtn.style.backgroundColor = '#ef4444';
        toggleVoiceAntiCheatBtn.textContent = translations[currentLang] && translations[currentLang]['btnVoiceOff'] ? translations[currentLang]['btnVoiceOff'] : "Ovozli himoya: O'CHIRILGAN";
    }
}

if (toggleVoiceAntiCheatBtn) {
    toggleVoiceAntiCheatBtn.addEventListener('click', () => {
        isVoiceAntiCheatEnabled = !isVoiceAntiCheatEnabled;
        if (database) {
            database.ref('isVoiceAntiCheatEnabled').set(isVoiceAntiCheatEnabled);
        }
        updateVoiceAntiCheatBtnUI();
        alert(isVoiceAntiCheatEnabled ? "Ovozli himoya tizimi yoqildi!" : "Ovozli himoya tizimi o'chirildi!");
    });
}
"""

js += f"\n{ui_handler}"

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js)

# 3. Update lang.js translations
with open('lang.js', 'r', encoding='utf-8') as f:
    lang = f.read()

lang = lang.replace('secAnswersLabel: "Test yakunida to\'g\'ri javoblarni o\'quvchiga ko\'rsatish:",', 'secAnswersLabel: "Test yakunida to\'g\'ri javoblarni o\'quvchiga ko\'rsatish:",\n        secVoiceTitle: "Ovozli Anti-Cheat Himoyasi",\n        secVoiceLabel: "Test paytida gaplashishni aniqlash va bloklash:",\n        btnVoiceOn: "Ovozli himoya: YONIQ",\n        btnVoiceOff: "Ovozli himoya: O\'CHIRILGAN",')
lang = lang.replace('secAnswersLabel: "Test juwmaqlarında tuwrı juwaplardı oqıwshıģa kórsetiw:",', 'secAnswersLabel: "Test juwmaqlarında tuwrı juwaplardı oqıwshıģa kórsetiw:",\n        secVoiceTitle: "Dawıslı Anti-Cheat Qorǵawı",\n        secVoiceLabel: "Test waqtında sóylesiwdi anıqlaw hám bloklaw:",\n        btnVoiceOn: "Dawıslı qorǵaw: JANIQ",\n        btnVoiceOff: "Dawıslı qorǵaw: ÓSHIRILGEN",')
lang = lang.replace('secAnswersLabel: "Show correct answers to student at the end of test:",', 'secAnswersLabel: "Show correct answers to student at the end of test:",\n        secVoiceTitle: "Voice Anti-Cheat Protection",\n        secVoiceLabel: "Detect and block talking during the test:",\n        btnVoiceOn: "Voice protection: ON",\n        btnVoiceOff: "Voice protection: OFF",')

with open('lang.js', 'w', encoding='utf-8') as f:
    f.write(lang)

print("Voice Anti-Cheat toggle added successfully!")
