import os
import re

# 1. Update index.html
html_path = "index.html"
with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

firebase_scripts = """    <!-- Firebase App (the core Firebase SDK) -->
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
    <!-- Firebase Realtime Database -->
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
</head>"""

if "firebase-app-compat" not in html_content:
    html_content = html_content.replace("</head>", firebase_scripts)
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print("index.html updated with Firebase SDKs.")


# 2. Update script.js
js_path = "script.js"
with open(js_path, "r", encoding="utf-8") as f:
    js_content = f.read()

# Replace variables block at the top
old_vars_pattern = re.compile(r"// Load from LocalStorage[\s\S]*?let currentScreen = 'auth';", re.MULTILINE)

new_vars = """// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyD8CslmUKi6d-QODM6oOxC1CulrOh9Icvc",
  authDomain: "shsbtestportal.firebaseapp.com",
  projectId: "shsbtestportal",
  storageBucket: "shsbtestportal.firebasestorage.app",
  messagingSenderId: "371730937594",
  appId: "1:371730937594:web:32fd072b4bc3e007237b43",
  measurementId: "G-432GG1SSCR",
  databaseURL: "https://shsbtestportal-default-rtdb.firebaseio.com"
};

let app, database;
try {
  app = firebase.initializeApp(firebaseConfig);
  database = firebase.database();
} catch(e) {
  console.error("Firebase init error", e);
}

// Global Variables
let questionsDatabase = { "1": [], "2": [], "3": [], "4": [] };
let resultsDatabase = { "1": [], "2": [], "3": [], "4": [] };
let quizDuration = 20;
let tgBotToken = "";
let tgChatId = "";
let subjectPinsDatabase = {};
let subjectDurationsDatabase = {};
let subjectTestTypesDatabase = {};
let subjectUnblockPinsDatabase = {};
let subjectClassesDatabase = {};
let subjectQuarters = {};
let adminActiveQuarter = "1";
let teacherTokens = [];
let showAnswersToStudent = false;
let geminiApiKey = localStorage.getItem('gemini_api_key') || ""; // Keep AI key local for privacy
let currentTeacherSession = null;
let currentScreen = 'auth';

// --- Firebase Sync Logic ---
function syncFromFirebase() {
    if (!database) return;
    database.ref('/').on('value', snapshot => {
        const data = snapshot.val();
        if (data) {
            if (data.questionsDatabase) questionsDatabase = data.questionsDatabase;
            if (data.resultsDatabase) resultsDatabase = data.resultsDatabase;
            if (data.quizDuration !== undefined) quizDuration = data.quizDuration;
            if (data.tgBotToken) tgBotToken = data.tgBotToken;
            if (data.tgChatId) tgChatId = data.tgChatId;
            if (data.subjectPinsDatabase) subjectPinsDatabase = data.subjectPinsDatabase;
            if (data.subjectDurationsDatabase) subjectDurationsDatabase = data.subjectDurationsDatabase;
            if (data.subjectTestTypesDatabase) subjectTestTypesDatabase = data.subjectTestTypesDatabase;
            if (data.subjectUnblockPinsDatabase) subjectUnblockPinsDatabase = data.subjectUnblockPinsDatabase;
            if (data.subjectClassesDatabase) subjectClassesDatabase = data.subjectClassesDatabase;
            if (data.subjectQuarters) subjectQuarters = data.subjectQuarters;
            if (data.adminActiveQuarter) adminActiveQuarter = data.adminActiveQuarter;
            if (data.teacherTokens) teacherTokens = data.teacherTokens || [];
            if (data.showAnswersToStudent !== undefined) showAnswersToStudent = data.showAnswersToStudent;

            ensureSubjectQuarterMaps();
            questions = questionsDatabase[adminActiveQuarter] || [];
            
            // Re-render UI based on current screen
            if (currentScreen === 'admin') {
                populateClassFilters();
                renderResultsTable();
                renderQuestions();
                checkActiveToken();
                loadAdminPinFields(adminActiveQuarter);
                
                const showAnsToggle = document.getElementById('showAnswersToggle');
                if (showAnsToggle) showAnsToggle.checked = showAnswersToStudent;
                const setQ = document.getElementById('admin-settings-quarter');
                if (setQ) setQ.value = adminActiveQuarter;
            } else if (currentScreen === 'leaderboard') {
                renderLeaderboard();
            }
        } else {
            // Initial seed if Firebase is empty
            ensureSubjectQuarterMaps();
            seedDefaultQuestions();
            saveAllToFirebase();
        }
    });
}

function saveAllToFirebase() {
    if (!database) return;
    database.ref('/').set({
        questionsDatabase,
        resultsDatabase,
        quizDuration,
        tgBotToken,
        tgChatId,
        subjectPinsDatabase,
        subjectDurationsDatabase,
        subjectTestTypesDatabase,
        subjectUnblockPinsDatabase,
        subjectClassesDatabase,
        subjectQuarters,
        adminActiveQuarter,
        teacherTokens,
        showAnswersToStudent
    });
}
"""

