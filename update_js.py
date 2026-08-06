import re

def update_js(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        js = f.read()
    
    # 1. Change const SUBJECTS to let SUBJECTS
    js = js.replace('const SUBJECTS = ', 'let SUBJECTS = ')
    js = js.replace('const PIN_INPUT_IDS = ', 'let PIN_INPUT_IDS = ')
    js = js.replace('const DUR_INPUT_IDS = ', 'let DUR_INPUT_IDS = ')
    
    # 2. Add customSubjects array and functions
    if 'let customSubjects = []' not in js:
        # Find where teacherTokens is declared and add customSubjects below it
        if 'let teacherTokens =' in js:
            js = js.replace('let teacherTokens =', 'let customSubjects = [];\nlet teacherTokens =', 1)
        
        # Add custom subject logic
        logic = '''
// CUSTOM SUBJECTS LOGIC
function generateSubjectId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function syncCustomSubjectsUI() {
    // 1. Update SUBJECTS and PIN arrays
    customSubjects.forEach(subj => {
        if (!SUBJECTS.includes(subj)) {
            SUBJECTS.push(subj);
            PIN_INPUT_IDS.push('pin-custom-' + generateSubjectId(subj));
            DUR_INPUT_IDS.push('dur-custom-' + generateSubjectId(subj));
        }
    });

    // 2. Render Pin Fields for Custom Subjects
    const container = document.getElementById('custom-subjects-container');
    if (container) {
        container.innerHTML = '';
        customSubjects.forEach(subj => {
            const safeId = generateSubjectId(subj);
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.gap = '10px';
            div.style.alignItems = 'center';
            div.innerHTML = 
                <div style="flex: 1;"><label>:</label><input type="text" id="pin-custom-"></div>
                <div style="flex: 1;"><label>Vaqt (daqiqa):</label><input type="number" id="dur-custom-"></div>
                <button class="danger-btn" onclick="deleteCustomSubject('')" style="padding: 10px; height: 42px; margin-top: 22px;">O'chirish</button>
            ;
            container.appendChild(div);
        });
    }

    // 3. Update Dropdowns
    const dropdowns = ['teacher-subject-select', 'new-q-subject', 'filter-subject', 'testTargetSubject'];
    dropdowns.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            // Remove old custom options
            Array.from(select.options).forEach(opt => {
                if (opt.classList.contains('custom-subj-option')) opt.remove();
            });
            // Add new ones
            customSubjects.forEach(subj => {
                const option = document.createElement('option');
                option.value = subj;
                option.textContent = subj;
                option.className = 'custom-subj-option';
                select.appendChild(option);
            });
        }
    });
}

function saveCustomSubjects() {
    if (typeof database !== 'undefined' && database) {
        database.ref('customSubjects').set(customSubjects);
    } else {
        localStorage.setItem('quiz_custom_subjects', JSON.stringify(customSubjects));
    }
}

function deleteCustomSubject(subjName) {
    if (confirm(Rostdan ham "" fanini o'chirmoqchimisiz?)) {
        customSubjects = customSubjects.filter(s => s !== subjName);
        
        // Remove from global arrays
        const idx = SUBJECTS.indexOf(subjName);
        if (idx > -1) {
            SUBJECTS.splice(idx, 1);
            PIN_INPUT_IDS.splice(idx, 1);
            DUR_INPUT_IDS.splice(idx, 1);
        }
        
        saveCustomSubjects();
        syncCustomSubjectsUI();
        if (typeof loadAdminPinFields === 'function') loadAdminPinFields(adminActiveQuarter);
        showToast("Fan o'chirildi!");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btnAddCustom = document.getElementById('btn-add-custom-subject');
    if (btnAddCustom) {
        btnAddCustom.addEventListener('click', () => {
            const input = document.getElementById('new-custom-subject-name');
            const newName = input.value.trim();
            if (!newName) return showToast("Fanning nomini kiriting!", "error");
            if (SUBJECTS.includes(newName)) return showToast("Bu fan allaqachon mavjud!", "error");
            
            customSubjects.push(newName);
            input.value = '';
            saveCustomSubjects();
            syncCustomSubjectsUI();
            if (typeof loadAdminPinFields === 'function') loadAdminPinFields(adminActiveQuarter);
            showToast("Yangi fan muvaffaqiyatli qo'shildi!");
        });
    }
});
'''
        js = js + '\n' + logic

    # 3. Handle Firebase sync in script.js
    if 'syncFromFirebase' in js:
        if 'data.customSubjects' not in js:
            sync_logic = '''
            if (data.customSubjects) {
                customSubjects = Array.isArray(data.customSubjects) ? data.customSubjects : Object.values(data.customSubjects);
            } else {
                customSubjects = [];
            }
            syncCustomSubjectsUI();
            '''
            js = js.replace('ensureSubjectQuarterMaps();', sync_logic + '\n            ensureSubjectQuarterMaps();')

    # 4. Handle LocalStorage in script_strict.js
    if 'JSON.parse(localStorage.getItem(' in js and 'script_strict' in filename:
        if 'quiz_custom_subjects' not in js:
            ls_logic = '''
try {
    const stored = JSON.parse(localStorage.getItem('quiz_custom_subjects'));
    if (Array.isArray(stored)) customSubjects = stored;
    else if (stored) customSubjects = Object.values(stored);
} catch(e) {}
document.addEventListener('DOMContentLoaded', () => {
    syncCustomSubjectsUI();
});
'''
            js = js.replace('let customSubjects = [];', 'let customSubjects = [];\n' + ls_logic)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(js)
    print(f"Updated {filename}")

update_js('script.js')
update_js('script_strict.js')
