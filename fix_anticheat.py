import os
import re

filepath = "script.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add isTestActive globally
if "let isTestActive = false;" not in content:
    content = content.replace("let currentScreen = 'auth';", "let currentScreen = 'auth';\nlet isTestActive = false;")

# 2. Modify triggerLock to clear timer
trigger_lock_orig = """function triggerLock() {
    blockCount++;
    isLocked = true;"""
trigger_lock_new = """function triggerLock() {
    blockCount++;
    isLocked = true;
    clearInterval(timerInterval);"""
if "clearInterval(timerInterval);" not in content.split("function triggerLock()")[1][:100]:
    content = content.replace(trigger_lock_orig, trigger_lock_new)

# 3. Modify unlockBtn to resume timer
unlock_orig = """if (pass === requiredPin || btoa(pass) === HASHED_ADMIN_PASS) {
        isLocked = false;
        lockScreen.classList.add('hidden');
        document.documentElement.requestFullscreen().catch(e => e);
    }"""
unlock_new = """if (pass === requiredPin || btoa(pass) === HASHED_ADMIN_PASS) {
        isLocked = false;
        lockScreen.classList.add('hidden');
        document.documentElement.requestFullscreen().catch(e => e);
        startTimer();
    }"""
content = content.replace(unlock_orig, unlock_new)

# 4. Remove old global listeners
content = re.sub(r"document\.addEventListener\('visibilitychange', \(\) => \{\s*if \(document\.hidden && currentScreen === 'quiz' && !isLocked\) \{\s*triggerLock\(\);\s*\}\s*\}\);\s*", "", content)
content = re.sub(r"window\.addEventListener\('blur', \(\) => \{\s*if \(currentScreen === 'quiz' && !isLocked\) \{\s*triggerLock\(\);\s*\}\s*\}\);\s*", "", content)

# 5. Add handleCheating function and beforeunload definition
handle_cheating_code = """
function handleCheating(e) {
    if (isTestActive && (document.hidden || (e && e.type === 'blur')) && !isLocked) {
        triggerLock();
    }
}

window.addEventListener('beforeunload', function (e) {
    if (isTestActive && !isLocked) {
        e.preventDefault();
        e.returnValue = "Siz testni tark etmoqchimisiz? Natijangiz saqlanmaydi yoki bloklanadi!";
        return e.returnValue;
    }
});
"""
if "function handleCheating(e)" not in content:
    content += "\n" + handle_cheating_code

# 6. Add to startBtn listener where it calls loadQuestion() and startTimer()
start_code_orig = """
    loadQuestion();
    document.documentElement.requestFullscreen().catch(e => e);
    startTimer();
"""
start_code_new = """
    isTestActive = true;
    document.addEventListener('visibilitychange', handleCheating);
    window.addEventListener('blur', handleCheating);
    loadQuestion();
    document.documentElement.requestFullscreen().catch(e => e);
    startTimer();
"""
if "isTestActive = true;" not in content.split("function loadQuestion()")[0][-500:]:
    content = content.replace(start_code_orig, start_code_new)

# 7. Add finish cleanup to finishQuiz
finish_orig = """function finishQuiz() {
    clearInterval(timerInterval);"""
finish_new = """function finishQuiz() {
    isTestActive = false;
    document.removeEventListener('visibilitychange', handleCheating);
    window.removeEventListener('blur', handleCheating);
    clearInterval(timerInterval);"""
if "isTestActive = false;" not in content.split("function finishQuiz()")[1][:100]:
    content = content.replace(finish_orig, finish_new)


with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("script.js updated")

# lang.js updates
with open("lang.js", "rb") as f:
    lang_content = f.read()

# UZ
lang_content = lang_content.replace(
    b'lockWarningText: "Tizimdan foydalanish qoidalari buzildi (ekran o\'zgartirildi yoki to\'liq ekran rejimidan chiqildi).",\r\n        lockAdminNote: "Siz test qoidalarini buzgansiz! Testni davom ettirish uchun o\'qituvchi parolini kiriting:",',
    'lockWarningText: "Siz test qoidasini buzgansiz! Test bloklandi.",\r\n        lockAdminNote: "Davom ettirish uchun o\'qituvchi parolini kiriting:",'.encode('utf-8')
)

# QQ
lang_content = lang_content.replace(
    b'lockWarningText: "Sistemadan paydalan\xc4\xb1w qa\xc7\xa5\xc4\xb1ydalar\xc4\xb1 buz\xc4\xb1ld\xc4\xb1 (ekran \xc3\xb3zgertildi yamasa tol\xc4\xb1q ekran rejiminen sh\xc4\xb1\xc7\xa5\xc4\xb1ld\xc4\xb1).",\r\n        lockAdminNote: "Siz test qa\xc7\xa5\xc4\xb1ydas\xc4\xb1n buzdi\xc5\x84\xc4\xb1z! Oq\xc4\xb1t\xc4\xb1wsh\xc4\xb1 parolin kiriti\xc5\x84:",',
    'lockWarningText: "Siz test qaǵıydasın buzdińız! Test bloklandı.",\r\n        lockAdminNote: "Dawam etiw ushın oqıtıwshı parolin kiritiń:",'.encode('utf-8')
)

with open("lang.js", "wb") as f:
    f.write(lang_content)

print("lang.js updated")