js_content = old_vars_pattern.sub(new_vars, js_content)

# Replace saveFunctions
save_funcs_replace = {
    """function saveQuestions() {
    localStorage.setItem('questions_q1', JSON.stringify(questionsDatabase["1"] || []));
    localStorage.setItem('questions_q2', JSON.stringify(questionsDatabase["2"] || []));
    localStorage.setItem('questions_q3', JSON.stringify(questionsDatabase["3"] || []));
    localStorage.setItem('questions_q4', JSON.stringify(questionsDatabase["4"] || []));
}""": """function saveQuestions() {
    if (database) database.ref('questionsDatabase').set(questionsDatabase);
}""",

    """function saveResults() {
    localStorage.setItem('results_q1', JSON.stringify(resultsDatabase["1"] || []));
    localStorage.setItem('results_q2', JSON.stringify(resultsDatabase["2"] || []));
    localStorage.setItem('results_q3', JSON.stringify(resultsDatabase["3"] || []));
    localStorage.setItem('results_q4', JSON.stringify(resultsDatabase["4"] || []));
}""": """function saveResults() {
    if (database) database.ref('resultsDatabase').set(resultsDatabase);
}""",

    """function saveSettings(duration, token, chatId) {
    localStorage.setItem('quiz_duration', quizDuration.toString());
    localStorage.setItem('tg_bot_token', tgBotToken);
    localStorage.setItem('tg_chat_id', tgChatId);
    if (geminiApiKey) {
        localStorage.setItem('gemini_api_key', geminiApiKey);
    } else {
        localStorage.removeItem('gemini_api_key');
    }
}""": """function saveSettings(duration, token, chatId) {
    if (database) {
        database.ref('quizDuration').set(quizDuration);
        database.ref('tgBotToken').set(tgBotToken);
        database.ref('tgChatId').set(tgChatId);
    }
    if (geminiApiKey) {
        localStorage.setItem('gemini_api_key', geminiApiKey);
    } else {
        localStorage.removeItem('gemini_api_key');
    }
}""",

    """function saveTeacherTokens() {
    localStorage.setItem('quiz_teacher_tokens', JSON.stringify(teacherTokens));
}""": """function saveTeacherTokens() {
    if (database) database.ref('teacherTokens').set(teacherTokens);
}""",

    """function saveAdminPinFields(quarter) {
    ensureSubjectQuarterMaps();
    SUBJECTS.forEach((subj, index) => {
        const el = document.getElementById(PIN_INPUT_IDS[index]);
        const durEl = document.getElementById(DUR_INPUT_IDS[index]);
        if (el) subjectPinsDatabase[subj][quarter] = el.value.trim();
        if (durEl) subjectDurationsDatabase[subj][quarter] = parseInt(durEl.value, 10) || 20;
    });
    localStorage.setItem('quiz_subject_pins_db', JSON.stringify(subjectPinsDatabase));
    localStorage.setItem('quiz_subject_durations_db', JSON.stringify(subjectDurationsDatabase));
}""": """function saveAdminPinFields(quarter) {
    ensureSubjectQuarterMaps();
    SUBJECTS.forEach((subj, index) => {
        const el = document.getElementById(PIN_INPUT_IDS[index]);
        const durEl = document.getElementById(DUR_INPUT_IDS[index]);
        if (el) subjectPinsDatabase[subj][quarter] = el.value.trim();
        if (durEl) subjectDurationsDatabase[subj][quarter] = parseInt(durEl.value, 10) || 20;
    });
    if (database) {
        database.ref('subjectPinsDatabase').set(subjectPinsDatabase);
        database.ref('subjectDurationsDatabase').set(subjectDurationsDatabase);
    }
}""",
    
    """function setAdminActiveQuarter(quarter, syncSelectors = true) {
    adminActiveQuarter = quarter;
    localStorage.setItem('quiz_admin_quarter', quarter);
    if (!questionsDatabase[quarter]) questionsDatabase[quarter] = [];
    questions = questionsDatabase[quarter];
    if (syncSelectors) {
        const settingsQ = document.getElementById('admin-settings-quarter');
        const questionsQ = document.getElementById('admin-questions-quarter');
        if (settingsQ) settingsQ.value = quarter;
        if (questionsQ) questionsQ.value = quarter;
    }
}""": """function setAdminActiveQuarter(quarter, syncSelectors = true) {
    adminActiveQuarter = quarter;
    if (database) database.ref('adminActiveQuarter').set(quarter);
    if (!questionsDatabase[quarter]) questionsDatabase[quarter] = [];
    questions = questionsDatabase[quarter];
    if (syncSelectors) {
        const settingsQ = document.getElementById('admin-settings-quarter');
        const questionsQ = document.getElementById('admin-questions-quarter');
        if (settingsQ) settingsQ.value = quarter;
        if (questionsQ) questionsQ.value = quarter;
    }
}"""
}

