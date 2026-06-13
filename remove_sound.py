import os

filepath = "script.js"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

trigger_lock_orig = """function triggerLock() {
    blockCount++;
    isLocked = true;
    clearInterval(timerInterval);
    lockScreen.classList.remove('hidden');
    playSound('wrong');"""

trigger_lock_new = """function triggerLock() {
    blockCount++;
    isLocked = true;
    clearInterval(timerInterval);
    lockScreen.classList.remove('hidden');
    // playSound('wrong'); // Ovoz olib tashlandi"""

if trigger_lock_orig in content:
    content = content.replace(trigger_lock_orig, trigger_lock_new)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("playSound removed from triggerLock")
else:
    print("Could not find exact block. Searching more flexibly...")
    # fallback
    parts = content.split("function triggerLock()")
    if len(parts) > 1:
        func_body = parts[1].split("}")[0]
        if "playSound('wrong');" in func_body:
            new_body = func_body.replace("playSound('wrong');", "// playSound('wrong');")
            content = parts[0] + "function triggerLock()" + new_body + "}" + "}".join(parts[1].split("}")[1:])
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print("playSound removed from triggerLock (fallback)")
        else:
            print("playSound not found inside triggerLock")
