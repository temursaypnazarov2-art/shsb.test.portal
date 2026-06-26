import re

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

# Replace '<!-- QR Code Tab -->' with the new card before it
html = html.replace('<!-- QR Code Tab -->', f'{new_security_card}\n                  <!-- QR Code Tab -->')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
