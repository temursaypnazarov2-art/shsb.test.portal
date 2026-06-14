import re

filepath = "script.js"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

old_settings_block = """    localStorage.setItem('quiz_duration', quizDuration.toString());
    localStorage.setItem('tg_bot_token', tgBotToken);
    localStorage.setItem('tg_chat_id', tgChatId);"""

new_settings_block = """    if (database) {
        database.ref('quizDuration').set(quizDuration);
        database.ref('tgBotToken').set(tgBotToken);
        database.ref('tgChatId').set(tgChatId);
    }"""

if old_settings_block in content:
    content = content.replace(old_settings_block, new_settings_block)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("saveSettings fixed!")
else:
    print("Could not find the localStorage block in saveSettings.")
