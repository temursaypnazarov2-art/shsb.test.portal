import re

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Look for the currentScreen === 'admin' block inside syncFromFirebase
old_code = """            if (currentScreen === 'admin') {
                populateClassFilters();
                renderResultsTable();
                renderQuestions();
                checkActiveToken();
                loadAdminPinFields(adminActiveQuarter);"""

new_code = """            if (currentScreen === 'admin') {
                populateClassFilters();
                renderResultsTable();
                renderQuestions();
                checkActiveToken();
                loadAdminPinFields(adminActiveQuarter);
                if (typeof renderTeacherTokens === 'function') renderTeacherTokens();"""

if old_code in js:
    js = js.replace(old_code, new_code)
    print("Replaced successfully!")
else:
    print("Could not find the exact block to replace. Please check.")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js)
