import re

filepath = "script.js"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace any remaining quiz_show_answers
content = content.replace("localStorage.setItem('quiz_show_answers', showAnswersToStudent);", "if (database) database.ref('showAnswersToStudent').set(showAnswersToStudent);")

# Replace any remaining quiz_subject_pins_db (likely inside the old block or something)
content = content.replace("localStorage.setItem('quiz_subject_pins_db', JSON.stringify(subjectPinsDatabase));", "if (database) database.ref('subjectPinsDatabase').set(subjectPinsDatabase);")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Remaining localStorage usages cleaned up.")
