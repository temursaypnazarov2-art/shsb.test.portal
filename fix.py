import re

def fix_script():
    with open('script.js', 'r', encoding='utf-8') as f:
        js = f.read()
    
    sync_logic = '''            if (data.customSubjects) {
                customSubjects = Array.isArray(data.customSubjects) ? data.customSubjects : Object.values(data.customSubjects);
            } else {
                customSubjects = [];
            }
            syncCustomSubjectsUI();
            
            ensureSubjectQuarterMaps();'''
            
    # Replace all occurrences of the mistakenly duplicated logic back to just ensureSubjectQuarterMaps();
    js = js.replace(sync_logic, 'ensureSubjectQuarterMaps();')
    
    # Now, explicitly insert it ONLY inside syncFromFirebase
    # Let's find syncFromFirebase(data) {
    
    if 'function syncFromFirebase(data) {' in js:
        parts = js.split('function syncFromFirebase(data) {')
        if len(parts) == 2:
            # Inside syncFromFirebase, find the FIRST ensureSubjectQuarterMaps();
            subparts = parts[1].split('ensureSubjectQuarterMaps();', 1)
            if len(subparts) == 2:
                parts[1] = subparts[0] + sync_logic + subparts[1]
                js = parts[0] + 'function syncFromFirebase(data) {' + parts[1]
    
    with open('script.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print("Fixed script.js")

fix_script()
