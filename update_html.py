import re

def update_html():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()
    
    # 1. Add custom subjects container and add form inside subject-pin-settings
    if 'id=\"custom-subjects-container\"' not in html:
        target = r'(<div class=\"subject-pin-settings\".*?>.*?)(</div>\s*</div>\s*<!-- Teacher Authorizations Generator -->)'
        
        adder = '''
                        <div id="custom-subjects-container" style="display: flex; flex-direction: column; gap: 10px;"></div>
                        <div class="custom-subject-adder" style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--accent-color);">
                            <label style="display:block; margin-bottom:5px;">Yangi fan qo'shish:</label>
                            <div style="display: flex; gap: 10px;">
                                <input type="text" id="new-custom-subject-name" placeholder="Masalan: Chaqiriqqacha tayyorgarlik" style="flex: 1; padding: 10px; border-radius: 8px;">
                                <button id="btn-add-custom-subject" class="primary-btn" style="padding: 10px 20px;">Qo'shish</button>
                            </div>
                        </div>'''
        
        # We need to find the exact place to insert.
        # It's at the end of the <div class="subject-pin-settings"> ... </div> which is inside settings-card.
        # Let's search for "pin-biologiya" to locate the end of the predefined subjects.
        
        if 'id=\"pin-biologiya\"' in html:
            parts = html.split('id=\"dur-biologiya\"></div>\n                            </div>')
            if len(parts) == 2:
                html = parts[0] + 'id=\"dur-biologiya\"></div>\n                            </div>' + adder + parts[1]
                
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print("HTML updated.")
    else:
        print("HTML already contains custom subjects container.")

update_html()
