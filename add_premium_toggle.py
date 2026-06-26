import re

# Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# CSS for premium toggle switch
premium_toggle_css = """
      .premium-toggle {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 28px;
          margin-left: 15px;
      }
      .premium-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
      }
      .premium-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 34px;
      }
      .premium-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      }
      input:checked + .premium-slider {
          background-color: #10b981;
      }
      input:checked + .premium-slider:before {
          transform: translateX(22px);
      }
"""

if '.premium-toggle' not in html:
    html = html.replace('</style>', f'{premium_toggle_css}</style>')

# Replace the old button with the new premium toggle
old_btn = r'<button id="toggleVoiceAntiCheatBtn" class="settings-btn" style="background-color: #ef4444; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; border: none; transition: 0\.3s;" data-i18n="btnVoiceOff">Ovozli himoya: O\'CHIRILGAN</button>'

new_toggle = """<div style="display: flex; align-items: center;">
                                    <span id="voiceAntiCheatStatusText" style="font-weight: bold; color: #ef4444;" data-i18n="btnVoiceOff">Ovozli himoya: O'CHIRILGAN</span>
                                    <label class="premium-toggle">
                                        <input type="checkbox" id="toggleVoiceAntiCheatBtn">
                                        <span class="premium-slider"></span>
                                    </label>
                                </div>"""

html = re.sub(old_btn, new_toggle, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# Update script.js
with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace updateVoiceAntiCheatBtnUI logic
old_ui_logic = """function updateVoiceAntiCheatBtnUI() {
    if (!toggleVoiceAntiCheatBtn) return;
    if (isVoiceAntiCheatEnabled) {
        toggleVoiceAntiCheatBtn.style.backgroundColor = '#10b981';
        toggleVoiceAntiCheatBtn.textContent = translations[currentLang] && translations[currentLang]['btnVoiceOn'] ? translations[currentLang]['btnVoiceOn'] : "Ovozli himoya: YONIQ";
    } else {
        toggleVoiceAntiCheatBtn.style.backgroundColor = '#ef4444';
        toggleVoiceAntiCheatBtn.textContent = translations[currentLang] && translations[currentLang]['btnVoiceOff'] ? translations[currentLang]['btnVoiceOff'] : "Ovozli himoya: O'CHIRILGAN";
    }
}"""

new_ui_logic = """const voiceAntiCheatStatusText = document.getElementById('voiceAntiCheatStatusText');
function updateVoiceAntiCheatBtnUI() {
    if (!toggleVoiceAntiCheatBtn) return;
    toggleVoiceAntiCheatBtn.checked = isVoiceAntiCheatEnabled;
    if (voiceAntiCheatStatusText) {
        if (isVoiceAntiCheatEnabled) {
            voiceAntiCheatStatusText.style.color = '#10b981';
            voiceAntiCheatStatusText.textContent = translations[currentLang] && translations[currentLang]['btnVoiceOn'] ? translations[currentLang]['btnVoiceOn'] : "Ovozli himoya: YONIQ";
        } else {
            voiceAntiCheatStatusText.style.color = '#ef4444';
            voiceAntiCheatStatusText.textContent = translations[currentLang] && translations[currentLang]['btnVoiceOff'] ? translations[currentLang]['btnVoiceOff'] : "Ovozli himoya: O'CHIRILGAN";
        }
    }
}"""

js = js.replace(old_ui_logic, new_ui_logic)

# Replace the click listener with a change listener on checkbox
old_listener = """if (toggleVoiceAntiCheatBtn) {
    toggleVoiceAntiCheatBtn.addEventListener('click', () => {
        isVoiceAntiCheatEnabled = !isVoiceAntiCheatEnabled;
        if (database) {
            database.ref('isVoiceAntiCheatEnabled').set(isVoiceAntiCheatEnabled);
        }
        updateVoiceAntiCheatBtnUI();
        alert(isVoiceAntiCheatEnabled ? "Ovozli himoya tizimi yoqildi!" : "Ovozli himoya tizimi o'chirildi!");
    });
}"""

new_listener = """if (toggleVoiceAntiCheatBtn) {
    toggleVoiceAntiCheatBtn.addEventListener('change', (e) => {
        isVoiceAntiCheatEnabled = e.target.checked;
        if (database) {
            database.ref('isVoiceAntiCheatEnabled').set(isVoiceAntiCheatEnabled);
        }
        updateVoiceAntiCheatBtnUI();
        console.log(isVoiceAntiCheatEnabled ? "Ovozli Anti-Cheat yoqildi" : "Ovozli Anti-Cheat o'chirildi");
    });
}"""

js = js.replace(old_listener, new_listener)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Premium toggle switch implemented.")
