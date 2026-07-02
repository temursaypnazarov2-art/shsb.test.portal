import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# I will find the block:
#                   </div>
#   
#                   
#                         <div class="settings-card" style="margin-top: 20px;">
#                             <h3 data-i18n="secVoiceTitle">Ovozli Anti-Cheat Himoyasi (Mikrofon)</h3>
# ...
#                                       </label>
#                                   </div>
#                               </div>
#                         </div>

# And move it inside tab-security.

pattern = re.compile(r'(\s*)</div>(\s*)(<div class="settings-card" style="margin-top: 20px;">\s*<h3 data-i18n="secVoiceTitle">Ovozli Anti-Cheat Himoyasi \(Mikrofon\).*?</div>\s*</div>\s*</div>)', re.DOTALL)

def repl(match):
    # match.group(1) is the whitespace before </div>
    # match.group(2) is the whitespace between </div> and the settings-card
    # match.group(3) is the settings-card itself
    
    # We want to put the settings card BEFORE the </div>
    return f'\n{match.group(3)}\n{match.group(1)}</div>'

new_html = pattern.sub(repl, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)