for old_s, new_s in save_funcs_replace.items():
    if old_s in js_content:
        js_content = js_content.replace(old_s, new_s)
    else:
        print(f"Warning: Could not find exact match for: {old_s[:50]}...")

# Update showAnswers toggle to use database
show_ans_old = """    const showAnsToggle = document.getElementById('showAnswersToggle');
    if (showAnsToggle) {
        showAnsToggle.checked = showAnswersToStudent;
        showAnsToggle.addEventListener('change', (e) => {
            showAnswersToStudent = e.target.checked;
            localStorage.setItem('quiz_show_answers', showAnswersToStudent);
        });
    }"""
show_ans_new = """    const showAnsToggle = document.getElementById('showAnswersToggle');
    if (showAnsToggle) {
        showAnsToggle.checked = showAnswersToStudent;
        showAnsToggle.addEventListener('change', (e) => {
            showAnswersToStudent = e.target.checked;
            if (database) database.ref('showAnswersToStudent').set(showAnswersToStudent);
        });
    }"""
if show_ans_old in js_content:
    js_content = js_content.replace(show_ans_old, show_ans_new)

# Subject detailed settings save functions
subj_settings_old_1 = """    localStorage.setItem('quiz_subject_pins_db', JSON.stringify(subjectPinsDatabase));
    localStorage.setItem('quiz_subject_durations_db', JSON.stringify(subjectDurationsDatabase));
    localStorage.setItem('quiz_subject_test_types_db', JSON.stringify(subjectTestTypesDatabase));
    localStorage.setItem('quiz_subject_unblock_pins_db', JSON.stringify(subjectUnblockPinsDatabase));
    localStorage.setItem('quiz_subject_classes_db', JSON.stringify(subjectClassesDatabase));
    localStorage.setItem('quiz_subject_quarters', JSON.stringify(subjectQuarters));"""
subj_settings_new_1 = """    if (database) {
        database.ref('subjectPinsDatabase').set(subjectPinsDatabase);
        database.ref('subjectDurationsDatabase').set(subjectDurationsDatabase);
        database.ref('subjectTestTypesDatabase').set(subjectTestTypesDatabase);
        database.ref('subjectUnblockPinsDatabase').set(subjectUnblockPinsDatabase);
        database.ref('subjectClassesDatabase').set(subjectClassesDatabase);
        database.ref('subjectQuarters').set(subjectQuarters);
    }"""

js_content = js_content.replace(subj_settings_old_1, subj_settings_new_1)

# Add syncFromFirebase to init
init_old = """function init() {
    seedDefaultQuestions();
    seedDefaultPins();"""
init_new = """function init() {
    syncFromFirebase();
    seedDefaultPins();"""
js_content = js_content.replace(init_old, init_new)

with open(js_path, "w", encoding="utf-8") as f:
    f.write(js_content)
print("script.js updated with Firebase sync logic.")
