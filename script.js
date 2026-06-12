/**
 * shsb.test.portal - Script Logic with Docx, Telegram, Filters, Leaderboard, Canvas Cert & Audio
 * Author: Antigravity AI
 */

// --- Constants & Database ---
const HASHED_ADMIN_PASS = "YWRtaW4xMjNfc2hzYg==";
const GEMINI_API_KEY = "Sizning_API_Kalitingiz";

const defaultSavollar = [
    // --- Ona tili (5-11 sinf namunasi) ---
    { subject: "Ona tili", question: "18-bob. Fe'l nisbatlari nechta turga bo'linadi?", options: ["3 ta", "4 ta", "5 ta", "6 ta"], correct: 2, points: 2.0 },
    { subject: "Ona tili", question: "19-bob. Qo'shma gaplarning qanday turlari mavjud?", options: ["Bog'langan va ergashgan", "Sodda va murakkab", "To'liqsiz va to'liq", "Yoyiq va yig'iq"], correct: 0, points: 2.0 },
    { subject: "Ona tili", question: "20-bob. O'zlashtirma gap qanday qo'shtirnoq ichiga olinadi?", options: ["Sohibining so'zidan oldin", "Bosh harf bilan boshlanib qo'shtirnoqda beriladi", "Doim qavs ichida yoziladi", "Nuqtadan keyin ajratiladi"], correct: 1, points: 2.0 },

    // --- Matematika (5-11 sinf namunasi) ---
    { subject: "Matematika", question: "18-bob. Uchburchakning ichki burchaklari yig'indisi nimaga teng?", options: ["90°", "180°", "360°", "270°"], correct: 1, points: 3.0 },
    { subject: "Matematika", question: "19-bob. Kvadrat tenglamaning diskriminanti qanday topiladi?", options: ["D = b - 4ac", "D = b^2 - 4ac", "D = a^2 - 4bc", "D = c^2 - 4ab"], correct: 1, points: 3.0 },
    { subject: "Matematika", question: "20-bob. Agar log_2(x) = 3 bo'lsa, x nechaga teng?", options: ["6", "9", "8", "16"], correct: 2, points: 4.0 },

    // --- Fizika ---
    { subject: "Fizika", question: "18-bob. Nyutonning ikkinchi qonuni formulasi qaysi?", options: ["F = m*a", "E = m*c^2", "P = m*v", "A = F*S"], correct: 0, points: 3.0 },
    { subject: "Fizika", question: "19-bob. Yorug'lik tezligi vakuumda taxminan nechaga teng?", options: ["300,000 km/s", "150,000 km/s", "340 m/s", "3,000 km/s"], correct: 0, points: 3.0 },
    { subject: "Fizika", question: "20-bob. Om qonunining formulasi qanday?", options: ["I = U/R", "I = U*R", "U = I/R", "R = I*U"], correct: 0, points: 3.0 },

    // --- Kimyo ---
    { subject: "Kimyo", question: "18-bob. Suvning molekulyar formulasi qanday?", options: ["HO2", "H2O", "H2O2", "OH2"], correct: 1, points: 2.0 },
    { subject: "Kimyo", question: "19-bob. Mendeleyev davriy jadvalining 1-elementi nima?", options: ["Kislorod", "Uglerod", "Vodorod", "Geli"], correct: 2, points: 2.0 },

    // --- Biologiya ---
    { subject: "Biologiya", question: "18-bob. O'simliklarda fotosintez jarayoni qayerda kechadi?", options: ["Xloroplastlarda", "Mitoxondriyalarda", "Vakuolalarda", "Yadroda"], correct: 0, points: 3.0 },
    { subject: "Biologiya", question: "19-bob. Inson yuragi nechta kameradan iborat?", options: ["2 ta", "3 ta", "4 ta", "5 ta"], correct: 2, points: 3.0 },

    // --- Tarix ---
    { subject: "Tarix", question: "18-bob. Amir Temur qachon tug'ilgan?", options: ["1336-yil 9-aprel", "1441-yil 9-fevral", "1370-yil", "1501-yil"], correct: 0, points: 2.0 },
    { subject: "Tarix", question: "19-bob. Buxoro xonligi qachon amirlikka aylangan?", options: ["1500-yil", "1753-yil", "1868-yil", "1920-yil"], correct: 1, points: 3.0 },

    // --- Huquq ---
    { subject: "Huquq", question: "18-bob. O'zbekiston Respublikasining Konstitutsiyasi necha bo'limdan iborat?", options: ["5", "6", "7", "8"], correct: 1, points: 3.0 },
    { subject: "Huquq", question: "19-bob. Inson huquqlari umumjahon deklaratsiyasi qachon qabul qilingan?", options: ["1948-yil 10-dekabr", "1992-yil 8-dekabr", "1945-yil 2-sentabr", "1989-yil 1-oktabr"], correct: 0, points: 3.0 },

    // --- Informatika ---
    { subject: "Informatika", question: "18-bob. Eng kichik axborot o'lchov birligi nima?", options: ["Bayt", "Bit", "Kilobayt", "Piksel"], correct: 1, points: 2.0 },
    { subject: "Informatika", question: "19-bob. HTML qanday til hisoblanadi?", options: ["Dasturlash tili", "Hypertext Markup Language", "Ma'lumotlar bazasi tili", "Operatsion tizim"], correct: 1, points: 2.0 }
];

// Load from LocalStorage
let questionsDatabase = JSON.parse(localStorage.getItem('quiz_questions_db'));
if (!questionsDatabase) {
    let oldQuestions = localStorage.getItem('quiz_questions');
    let migrated = oldQuestions ? JSON.parse(oldQuestions) : JSON.parse(JSON.stringify(defaultSavollar));
    if (!migrated || migrated.length === 0) {
        migrated = JSON.parse(JSON.stringify(defaultSavollar));
    }
    questionsDatabase = {
        "1": migrated,
        "2": [],
        "3": [],
        "4": []
    };
    localStorage.setItem('quiz_questions_db', JSON.stringify(questionsDatabase));
}

let results = JSON.parse(localStorage.getItem('quiz_results')) || [];
let quizDuration = parseInt(localStorage.getItem('quiz_duration')) || 20; // Default 20 mins
let tgBotToken = localStorage.getItem('tg_bot_token') || "";
let tgChatId = localStorage.getItem('tg_chat_id') || "";

// New isolated storage for pins and durations
let subjectPinsDatabase = JSON.parse(localStorage.getItem('quiz_subject_pins_db'));
let subjectDurationsDatabase = JSON.parse(localStorage.getItem('quiz_subject_durations_db'));
let subjectTestTypesDatabase = JSON.parse(localStorage.getItem('quiz_subject_test_types_db'));

// Migration for pins and durations
if (!subjectPinsDatabase) {
    let oldPins = JSON.parse(localStorage.getItem('quiz_subject_pins')) || {};
    subjectPinsDatabase = {
        "Ona tili": { "1": oldPins["Ona tili"] || "", "2": "", "3": "", "4": "" },
        "Matematika": { "1": oldPins["Matematika"] || "", "2": "", "3": "", "4": "" },
        "Fizika": { "1": oldPins["Fizika"] || "", "2": "", "3": "", "4": "" },
        "Kimyo": { "1": oldPins["Kimyo"] || "", "2": "", "3": "", "4": "" },
        "Biologiya": { "1": oldPins["Biologiya"] || "", "2": "", "3": "", "4": "" },
        "Tarix": { "1": oldPins["Tarix"] || "", "2": "", "3": "", "4": "" },
        "Huquq": { "1": oldPins["Huquq"] || "", "2": "", "3": "", "4": "" },
        "Informatika": { "1": oldPins["Informatika"] || "", "2": "", "3": "", "4": "" }
    };
    localStorage.setItem('quiz_subject_pins_db', JSON.stringify(subjectPinsDatabase));
}

if (!subjectDurationsDatabase) {
    let oldDurations = JSON.parse(localStorage.getItem('quiz_subject_durations')) || {};
    subjectDurationsDatabase = {
        "Ona tili": { "1": oldDurations["Ona tili"] || 20, "2": 20, "3": 20, "4": 20 },
        "Matematika": { "1": oldDurations["Matematika"] || 20, "2": 20, "3": 20, "4": 20 },
        "Fizika": { "1": oldDurations["Fizika"] || 20, "2": 20, "3": 20, "4": 20 },
        "Kimyo": { "1": oldDurations["Kimyo"] || 20, "2": 20, "3": 20, "4": 20 },
        "Biologiya": { "1": oldDurations["Biologiya"] || 20, "2": 20, "3": 20, "4": 20 },
        "Tarix": { "1": oldDurations["Tarix"] || 20, "2": 20, "3": 20, "4": 20 },
        "Huquq": { "1": oldDurations["Huquq"] || 20, "2": 20, "3": 20, "4": 20 },
        "Informatika": { "1": oldDurations["Informatika"] || 20, "2": 20, "3": 20, "4": 20 }
    };
    localStorage.setItem('quiz_subject_durations_db', JSON.stringify(subjectDurationsDatabase));
}

if (!subjectTestTypesDatabase) {
    subjectTestTypesDatabase = {
        "Ona tili": { "1": "BSB", "2": "BSB", "3": "BSB", "4": "BSB" },
        "Matematika": { "1": "BSB", "2": "BSB", "3": "BSB", "4": "BSB" },
        "Fizika": { "1": "BSB", "2": "BSB", "3": "BSB", "4": "BSB" },
        "Kimyo": { "1": "BSB", "2": "BSB", "3": "BSB", "4": "BSB" },
        "Biologiya": { "1": "BSB", "2": "BSB", "3": "BSB", "4": "BSB" },
        "Tarix": { "1": "BSB", "2": "BSB", "3": "BSB", "4": "BSB" },
        "Huquq": { "1": "BSB", "2": "BSB", "3": "BSB", "4": "BSB" },
        "Informatika": { "1": "BSB", "2": "BSB", "3": "BSB", "4": "BSB" }
    };
    localStorage.setItem('quiz_subject_test_types_db', JSON.stringify(subjectTestTypesDatabase));
}

let subjectQuarters = JSON.parse(localStorage.getItem('quiz_subject_quarters')) || {
    "Ona tili": "1", "Matematika": "1", "Fizika": "1", "Kimyo": "1",
    "Biologiya": "1", "Tarix": "1", "Huquq": "1", "Informatika": "1"
};

let questions = questionsDatabase["1"]; // Default to 1, will dynamically update
let teacherTokens = JSON.parse(localStorage.getItem('quiz_teacher_tokens')) || [];
let showAnswersToStudent = localStorage.getItem('quiz_show_answers') === 'true';
let currentTeacherSession = null; // Stores token object if logged in as teacher

const staticTeacherPasswords = {
    '3UTYGB': 'Ona tili'
    // Kelajakda boshqa fanlarni shu yerga qo'shish mumkin
};

// Save Helpers
function saveQuestions() {
    localStorage.setItem('quiz_questions_db', JSON.stringify(questionsDatabase));
}
function saveResults() {
    localStorage.setItem('quiz_results', JSON.stringify(results));
}
function saveSettings(duration, token, chatId) {
    quizDuration = duration;
    tgBotToken = token;
    tgChatId = chatId;
    localStorage.setItem('quiz_duration', quizDuration.toString());
    localStorage.setItem('tg_bot_token', tgBotToken);
    localStorage.setItem('tg_chat_id', tgChatId);

    // Save PINs & Durations
    const pinIds = ['pin-onatili', 'pin-matematika', 'pin-fizika', 'pin-kimyo', 'pin-biologiya', 'pin-tarix', 'pin-huquq', 'pin-informatika'];
    const durIds = ['dur-onatili', 'dur-matematika', 'dur-fizika', 'dur-kimyo', 'dur-biologiya', 'dur-tarix', 'dur-huquq', 'dur-informatika'];
    const subjs = ["Ona tili", "Matematika", "Fizika", "Kimyo", "Biologiya", "Tarix", "Huquq", "Informatika"];
    pinIds.forEach((id, index) => {
        const el = document.getElementById(id);
        const durEl = document.getElementById(durIds[index]);
        if (el) subjectPins[subjs[index]] = el.value.trim();
        if (durEl) subjectDurations[subjs[index]] = parseInt(durEl.value) || 20;
    });
    localStorage.setItem('quiz_subject_pins', JSON.stringify(subjectPins));
    localStorage.setItem('quiz_subject_durations', JSON.stringify(subjectDurations));

    // Save Gemini Key
    const gKeyEl = document.getElementById('gemini-api-key');
    if (gKeyEl) {
        geminiApiKey = gKeyEl.value.trim();
        localStorage.setItem('gemini_api_key', geminiApiKey);
    }

    showAnswersToStudent = document.getElementById('toggle-show-answers').checked;
    localStorage.setItem('quiz_show_answers', showAnswersToStudent);
}
function saveTeacherTokens() {
    localStorage.setItem('quiz_teacher_tokens', JSON.stringify(teacherTokens));
}

// State variables
let currentQuestionIndex = 0;
let totalUserPoints = 0;
let studentName = "";
let studentClass = "";
let studentSubject = "";
let studentQuarter = "";
let currentQuizQuestions = [];
let studentAnswers = []; // Tracks indexes of user choices
let earnedPoints = []; // Tracks actual points earned per question
let isLocked = false;
let blockCount = 0;
let testTimeLimitSeconds = 0;
let timeElapsedSeconds = 0;
let timerInterval;
let toastTimeout;

// Web Audio API Context
let audioCtx = null;

// --- DOM Elements ---
// Screens
const authScreen = document.getElementById('auth-screen');
const instructionScreen = document.getElementById('instruction-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const adminPanel = document.getElementById('admin-panel');
const lockScreen = document.getElementById('lock-screen');
const toastAlert = document.getElementById('toast');

// Instruction Screen Elements
const instTitle = document.getElementById('inst-title');
const instTime = document.getElementById('inst-time');
const instCount = document.getElementById('inst-count');
const beginTestBtn = document.getElementById('begin-test-btn');

// Auth Screen Elements
const studentLoginSection = document.getElementById('student-login-section');
const adminLoginSection = document.getElementById('admin-login-section');
const backToStudentBtn = document.getElementById('back-to-student-btn');

const studentNameInput = document.getElementById('student-name');
const studentClassInput = document.getElementById('student-class');
const studentSubjectInput = document.getElementById('student-subject');
const studentQuarterInput = document.getElementById('student-quarter');
const quizPinInput = document.getElementById('quiz-pin');
const startBtn = document.getElementById('start-btn');
const adminLoginBtn = document.getElementById('admin-login-btn');
const leaderboardBody = document.getElementById('leaderboard-body');

// Admin Auth Elements
const adminPortalPassInput = document.getElementById('admin-portal-pass');
const adminAuthSubmit = document.getElementById('admin-auth-submit');
const adminAuthError = document.getElementById('admin-auth-error');

// Admin Panel Elements
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const tabQuestionsBtn = document.getElementById('tab-questions-btn');
const tabResultsBtn = document.getElementById('tab-results-btn');
const tabSettingsBtn = document.getElementById('tab-settings-btn');
const tabQrcodeBtn = document.getElementById('tab-qrcode-btn');
const tabSecurityBtn = document.getElementById('tab-security-btn');
const tabQuestions = document.getElementById('tab-questions');
const tabResults = document.getElementById('tab-results');
const tabSettings = document.getElementById('tab-settings');
const tabQrcode = document.getElementById('tab-qrcode');
const tabSecurity = document.getElementById('tab-security');

// Teacher Specific UI
const teacherPinSetter = document.getElementById('teacher-pin-setter');
const teacherSubjectPin = document.getElementById('teacher-subject-pin');
const teacherSubjectDuration = document.getElementById('teacher-subject-duration');
const teacherSubjectQuarter = document.getElementById('teacher-subject-quarter');
const teacherSubjectTestType = document.getElementById('teacher-subject-test-type');
const saveTeacherPinBtn = document.getElementById('save-teacher-pin-btn');
const teacherTimerBanner = document.getElementById('teacher-timer-banner');
const teacherTimerText = document.getElementById('teacher-timer-text');
let teacherTimerInterval = null;

const addQBtn = document.getElementById('add-q-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const saveApiBtn = document.getElementById('save-api-btn');
const clearResultsBtn = document.getElementById('clear-results-btn');
const exportExcelBtn = document.getElementById('export-excel-btn');
const filterClass = document.getElementById('filter-class');

// Settings Inputs
const testDurationInput = document.getElementById('quiz-duration');

// AI Analysis Elements
const compQ1 = document.getElementById('comp-q1');
const compQ2 = document.getElementById('comp-q2');
const analyzeBtn = document.getElementById('analyze-btn');
const comparisonResult = document.getElementById('comparison-result');
const filterQuarter = document.getElementById('filter-quarter');

// Telegram Settings Inputs
const tgBotTokenInput = document.getElementById('tg-bot-token');
const tgChatIdInput = document.getElementById('tg-chat-id');

// Teacher Tokens Elements
const teacherNameInput = document.getElementById('teacher-name-input');
const teacherSubjectSelect = document.getElementById('teacher-subject-select');
const teacherExpireSelect = document.getElementById('teacher-expire-select');
const generateTokenBtn = document.getElementById('generate-token-btn');
const teacherTokensList = document.getElementById('teacher-tokens-list');

// Word File Uploader Elements
const wordFileInput = document.getElementById('word-file-input');
const wordUploadBtn = document.getElementById('word-upload-btn');

// Admin Form Inputs
const newQText = document.getElementById('new-q-text');
const newQOpt0 = document.getElementById('new-q-opt0');
const newQOpt1 = document.getElementById('new-q-opt1');
const newQOpt2 = document.getElementById('new-q-opt2');
const newQOpt3 = document.getElementById('new-q-opt3');
const newQCorrect = document.getElementById('new-q-correct');
const newQPoints = document.getElementById('new-q-points');
const newQSubject = document.getElementById('new-q-subject');
const wordQSubject = document.getElementById('word-q-subject');
const adminQuestionsCount = document.getElementById('admin-questions-count');
const adminQuestionsList = document.getElementById('admin-questions-list');
const resultsTableBody = document.getElementById('results-table-body');
const geminiAnalyzeBtn = document.getElementById('gemini-analyze-btn');
const geminiAnalysisOutput = document.getElementById('gemini-analysis-output');
const geminiOverlay = document.getElementById('gemini-overlay');
const geminiLoading = document.getElementById('gemini-loading');
const closeGeminiBtn = document.getElementById('close-gemini-btn');
// Quiz Screen Elements
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const currentQuestionNum = document.getElementById('current-question-num');
const totalQuestionsSpan = document.getElementById('total-questions');
const questionPointsDisplay = document.getElementById('question-points-display');
const timerDisplay = document.getElementById('timer');
const studentDisplay = document.getElementById('student-display');
const resultContent = document.getElementById('result-content');

// Result Screen Elements
const certificateZone = document.getElementById('certificate-zone');
const downloadCertBtn = document.getElementById('download-cert-btn');
const errorReviewList = document.getElementById('error-review-list');

// Lock Screen Elements
const adminPassInput = document.getElementById('admin-pass');
const unlockBtn = document.getElementById('unlock-btn');
const unlockError = document.getElementById('unlock-error');

// QR Code Elements
const qrCanvas = document.getElementById('qr-canvas');
const downloadQrBtn = document.getElementById('download-qr-btn');

const toggleShowAnswers = document.getElementById('toggle-show-answers');

// --- Initial Setup ---
function init() {
    totalQuestionsSpan.textContent = questions.length;
    testDurationInput.value = quizDuration;
    tgBotTokenInput.value = tgBotToken;
    tgChatIdInput.value = tgChatId;

    // Load PINs, Durations, and Gemini Key to inputs
    const pinIds = ['pin-onatili', 'pin-matematika', 'pin-fizika', 'pin-kimyo', 'pin-biologiya', 'pin-tarix', 'pin-huquq', 'pin-informatika'];
    const durIds = ['dur-onatili', 'dur-matematika', 'dur-fizika', 'dur-kimyo', 'dur-biologiya', 'dur-tarix', 'dur-huquq', 'dur-informatika'];
    const subjs = ["Ona tili", "Matematika", "Fizika", "Kimyo", "Biologiya", "Tarix", "Huquq", "Informatika"];
    pinIds.forEach((id, index) => {
        const el = document.getElementById(id);
        const durEl = document.getElementById(durIds[index]);
        if (el && subjectPins[subjs[index]]) {
            el.value = subjectPins[subjs[index]];
        }
        if (durEl && subjectDurations[subjs[index]]) {
            durEl.value = subjectDurations[subjs[index]];
        }
    });
    const gKeyEl = document.getElementById('gemini-api-key');
    if (gKeyEl) gKeyEl.value = geminiApiKey;

    if (toggleShowAnswers) toggleShowAnswers.checked = showAnswersToStudent;

    renderQuestionsList();
    renderResultsTable();
    renderTeacherTokens();
    populateClassFilters();
    renderLeaderboard();
    setupAntiCheat();
}

// --- Anti-Cheat (Anti-Inspect & Key Blockers) ---
function setupAntiCheat() {
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        if (e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
            (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
        }
    });
}

function showToast(message) {
    toastAlert.textContent = message;
    toastAlert.classList.remove('hidden');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastAlert.classList.add('hidden');
    }, 3000);
}

// Generate sound safely
function playSound(type) {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        if (type === 'correct') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
            oscillator.frequency.exponentialRampToValueAtTime(880.00, audioCtx.currentTime + 0.1); // A5
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
        } else if (type === 'wrong') {
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'start') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
            oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.4);
        }
    } catch (e) {
        console.log('Audio error:', e);
    }
}

// --- Auth Transitions ---
adminLoginBtn.addEventListener('click', () => {
    studentLoginSection.classList.add('hidden');
    adminLoginSection.classList.remove('hidden');
    adminPortalPassInput.value = "";
    adminAuthError.classList.add('hidden');
    adminPortalPassInput.focus();
});

backToStudentBtn.addEventListener('click', () => {
    adminLoginSection.classList.add('hidden');
    studentLoginSection.classList.remove('hidden');
});

adminAuthSubmit.addEventListener('click', handleAdminAuth);
adminPortalPassInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAdminAuth();
});

// --- Admin / Teacher Authentication ---
function handleAdminAuth() {
    const inputPass = adminPortalPassInput.value.trim();
    if (!inputPass) return;

    // Check if full admin
    if (btoa(inputPass) === HASHED_ADMIN_PASS) {
        currentTeacherSession = null; // Full Admin
        openAdminPanelUI();
        return;
    }

    // Check Static Teacher Passwords
    if (staticTeacherPasswords[inputPass]) {
        currentTeacherSession = { subject: staticTeacherPasswords[inputPass] };
        openAdminPanelUI();
        return;
    }

    // Check if Teacher Token
    const now = new Date().getTime();
    const tokenObj = teacherTokens.find(t => t.token === inputPass && t.expireAt > now);
    if (tokenObj) {
        currentTeacherSession = tokenObj;
        openAdminPanelUI();
        return;
    }

    // Auth Failed
    adminAuthError.classList.remove('hidden');
    playSound('wrong');
}

function openAdminPanelUI() {
    adminLoginSection.classList.add('hidden');
    authScreen.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    testDurationInput.value = quizDuration;

    // Default open Questions tab
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    tabQuestionsBtn.classList.add('active');
    tabQuestions.classList.remove('hidden');

    if (currentTeacherSession) {
        // Teacher Mode: Hide unauthorized sections
        tabSettingsBtn.classList.add('hidden');
        tabQrcodeBtn.classList.add('hidden');
        tabSecurityBtn.classList.add('hidden');

        // Hide specific elements inside visible tabs if needed
        document.querySelector('.admin-header h2').textContent = `O'qituvchi Paneli: ${currentTeacherSession.subject}`;

        const subjDropdown = document.getElementById('new-q-subject');
        if (subjDropdown) subjDropdown.style.display = 'none';

        let subjLabel = document.getElementById('teacher-fixed-subject');
        if (!subjLabel) {
            subjLabel = document.createElement('div');
            subjLabel.id = 'teacher-fixed-subject';
            subjLabel.className = 'fixed-subject-label fade-in';
            subjLabel.style.padding = '10px';
            subjLabel.style.marginBottom = '15px';
            subjLabel.style.background = 'rgba(0,0,0,0.3)';
            subjLabel.style.borderRadius = '6px';
            subjLabel.style.color = 'var(--accent-color)';
            subjLabel.style.fontWeight = 'bold';
            subjDropdown.parentNode.insertBefore(subjLabel, subjDropdown);
        }
        subjLabel.style.display = 'block';

        const subjToKey = {
            'Ona tili': 'subjOnaTili',
            'Matematika': 'subjMatematika',
            'Fizika': 'subjFizika',
            'Kimyo': 'subjKimyo',
            'Biologiya': 'subjBiologiya',
            'Tarix': 'subjTarix',
            'Huquq': 'subjHuquq',
            'Informatika': 'subjInformatika'
        };
        const i18nKey = subjToKey[currentTeacherSession.subject] || '';
        if (i18nKey) {
            subjLabel.setAttribute('data-i18n', i18nKey);
        } else {
            subjLabel.removeAttribute('data-i18n');
        }
        subjLabel.textContent = currentTeacherSession.subject;
        applyTranslations();

        // Show Teacher specific UI blocks
        teacherTimerBanner.classList.remove('hidden');
        teacherPinSetter.classList.remove('hidden');
        filterClass.value = 'all';

        // Start Teacher Timer
        clearInterval(teacherTimerInterval);
        updateTeacherTimer();
        teacherTimerInterval = setInterval(updateTeacherTimer, 1000);

        // Pre-fill Teacher PIN/Duration/Quarter
        const subj = currentTeacherSession.subject;
        const qtr = subjectQuarters[subj] || "1";
        teacherSubjectQuarter.value = qtr;

        // Ensure questions points to current quarter
        questions = questionsDatabase[qtr];

        teacherSubjectPin.value = subjectPinsDatabase[subj][qtr] || "";
        teacherSubjectDuration.value = subjectDurationsDatabase[subj][qtr] || 20;
        if (teacherSubjectTestType) teacherSubjectTestType.value = subjectTestTypesDatabase[subj][qtr] || "BSB";

        showToast(`Xush kelibsiz, ${currentTeacherSession.name || currentTeacherSession.subject}`);
    } else {
        // Admin Mode: Ensure everything is visible
        tabSettingsBtn.classList.remove('hidden');
        tabQrcodeBtn.classList.remove('hidden');
        tabSecurityBtn.classList.remove('hidden');
        document.querySelector('.admin-header h2').textContent = "Admin Panel";

        const subjDropdown = document.getElementById('new-q-subject');
        if (subjDropdown) subjDropdown.style.display = 'block';

        const subjLabel = document.getElementById('teacher-fixed-subject');
        if (subjLabel) subjLabel.style.display = 'none';

        teacherTimerBanner.classList.add('hidden');
        teacherPinSetter.classList.add('hidden');
        clearInterval(teacherTimerInterval);

        showToast("Admin paneliga kirdingiz!");
    }

    renderQuestionsList();
    renderResultsTable();
}

function updateTeacherTimer() {
    if (!currentTeacherSession) return;
    const now = new Date().getTime();
    const diff = currentTeacherSession.expireAt - now;

    if (diff <= 0) {
        clearInterval(teacherTimerInterval);
        alert(t('timeUpAlert') || "Sizning vaqtinchalik ruxsatnomangiz o'z nihoyasiga yetdi!");
        adminLogoutBtn.click();
        return;
    }

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    teacherTimerText.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

adminLogoutBtn.addEventListener('click', () => {
    adminPanel.classList.add('hidden');
    authScreen.classList.remove('hidden');
    adminLoginSection.classList.add('hidden');
    studentLoginSection.classList.remove('hidden');
    currentTeacherSession = null;
    clearInterval(teacherTimerInterval);
    renderLeaderboard();
});

saveTeacherPinBtn.addEventListener('click', () => {
    if (!currentTeacherSession) return;
    const pin = teacherSubjectPin.value.trim();
    const dur = parseInt(teacherSubjectDuration.value) || 20;
    const testType = teacherSubjectTestType ? teacherSubjectTestType.value : "BSB";
    const subj = currentTeacherSession.subject;
    const qtr = teacherSubjectQuarter.value;

    if (!subjectPinsDatabase[subj]) subjectPinsDatabase[subj] = { "1": "", "2": "", "3": "", "4": "" };
    if (!subjectDurationsDatabase[subj]) subjectDurationsDatabase[subj] = { "1": 20, "2": 20, "3": 20, "4": 20 };
    if (!subjectTestTypesDatabase[subj]) subjectTestTypesDatabase[subj] = { "1": "BSB", "2": "BSB", "3": "BSB", "4": "BSB" };

    subjectPinsDatabase[subj][qtr] = pin;
    subjectDurationsDatabase[subj][qtr] = dur;
    subjectTestTypesDatabase[subj][qtr] = testType;
    subjectQuarters[subj] = qtr;

    localStorage.setItem('quiz_subject_pins_db', JSON.stringify(subjectPinsDatabase));
    localStorage.setItem('quiz_subject_durations_db', JSON.stringify(subjectDurationsDatabase));
    localStorage.setItem('quiz_subject_test_types_db', JSON.stringify(subjectTestTypesDatabase));
    localStorage.setItem('quiz_subject_quarters', JSON.stringify(subjectQuarters));

    alert(t('teacherPinSaved') || "Faningiz uchun sozlamalar muvaffaqiyatli saqlandi!");
});

teacherSubjectQuarter.addEventListener('change', () => {
    if (!currentTeacherSession) return;
    const qtr = teacherSubjectQuarter.value;
    const subj = currentTeacherSession.subject;

    // Update local variables
    subjectQuarters[subj] = qtr;
    questions = questionsDatabase[qtr];

    // Update UI inputs for the newly selected quarter
    teacherSubjectPin.value = subjectPinsDatabase[subj][qtr] || "";
    teacherSubjectDuration.value = subjectDurationsDatabase[subj][qtr] || 20;
    if (teacherSubjectTestType) teacherSubjectTestType.value = subjectTestTypesDatabase[subj][qtr] || "BSB";

    renderQuestionsList();
});

// --- Admin Tabs Logic ---
const tabsMap = {
    'tab-questions-btn': 'tab-questions',
    'tab-results-btn': 'tab-results',
    'tab-settings-btn': 'tab-settings',
    'tab-qrcode-btn': 'tab-qrcode',
    'tab-security-btn': 'tab-security'
};

Object.keys(tabsMap).forEach(btnId => {
    document.getElementById(btnId).addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
        e.target.classList.add('active');
        document.getElementById(tabsMap[btnId]).classList.remove('hidden');
        if (btnId === 'tab-qrcode-btn') generateQR();
    });
});

// --- Settings Form ---
saveSettingsBtn.addEventListener('click', () => {
    const dur = parseInt(testDurationInput.value);
    const token = tgBotTokenInput.value.trim();
    const chatId = tgChatIdInput.value.trim();

    if (isNaN(dur) || dur < 1) {
        alert(t('alertDuration'));
        return;
    }

    saveSettings(dur, token, chatId);
    showToast(t('settingsSavedMsg'));
});

saveApiBtn.addEventListener('click', () => {
    saveSettings(quizDuration, tgBotToken, tgChatId);
    showToast(t('settingsSavedMsg'));
});

// --- Teacher Tokens Management ---
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

generateTokenBtn.addEventListener('click', () => {
    const tName = teacherNameInput.value.trim();
    const tSubj = teacherSubjectSelect.value;
    const tHours = parseInt(teacherExpireSelect.value);

    if (!tName) {
        showToast("Iltimos o'qituvchi ismini kiriting!");
        return;
    }

    const expireTime = new Date().getTime() + (tHours * 60 * 60 * 1000);
    const newToken = {
        id: Date.now(),
        name: tName,
        subject: tSubj,
        token: generateRandomString(6),
        expireAt: expireTime
    };

    teacherTokens.push(newToken);
    saveTeacherTokens();
    renderTeacherTokens();

    teacherNameInput.value = "";
    showToast(`Token yaratildi: ${newToken.token}`);
});

function renderTeacherTokens() {
    teacherTokensList.innerHTML = "";
    const now = new Date().getTime();

    // Filter out expired ones globally on render
    const validTokens = teacherTokens.filter(t => t.expireAt > now);
    if (validTokens.length !== teacherTokens.length) {
        teacherTokens = validTokens;
        saveTeacherTokens();
    }

    if (teacherTokens.length === 0) {
        teacherTokensList.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Faol tokenlar yo'q</td></tr>";
        return;
    }

    teacherTokens.forEach(t => {
        const expDate = new Date(t.expireAt).toLocaleString();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.name}</td>
            <td><span class="subject-badge">${t.subject}</span></td>
            <td><strong style="color:var(--accent-color); font-family:monospace;">${t.token}</strong></td>
            <td>${expDate}</td>
            <td><button class="danger-btn" onclick="deleteTeacherToken(${t.id})" style="padding: 5px 10px; font-size: 0.8rem;">O'chirish</button></td>
        `;
        teacherTokensList.appendChild(tr);
    });
}

function deleteTeacherToken(id) {
    if (confirm("Ushbu tokenni o'chirmoqchimisiz?")) {
        teacherTokens = teacherTokens.filter(t => t.id !== id);
        saveTeacherTokens();
        renderTeacherTokens();
        showToast("Token o'chirildi");
    }
}

// --- Questions Management ---
function renderQuestionsList() {
    adminQuestionsList.innerHTML = '';

    // Filter questions based on access
    const displayQs = currentTeacherSession
        ? questions.filter(q => q.subject === currentTeacherSession.subject)
        : questions;

    adminQuestionsCount.textContent = displayQs.length;

    displayQs.forEach((q, i) => {
        const realIndex = questions.indexOf(q);
        const div = document.createElement('div');
        div.className = 'q-item fade-in';
        div.innerHTML = `
            <div class="q-info">
                <div class="q-text">${realIndex + 1}. ${q.question} <span class="subject-badge">${q.subject}</span></div>
                <div class="q-answer-check">✅ To'g'ri: ${q.options[q.correct]} (${q.points} ball)</div>
            </div>
            <button class="danger-btn" onclick="deleteQuestion(${realIndex})">${t('btnDelete') || "O'chirish"}</button>
        `;
        adminQuestionsList.appendChild(div);
    });
}

window.toggleQuestionFormat = function () {
    const qType = document.getElementById('new-q-type').value;
    const closedInputs = document.getElementById('closed-format-inputs');
    const correctSelection = document.getElementById('correct-selection-group');
    const openInputs = document.getElementById('open-format-inputs');

    if (qType === 'open') {
        closedInputs.style.display = 'none';
        if (correctSelection) correctSelection.style.display = 'none';
        openInputs.style.display = 'block';
    } else {
        closedInputs.style.display = 'block';
        if (correctSelection) correctSelection.style.display = '';
        openInputs.style.display = 'none';
    }
};

addQBtn.addEventListener('click', () => {
    const text = newQText.value.trim();
    const pts = parseFloat(newQPoints.value);
    const cogElement = document.getElementById('new-q-cognitive');
    const cog = cogElement ? cogElement.value : "Bilish";
    const typeElement = document.getElementById('new-q-type');
    const qType = typeElement ? typeElement.value : "closed";

    let subj = newQSubject.value;

    if (currentTeacherSession) {
        subj = currentTeacherSession.subject;
    }

    if (!text || isNaN(pts)) {
        showToast(t('alertFillFields'));
        return;
    }

    let questionObj = {
        subject: subj,
        question: text,
        points: pts,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        cognitiveLevel: cog,
        type: qType
    };

    if (qType === 'open') {
        const openAns = document.getElementById('new-q-open-answer').value.trim();
        if (!openAns) {
            showToast(t('alertFillFields'));
            return;
        }
        questionObj.openAnswer = openAns;
    } else {
        const opt0 = newQOpt0.value.trim();
        const opt1 = newQOpt1.value.trim();
        const opt2 = newQOpt2.value.trim();
        const opt3 = newQOpt3.value.trim();
        const corr = parseInt(newQCorrect.value);
        if (!opt0 || !opt1 || !opt2 || !opt3) {
            showToast(t('alertFillFields'));
            return;
        }
        questionObj.options = [opt0, opt1, opt2, opt3];
        questionObj.correct = corr;
    }

    const clearInputs = () => {
        newQText.value = '';
        newQOpt0.value = '';
        newQOpt1.value = '';
        newQOpt2.value = '';
        newQOpt3.value = '';
        if (document.getElementById('new-q-open-answer')) document.getElementById('new-q-open-answer').value = '';
        newQPoints.value = '1';
        if (document.getElementById('new-q-image')) document.getElementById('new-q-image').value = '';
        showToast(t('alertAdded') || "Savol qo'shildi!");
    };

    const imageInput = document.getElementById('new-q-image');
    if (imageInput && imageInput.files && imageInput.files[0]) {
        const file = imageInput.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 800;
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                questionObj.image = canvas.toDataURL('image/jpeg', 0.7);

                questions.push(questionObj);
                saveQuestions();
                renderQuestionsList();
                clearInputs();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        questions.push(questionObj);
        saveQuestions();
        renderQuestionsList();
        clearInputs();
    }
});

window.deleteQuestion = (index) => {
    if (confirm(t('confirmDeleteQ') || "Siz rostlama ushbu savolni o'chirmoqchimisiz?")) {
        questions.splice(index, 1);
        saveQuestions();
        renderQuestionsList();
        showToast(t('msgQuestionDeleted'));
    }
};

// --- Word Document Upload & Parsing (mammoth.js) ---
wordUploadBtn.addEventListener('click', () => {
    const file = wordFileInput.files[0];
    if (!file) {
        showToast("Iltimos, faylni tanlang!");
        return;
    }

    let targetSubject = wordQSubject.value;
    if (currentTeacherSession) {
        targetSubject = currentTeacherSession.subject;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const arrayBuffer = event.target.result;
        mammoth.extractRawText({ arrayBuffer: arrayBuffer })
            .then(function (result) {
                const text = result.value;
                parseWordText(text, targetSubject);
            })
            .catch(function (err) {
                console.error(err);
                showToast("Faylni o'qishda xatolik yuz berdi!");
            });
    };
    reader.readAsArrayBuffer(file);
});

function parseWordText(text, subject) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let newQCount = 0;

    let currentQ = null;
    let optionsTemp = [];
    let correctIndex = 0;
    let pointsVal = 1.0;

    // Simple state machine parser
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Match "1. Savol texti"
        let qMatch = line.match(/^\d+[\.\)]\s*(.+)/);
        if (qMatch) {
            // Push previous question if complete
            if (currentQ && optionsTemp.length >= 4) {
                questions.push({
                    subject: subject,
                    question: currentQ,
                    options: optionsTemp.slice(0, 4),
                    correct: correctIndex,
                    points: pointsVal,
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    cognitiveLevel: "Bilish"
                });
                newQCount++;
            }
            // Reset state
            currentQ = qMatch[1];
            optionsTemp = [];
            correctIndex = 0;
            pointsVal = 1.0;
            continue;
        }

        // Match Options: "A) Option text"
        let optMatch = line.match(/^[A-D][\.\)]\s*(.+)/i);
        if (optMatch && currentQ) {
            optionsTemp.push(optMatch[1]);
            continue;
        }

        // Match Answer: "Javob: A"
        let ansMatch = line.match(/^Javob\s*:\s*([A-D])/i);
        if (ansMatch && currentQ) {
            const letter = ansMatch[1].toUpperCase();
            correctIndex = ['A', 'B', 'C', 'D'].indexOf(letter);
            if (correctIndex === -1) correctIndex = 0;
            continue;
        }

        // Match Points: "Ball: 2.5"
        let ptsMatch = line.match(/^Ball\s*:\s*([\d\.]+)/i);
        if (ptsMatch && currentQ) {
            pointsVal = parseFloat(ptsMatch[1]) || 1.0;
            continue;
        }
    }

    // Push the very last question
    if (currentQ && optionsTemp.length >= 4) {
        questions.push({
            subject: subject,
            question: currentQ,
            options: optionsTemp.slice(0, 4),
            correct: correctIndex,
            points: pointsVal,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            cognitiveLevel: "Bilish"
        });
        newQCount++;
    }

    if (newQCount > 0) {
        saveQuestions();
        renderQuestionsList();
        showToast(`${newQCount} ta savol bazaga muvaffaqiyatli qo'shildi!`);
        wordFileInput.value = "";
    } else {
        showToast("Savollar formati noto'g'ri. Ko'rsatmaga qarang.");
    }
}

// --- Results Management ---
function populateClassFilters() {
    const classes = new Set(results.map(r => r.class));
    const oldVal = filterClass.value;
    filterClass.innerHTML = `<option value="all">${t('filterAll')}</option>`;
    classes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        filterClass.appendChild(opt);
    });
    if (oldVal && classes.has(oldVal)) {
        filterClass.value = oldVal;
    }
}

function renderResultsTable() {
    resultsTableBody.innerHTML = '';
    const filterCls = filterClass.value;
    const filterQ = filterQuarter ? filterQuarter.value : 'all';

    let filteredResults = results;

    if (filterCls !== 'all') {
        filteredResults = filteredResults.filter(r => r.class === filterCls);
    }

    if (filterQ !== 'all') {
        filteredResults = filteredResults.filter(r => r.quarter === filterQ);
    }

    // Teacher specific filter
    if (currentTeacherSession) {
        filteredResults = filteredResults.filter(r => r.subject === currentTeacherSession.subject);
    }

    filteredResults.sort((a, b) => b.percentage - a.percentage);

    filteredResults.forEach(r => {
        const tr = document.createElement('tr');
        const date = new Date(r.timestamp).toLocaleString();
        tr.innerHTML = `
            <td>${r.name}</td>
            <td>${r.class}</td>
            <td><span class="subject-badge">${r.subject}</span></td>
            <td>${r.quarter ? r.quarter + '-chorak' : '-'}</td>
            <td style="color:var(--accent-color); font-weight:bold;">${r.score.toFixed(1)}</td>
            <td style="color:${r.percentage >= 80 ? 'var(--success-color)' : (r.percentage >= 60 ? '#f59e0b' : 'var(--error-color)')};">${r.percentage}%</td>
            <td>${date}</td>
        `;
        resultsTableBody.appendChild(tr);
    });

    renderAnalyticsDashboard();
}

let analyticsChartInstance = null;

function renderAnalyticsDashboard() {
    const filterCls = filterClass.value;
    const filterQ = filterQuarter ? filterQuarter.value : 'all';

    let filteredResults = results;

    if (filterCls !== 'all') {
        filteredResults = filteredResults.filter(r => r.class === filterCls);
    }

    if (filterQ !== 'all') {
        filteredResults = filteredResults.filter(r => r.quarter === filterQ);
    }

    if (currentTeacherSession) {
        filteredResults = filteredResults.filter(r => r.subject === currentTeacherSession.subject);
    }

    const canvas = document.getElementById('analytics-chart');
    if (!canvas) return;

    if (filteredResults.length === 0) {
        if (analyticsChartInstance) {
            analyticsChartInstance.destroy();
            analyticsChartInstance = null;
        }
        return;
    }

    let maxQuestionsLength = 0;
    filteredResults.forEach(r => {
        if (r.details && r.details.length > maxQuestionsLength) {
            maxQuestionsLength = r.details.length;
        }
    });

    let counts = {};
    counts[t('cogKnowing') || "Bilish"] = { correct: 0, total: 0 };
    counts[t('cogApp') || "Qo'llash"] = { correct: 0, total: 0 };
    counts[t('cogReasoning') || "Mulohaza qilish"] = { correct: 0, total: 0 };

    function getCog(idx, total, stDetails) {
        let rawCog = "Bilish";
        if (stDetails && stDetails[idx] && stDetails[idx].cognitiveLevel) {
            rawCog = stDetails[idx].cognitiveLevel;
        } else {
            let third = total / 3;
            if (idx >= Math.ceil(third) && idx < Math.ceil(2 * third)) rawCog = "Qo'llash";
            else if (idx >= Math.ceil(2 * third)) rawCog = "Mulohaza qilish";
        }

        if (rawCog === "Bilish") return t('cogKnowing') || "Bilish";
        if (rawCog === "Qo'llash") return t('cogApp') || "Qo'llash";
        if (rawCog === "Mulohaza qilish") return t('cogReasoning') || "Mulohaza qilish";
        return t('cogKnowing') || "Bilish";
    }

    filteredResults.forEach(student => {
        if (!student.details) return;
        for (let i = 0; i < maxQuestionsLength; i++) {
            let cogType = getCog(i, maxQuestionsLength, student.details);
            counts[cogType].total++;
            if (student.details[i]) {
                const earned = student.details[i].earnedPoints || 0;
                if (earned > 0) counts[cogType].correct++;
            }
        }
    });

    const labels = [t('cogKnowing') || "Bilish", t('cogApp') || "Qo'llash", t('cogReasoning') || "Mulohaza qilish"];
    const dataPercent = labels.map(lbl => {
        if (counts[lbl].total === 0) return 0;
        return ((counts[lbl].correct / counts[lbl].total) * 100).toFixed(1);
    });

    if (analyticsChartInstance) {
        analyticsChartInstance.destroy();
    }

    analyticsChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: "O'zlashtirish (%)",
                data: dataPercent,
                backgroundColor: [
                    'rgba(56, 189, 248, 0.7)',
                    'rgba(168, 85, 247, 0.7)',
                    'rgba(34, 197, 94, 0.7)'
                ],
                borderColor: [
                    'rgb(56, 189, 248)',
                    'rgb(168, 85, 247)',
                    'rgb(34, 197, 94)'
                ],
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: 'white',
                        callback: function (value) { return value + "%" }
                    },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    ticks: { color: 'white' },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

filterClass.addEventListener('change', renderResultsTable);
if (filterQuarter) {
    filterQuarter.addEventListener('change', renderResultsTable);
}

if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
        const cls = filterClass.value;
        if (cls === 'all') return;

        const q1Val = compQ1.value;
        const q2Val = compQ2.value;

        const classResults = results.filter(r => r.class === cls);
        const q1List = classResults.filter(r => r.quarter === q1Val);
        const q2List = classResults.filter(r => r.quarter === q2Val);

        if (q1List.length === 0 || q2List.length === 0) {
            comparisonResult.classList.remove('hidden');
            comparisonResult.innerHTML = `<strong style="color: var(--error-color);">Ma'lumot yetarli emas!</strong> Tanlangan choraklardan birida bu sinf natijalari yo'q.`;
            return;
        }

        const avgQ1 = q1List.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / q1List.length;
        const avgQ2 = q2List.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / q2List.length;

        const diff = avgQ2 - avgQ1;
        let diffStr = "";

        if (diff > 0) {
            diffStr = `<span style="color: var(--success-color);">${diff.toFixed(1)}% o'sish kuzatildi 📈</span>`;
        } else if (diff < 0) {
            diffStr = `<span style="color: var(--error-color);">${Math.abs(diff).toFixed(1)}% pasayish kuzatildi 📉</span>`;
        } else {
            diffStr = `<span style="color: var(--text-secondary);">O'zgarishsiz ⚖️</span>`;
        }

        comparisonResult.classList.remove('hidden');
        comparisonResult.innerHTML = `
            <div style="font-size: 1.1rem; text-align: center;">
                <strong>${cls}</strong> sinfining natijalari:<br>
                ${q1Val}-chorak: <strong>${avgQ1.toFixed(1)}%</strong> | 
                ${q2Val}-chorak: <strong>${avgQ2.toFixed(1)}%</strong><br>
                Xulosa: ${diffStr}
            </div>
        `;
    });
}

clearResultsBtn.addEventListener('click', () => {
    if (confirm(t('confirmClearResults') || "Barcha natijalarni butunlay o'chirasizmi?")) {
        // If teacher, only clear their subject
        if (currentTeacherSession) {
            results = results.filter(r => r.subject !== currentTeacherSession.subject);
        } else {
            const classVal = filterClass.value;
            if (classVal !== 'all') {
                results = results.filter(r => r.class !== classVal);
            } else {
                results = [];
            }
        }
        saveResults();
        renderResultsTable();
        renderLeaderboard();
        populateClassFilters();
        showToast(t('msgResultsCleared'));
    }
});

// --- EXPORT TO EXCEL (I-SHSB Format with SheetJS) ---
exportExcelBtn.addEventListener('click', () => {
    if (results.length === 0) {
        showToast("Natijalar mavjud emas!");
        return;
    }

    let exportData = results;
    let subjText = "Barcha fanlar";
    let classText = filterClass.value === 'all' ? "Barcha sinflar" : filterClass.value;

    const qFilter = document.getElementById('filter-quarter') ? document.getElementById('filter-quarter').value : 'all';
    let targetQuarter = qFilter;
    if (targetQuarter === 'all' && currentTeacherSession) {
        targetQuarter = teacherSubjectQuarter.value || "1";
    } else if (targetQuarter === 'all') {
        targetQuarter = "1";
    }

    exportData = exportData.filter(r => r.quarter === targetQuarter);

    if (currentTeacherSession) {
        exportData = exportData.filter(r => r.subject === currentTeacherSession.subject);
        const subjToKey = {
            'Ona tili': 'subjOnaTili',
            'Matematika': 'subjMatematika',
            'Fizika': 'subjFizika',
            'Kimyo': 'subjKimyo',
            'Biologiya': 'subjBiologiya',
            'Tarix': 'subjTarix',
            'Huquq': 'subjHuquq',
            'Informatika': 'subjInformatika'
        };
        const i18nKey = subjToKey[currentTeacherSession.subject] || '';
        subjText = i18nKey ? (t(i18nKey) || currentTeacherSession.subject) : currentTeacherSession.subject;
    } else {
        if (filterClass.value !== 'all') {
            exportData = results.filter(r => r.class === filterClass.value);
        }
    }

    if (exportData.length === 0) {
        showToast("Ushbu filtr bo'yicha ma'lumot yo'q!");
        return;
    }

    // Identify Max Questions Array Length for Columns
    let maxQuestionsLength = 0;
    let maxTotalPointsPossible = 0;

    exportData.forEach(r => {
        if (r.details && r.details.length > maxQuestionsLength) {
            maxQuestionsLength = r.details.length;
            maxTotalPointsPossible = r.details.reduce((sum, d) => sum + (d.maxPoints || 0), 0);
        }
    });

    const currentYear = new Date().getFullYear();
    const currentDateStr = new Date().toLocaleDateString('uz-UZ');

    let testTypeStr = "BSB/CHSB";
    if (currentTeacherSession && subjectTestTypesDatabase && subjectTestTypesDatabase[currentTeacherSession.subject] && subjectTestTypesDatabase[currentTeacherSession.subject][targetQuarter]) {
        testTypeStr = subjectTestTypesDatabase[currentTeacherSession.subject][targetQuarter];
    }

    // Prepare Sheet Data Array
    let wsData = [];

    // Rows 1-3: Headers (Merged later)
    wsData.push([`Qaraqalpaqstan Respublikası Xojeyli rayonı qánigelestirilgen mektebiniń ${classText} klass, ${currentYear}-sherek`]);
    wsData.push([`${subjText.toUpperCase()} páninen ótkerilgen ${testTypeStr} NÁTIYJELERI`]);
    wsData.push([""]); // Empty row 3

    // Row 4: Statistics
    let statRow = [""];
    statRow[1] = `${testTypeStr} ótkerilgen sáne: ${currentDateStr} | Sorawlar sanı: ${maxQuestionsLength} | Max ball: ${maxTotalPointsPossible.toFixed(1)} | Oqıwshılar sanı: ${exportData.length}`;
    wsData.push(statRow);

    // Row 5: Table Headers
    let headerRow = ["№", "Oqıwshınıń familiyası, atı"];

    function getCognitiveType(idx, total, stDetails) {
        let rawCog = "Bilish";
        let isWritten = false;
        if (stDetails && stDetails[idx] && stDetails[idx].cognitiveLevel) {
            rawCog = stDetails[idx].cognitiveLevel;
            if (stDetails[idx].type === 'open') {
                isWritten = true;
            }
        } else {
            let third = total / 3;
            if (idx >= Math.ceil(third) && idx < Math.ceil(2 * third)) rawCog = "Qo'llash";
            else if (idx >= Math.ceil(2 * third)) rawCog = "Mulohaza qilish";
        }

        let translatedCog = t('cogKnowing') || "Bilish";
        if (rawCog === "Qo'llash") translatedCog = t('cogApp') || "Qo'llash";
        if (rawCog === "Mulohaza qilish") translatedCog = t('cogReasoning') || "Mulohaza qilish";

        if (isWritten) {
            return (t('lblWritten') || "Yozma") + "/" + translatedCog;
        }
        return translatedCog;
    }

    let firstStudentWithDetails = exportData.find(s => s.details && s.details.length === maxQuestionsLength);

    // Add question columns dynamically
    for (let i = 0; i < maxQuestionsLength; i++) {
        let cogType = getCognitiveType(i, maxQuestionsLength, firstStudentWithDetails ? firstStudentWithDetails.details : null);
        headerRow.push(`${i + 1}-soraw (${cogType})`);
    }

    headerRow.push(`${t('cogKnowing')} %`);
    headerRow.push(`${t('cogApp')} %`);
    headerRow.push(`${t('cogReasoning')} %`);
    headerRow.push("JÁMI (Ball)");
    headerRow.push("JÁMI %");
    wsData.push(headerRow);

    // Rows 6+: Student Data
    exportData.sort((a, b) => b.percentage - a.percentage);

    exportData.forEach((student, index) => {
        let row = [index + 1, student.name];

        let totalScore = 0;
        let counts = {};
        counts[t('cogKnowing')] = { correct: 0, total: 0 };
        counts[t('cogApp')] = { correct: 0, total: 0 };
        counts[t('cogReasoning')] = { correct: 0, total: 0 };

        for (let i = 0; i < maxQuestionsLength; i++) {
            let cogType = getCognitiveType(i, maxQuestionsLength, student.details);
            counts[cogType].total++;

            if (student.details && student.details[i]) {
                const earned = student.details[i].earnedPoints || 0;
                const isCorrect = earned > 0;
                row.push(isCorrect ? '+' : '-');
                totalScore += earned;
                if (isCorrect) counts[cogType].correct++;
            } else {
                row.push('-');
            }
        }

        // Calculate cognitive percentages
        [t('cogKnowing'), t('cogApp'), t('cogReasoning')].forEach(type => {
            if (counts[type].total > 0) {
                row.push(((counts[type].correct / counts[type].total) * 100).toFixed(1) + '%');
            } else {
                row.push('-');
            }
        });

        row.push(totalScore.toFixed(1));
        row.push(`${student.percentage}%`);
        wsData.push(row);
    });

    // Create Workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Styling & Merging
    // A1 to max column merge
    const maxColIndex = 1 + maxQuestionsLength + 5; // № + Name + N_Questions + 3 Cognitive + JÁMI + %

    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: maxColIndex } }); // Row 1
    ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: maxColIndex } }); // Row 2
    ws['!merges'].push({ s: { r: 3, c: 1 }, e: { r: 3, c: maxColIndex } }); // Row 4 (stats)

    // Apply bold to headers
    for (let R = 0; R <= 4; R++) {
        for (let C = 0; C <= maxColIndex; C++) {
            const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
            if (ws[cellRef]) {
                ws[cellRef].s = {
                    font: { bold: true },
                    alignment: { horizontal: "center", vertical: "center" }
                };
            }
        }
    }

    // Row 1 and 2 specific sizing and styling
    if (ws['A1']) ws['A1'].s = { font: { bold: true, sz: 14 }, alignment: { horizontal: "center", vertical: "center" } };
    if (ws['A2']) ws['A2'].s = { font: { bold: true, sz: 14, color: { rgb: "0000FF" } }, alignment: { horizontal: "center", vertical: "center" } };

    // Set column widths
    if (!ws['!cols']) ws['!cols'] = [];
    ws['!cols'][0] = { wch: 5 };  // №
    ws['!cols'][1] = { wch: 35 }; // Name
    for (let i = 0; i < maxQuestionsLength; i++) {
        ws['!cols'][i + 2] = { wch: 18 }; // Questions (e.g. "1-soraw (Mulohaza qilish)")
    }
    ws['!cols'][maxQuestionsLength + 2] = { wch: 12 }; // Bilish %
    ws['!cols'][maxQuestionsLength + 3] = { wch: 12 }; // Qo'llash %
    ws['!cols'][maxQuestionsLength + 4] = { wch: 14 }; // Mulohaza %
    ws['!cols'][maxQuestionsLength + 5] = { wch: 14 }; // JAMI (Ball)
    ws['!cols'][maxQuestionsLength + 6] = { wch: 10 }; // %

    XLSX.utils.book_append_sheet(wb, ws, "Natijalar");

    const fileName = `SHSB_${subjText.replace(/\s+/g, '_')}_${classText}_${currentDateStr}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showToast(`Excel fayl yuklandi: ${fileName}`);
    saveResults();
});

// --- Gemini API Call logic ---

if (closeGeminiBtn && geminiOverlay) {
    closeGeminiBtn.addEventListener('click', () => {
        geminiOverlay.classList.add('hidden');
    });
}

if (geminiAnalyzeBtn && geminiLoading && geminiAnalysisOutput) {
    geminiAnalyzeBtn.addEventListener('click', async () => {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "Sizning_API_Kalitingiz") {
            alert(t('alertGeminiKey') || "API kilit sozlanmagan! script.js faylida kalitni kiriting.");
            return;
        }

        let exportData = results;
        const filterCls = filterClass.value;
        const filterQ = document.getElementById('filter-quarter') ? document.getElementById('filter-quarter').value : 'all';

        if (filterCls !== 'all') {
            exportData = exportData.filter(r => r.class === filterCls);
        }

        let targetQuarter = filterQ;
        if (targetQuarter === 'all' && currentTeacherSession) {
            targetQuarter = teacherSubjectQuarter.value || "1";
        } else if (targetQuarter === 'all') {
            targetQuarter = "1";
        }
        exportData = exportData.filter(r => r.quarter === targetQuarter);

        if (currentTeacherSession) {
            exportData = exportData.filter(r => r.subject === currentTeacherSession.subject);
        }

        if (exportData.length === 0) {
            alert(t('alertNoQuestions') || "Natijalar mavjud emas!");
            return;
        }

        geminiOverlay.classList.remove('hidden');
        geminiLoading.style.display = 'flex';
        geminiAnalysisOutput.style.display = 'none';
        geminiAnalysisOutput.innerHTML = "";

        try {
            const statsStr = JSON.stringify(exportData.map(r => ({
                ism: r.name,
                ball: r.score,
                foiz: r.percentage + '%',
                savollar: r.details.map(d => ({ tur: d.cognitiveLevel, holat: d.status }))
            })));

            let testTypeStr = "BSB/CHSB";
            if (currentTeacherSession && subjectTestTypesDatabase && subjectTestTypesDatabase[currentTeacherSession.subject] && subjectTestTypesDatabase[currentTeacherSession.subject][targetQuarter]) {
                testTypeStr = subjectTestTypesDatabase[currentTeacherSession.subject][targetQuarter];
            }

            const prompt = `Siz maktab psixologi va professional pedagogsiz. Quyida ko'rsatilgan sinf o'quvchilarining ${testTypeStr} test natijalari va ularning kognitiv darajalar (Bilish, Qo'llash, Mulohaza qilish) bo'yicha tahlili berilgan. Iltimos, ushbu ma'lumotlarni chuqur tahlil qilib, o'zbek tilida:
1. Sinfning umumiy o'zlashtirish darajasiga pedagogik tashxis qo'ying.
2. Qaysi kognitiv sohada (masalan, mulohaza qilishda yoki qo'llashda) o'quvchilarda oqsoqlik va kamchiliklar borligini aniqlang.
3. O'qituvchiga dars sifatini oshirish, o'quvchilar motivatsiyasini ko'tarish va bo'shliqlar bilan ishlash bo'yicha aniq amaliy va psixologik tavsiyalar bering.
Natijalar:
${statsStr}`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }

            const mdText = data.candidates[0].content.parts[0].text;
            geminiLoading.style.display = 'none';
            geminiAnalysisOutput.style.display = 'block';
            geminiAnalysisOutput.innerHTML = parseMarkdownToHtml(mdText);

        } catch (error) {
            geminiLoading.style.display = 'none';
            geminiAnalysisOutput.style.display = 'block';
            geminiAnalysisOutput.textContent = "Xatolik yuz berdi: " + error.message;
        }
    });
}

// --- Quiz Start Logic ---
startBtn.addEventListener('click', () => {
    studentName = studentNameInput.value.trim();
    studentClass = studentClassInput.value;
    studentSubject = studentSubjectInput.value;
    const pin = quizPinInput.value.trim();

    if (!studentName || !studentClass || !studentSubject || !pin) {
        alert(t('alertDetails') || "Barcha ma'lumotlarni (shu jumladan maxsus kodni) to'ldiring!");
        return;
    }

    // Verify PIN globally across quarters for the chosen subject
    let matchedQuarter = null;
    const subjectPinObj = subjectPinsDatabase[studentSubject];

    if (subjectPinObj) {
        for (let q in subjectPinObj) {
            if (subjectPinObj[q] === pin && pin !== "") {
                matchedQuarter = q;
                break;
            }
        }
    }

    if (!matchedQuarter) {
        alert(t('alertWrongPin') || "Maxsus kod noto'g'ri kiritildi yoki bunday chorak faol emas!");
        return;
    }

    studentQuarter = matchedQuarter;
    currentQuizQuestions = questionsDatabase[studentQuarter].filter(q => q.subject === studentSubject);

    if (currentQuizQuestions.length === 0) {
        alert(t('alertNoQuestions'));
        return;
    }

    testTimeLimitSeconds = (subjectDurationsDatabase[studentSubject][studentQuarter] || 20) * 60;

    // Shuffle
    currentQuizQuestions.sort(() => Math.random() - 0.5);

    // Initialize State
    currentQuestionIndex = 0;
    totalUserPoints = 0;
    studentAnswers = new Array(currentQuizQuestions.length).fill(null);
    earnedPoints = new Array(currentQuizQuestions.length).fill(0);
    isLocked = false;
    blockCount = 0;
    timeElapsedSeconds = 0;
    let activeDuration = subjectDurationsDatabase[studentSubject][studentQuarter] || 20;
    testTimeLimitSeconds = activeDuration * 60;

    // Show Instruction Screen instead of starting immediately
    const testType = subjectTestTypesDatabase && subjectTestTypesDatabase[studentSubject] && subjectTestTypesDatabase[studentSubject][studentQuarter]
        ? subjectTestTypesDatabase[studentSubject][studentQuarter]
        : "BSB";

    if (instTitle) instTitle.textContent = `${studentSubject} - ${testType}`;
    if (instTime) instTime.textContent = (t('lblTime') || "Vaqt:") + ` ${activeDuration} daqiqa`;

    if (instCount) {
        let openQ = currentQuizQuestions.filter(q => q.type === 'open').length;
        let closedQ = currentQuizQuestions.length - openQ;
        let qDetails = `(Yopiq: ${closedQ}, Ochiq: ${openQ})`;
        if (document.documentElement.lang === 'qq') {
            qDetails = `(Jabıq: ${closedQ}, Ashıq: ${openQ})`;
        } else if (document.documentElement.lang === 'en') {
            qDetails = `(Closed: ${closedQ}, Open: ${openQ})`;
        }
        instCount.textContent = (t('lblCount') || "Savollar soni:") + ` ${currentQuizQuestions.length} ta ${qDetails}`;
    }

    authScreen.classList.add('hidden');
    instructionScreen.classList.remove('hidden');
});

if (beginTestBtn) {
    beginTestBtn.addEventListener('click', () => {
        instructionScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');

        document.documentElement.requestFullscreen().catch(e => console.log('Fullscreen blocked', e));

        playSound('start');
        startTimer();
        loadQuestion();

        studentDisplay.innerHTML = `<strong>${studentName}</strong> (${studentClass}) - <span class="subject-badge">${studentSubject}</span>`;

        // Anti-cheat Listeners specific to Quiz
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
    });
}

// --- Timer ---
function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        if (isLocked) return;
        timeElapsedSeconds++;
        updateTimerDisplay();

        if (timeElapsedSeconds >= testTimeLimitSeconds) {
            finishQuiz(true);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const remaining = testTimeLimitSeconds - timeElapsedSeconds;
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    timerDisplay.textContent = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;

    if (remaining < 60) {
        timerDisplay.style.color = 'var(--error-color)';
        if (s % 2 === 0) timerDisplay.style.animation = 'pulse 1s infinite';
    } else {
        timerDisplay.style.color = 'inherit';
        timerDisplay.style.animation = 'none';
    }
}

// --- Question Loader ---
function loadQuestion() {
    if (currentQuestionIndex >= currentQuizQuestions.length) {
        finishQuiz();
        return;
    }

    const q = currentQuizQuestions[currentQuestionIndex];
    currentQuestionNum.textContent = currentQuestionIndex + 1;
    totalQuestionsSpan.textContent = currentQuizQuestions.length;
    questionPointsDisplay.textContent = q.points;

    progressBar.style.width = `${((currentQuestionIndex) / currentQuizQuestions.length) * 100}%`;

    questionText.innerHTML = parseMarkdownToHtml(q.question);

    if (q.image) {
        const imgEl = document.createElement('img');
        imgEl.src = q.image;
        imgEl.style.maxWidth = '100%';
        imgEl.style.borderRadius = '10px';
        imgEl.style.marginTop = '15px';
        questionText.appendChild(imgEl);
    }

    optionsContainer.innerHTML = '';

    if (q.type === 'open') {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'open-answer-input';
        input.className = 'fade-in';
        input.style.width = '100%';
        input.style.padding = '15px';
        input.style.fontSize = '18px';
        input.style.borderRadius = '10px';
        input.style.background = 'rgba(255, 255, 255, 0.1)';
        input.style.border = '2px solid rgba(255, 255, 255, 0.2)';
        input.style.color = 'white';
        input.placeholder = t('phOpenAnswer') || "Javobingizni kiriting...";

        if (studentAnswers[currentQuestionIndex] !== null) {
            input.value = studentAnswers[currentQuestionIndex];
        }

        input.addEventListener('input', (e) => {
            studentAnswers[currentQuestionIndex] = e.target.value;
            if (e.target.value.trim() !== '') {
                nextBtn.classList.remove('hidden');
            } else {
                nextBtn.classList.add('hidden');
            }
        });

        optionsContainer.appendChild(input);
    } else {
        q.options.forEach((opt, index) => {
            const div = document.createElement('div');
            div.className = 'option fade-in';
            div.innerHTML = parseMarkdownToHtml(opt);
            // Clean inner P tags if any from md
            div.innerHTML = div.innerHTML.replace(/<p>/g, '').replace(/<\/p>/g, '');

            if (studentAnswers[currentQuestionIndex] === index) {
                div.classList.add('selected');
            }

            div.addEventListener('click', () => selectOption(index));
            optionsContainer.appendChild(div);
        });
    }

    if (currentQuestionIndex === currentQuizQuestions.length - 1) {
        nextBtn.textContent = t('btnFinishQuiz') || "Yakunlash";
        nextBtn.classList.replace('primary-btn', 'success-btn');
    } else {
        nextBtn.textContent = t('nextBtn') || "Keyingi savol";
        nextBtn.classList.replace('success-btn', 'primary-btn');
    }

    if (studentAnswers[currentQuestionIndex] !== null) {
        nextBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.add('hidden');
    }
}

function selectOption(index) {
    if (isLocked) return;
    studentAnswers[currentQuestionIndex] = index;

    const allOptions = optionsContainer.children;
    for (let opt of allOptions) {
        opt.classList.remove('selected');
    }
    allOptions[index].classList.add('selected');

    nextBtn.classList.remove('hidden');
}

nextBtn.addEventListener('click', () => {
    if (isLocked || studentAnswers[currentQuestionIndex] === null) return;

    const q = currentQuizQuestions[currentQuestionIndex];
    let isCorrect = false;

    if (q.type === 'open') {
        const studentAnsStr = String(studentAnswers[currentQuestionIndex]).toLowerCase().trim();
        const correctAnsStr = String(q.openAnswer || "").toLowerCase().trim();
        if (studentAnsStr === correctAnsStr && studentAnsStr !== "") {
            isCorrect = true;
        }
    } else {
        if (studentAnswers[currentQuestionIndex] === q.correct) {
            isCorrect = true;
        }
    }

    if (isCorrect) {
        earnedPoints[currentQuestionIndex] = q.points;
        playSound('correct');
    } else {
        earnedPoints[currentQuestionIndex] = 0;
        playSound('wrong');
    }

    currentQuestionIndex++;
    loadQuestion();
});

// --- Finishing Quiz ---
function finishQuiz(timeOut = false) {
    clearInterval(timerInterval);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);

    if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => e);
    }

    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');

    totalUserPoints = earnedPoints.reduce((a, b) => a + b, 0);
    const maxPossiblePoints = currentQuizQuestions.reduce((a, b) => a + (b.points || 1.0), 0);

    const percentage = maxPossiblePoints > 0 ? ((totalUserPoints / maxPossiblePoints) * 100).toFixed(1) : 0;

    // Save Result with structured details for Export
    let detailedAnswers = currentQuizQuestions.map((q, i) => ({
        question: q.question,
        maxPoints: q.points,
        earnedPoints: earnedPoints[i],
        userAnswerIndex: studentAnswers[i],
        correctIndex: q.correct,
        cognitiveLevel: q.cognitiveLevel || "Bilish",
        type: q.type || "closed"
    }));

    const resultObj = {
        name: studentName,
        class: studentClass,
        subject: studentSubject,
        quarter: studentQuarter,
        score: totalUserPoints,
        percentage: parseFloat(percentage),
        timestamp: new Date().getTime(),
        details: detailedAnswers
    };

    results.push(resultObj);
    saveResults();
    renderLeaderboard();

    let resultHTML = `
        <h3 style="color:var(--accent-color); margin-bottom: 15px;">${studentName}</h3>
        <div class="stat-item"><span>${t('thSubject')}:</span> <strong>${studentSubject}</strong></div>
        <div class="stat-item"><span>${t('thScore')}:</span> <strong>${totalUserPoints.toFixed(1)} / ${maxPossiblePoints.toFixed(1)}</strong></div>
        <div class="stat-item"><span>${t('thPercentage')}:</span> <strong style="color:${percentage >= 80 ? 'var(--success-color)' : 'var(--error-color)'}">${percentage}%</strong></div>
        <div class="stat-item"><span>${t('thDate')}:</span> <strong>${new Date().toLocaleString()}</strong></div>
    `;

    if (timeOut) {
        resultHTML += `<div class="analysis-note" style="border-left-color: var(--error-color);">Vaqt tugadi. Test avtomatik tarzda yakunlandi!</div>`;
    }

    // AI-like quick feedback
    if (percentage >= 86) {
        resultHTML += `<div class="analysis-note">🏆 Ajoyib natija! Siz bu fandan juda yaxshi tayyorgarlik ko'rgansiz.</div>`;
        certificateZone.classList.remove('hidden');
    } else if (percentage >= 60) {
        resultHTML += `<div class="analysis-note">👍 Yaxshi natija! Lekin ba'zi mavzularni yana takrorlashingiz kerak.</div>`;
        certificateZone.classList.add('hidden');
    } else {
        resultHTML += `<div class="analysis-note" style="border-left-color: var(--error-color);">📚 Yomon natija. Iltimos, kitob o'qib, yana tayyorlaning!</div>`;
        certificateZone.classList.add('hidden');
    }

    resultContent.innerHTML = resultHTML;

    // Optional pedagogical review rendering
    if (showAnswersToStudent) {
        renderErrorReview(detailedAnswers);
    } else {
        errorReviewList.innerHTML = `<p style="color:var(--text-secondary);">${t('secAnswersHint')}</p>`;
    }

    // Telegram Bot Push
    if (tgBotToken && tgChatId) {
        const tgMessage = `🎓 Yangi Natija (SHSB)\n\n👤 O'quvchi: ${studentName}\n🏫 Sinf: ${studentClass}\n📚 Fan: ${studentSubject}\n📈 Natija: ${totalUserPoints.toFixed(1)} / ${maxPossiblePoints.toFixed(1)} ball (${percentage}%)`;
        fetch(`https://api.telegram.org/bot${tgBotToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: tgChatId,
                text: tgMessage
            })
        }).catch(e => console.log('TG Error:', e));
    }
}

// Render questions the student got wrong
function renderErrorReview(details) {
    errorReviewList.innerHTML = '';
    const mistakes = details.filter(d => d.earnedPoints === 0);

    if (mistakes.length === 0) {
        errorReviewList.innerHTML = `<p style="color:var(--success-color);">Sizda hech qanday xatolik yo'q! 🎉</p>`;
        return;
    }

    mistakes.forEach(m => {
        const div = document.createElement('div');
        div.className = 'review-item';
        const qRef = currentQuizQuestions.find(q => q.question === m.question);
        let correctStr = "";
        if (m.type === 'open') {
            correctStr = qRef ? qRef.openAnswer : "";
        } else {
            correctStr = qRef ? qRef.options[m.correctIndex] : "";
        }
        div.innerHTML = `
            <div class="review-q">${m.question}</div>
            <div class="review-correct-ans">Tog'ri javob: ${correctStr}</div>
        `;
        errorReviewList.appendChild(div);
    });
}

// --- Leaderboard ---
function renderLeaderboard() {
    leaderboardBody.innerHTML = '';

    // Sort all results globally and get top 10
    const top10 = [...results].sort((a, b) => b.percentage - a.percentage).slice(0, 10);

    if (top10.length === 0) {
        leaderboardBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-secondary);">Hozircha reyting bo'sh</td></tr>`;
        return;
    }

    top10.forEach((r, idx) => {
        const tr = document.createElement('tr');
        let badge = '';
        if (idx === 0) badge = '🥇';
        else if (idx === 1) badge = '🥈';
        else if (idx === 2) badge = '🥉';
        else badge = `${idx + 1}`;

        tr.innerHTML = `
            <td><strong>${badge}</strong></td>
            <td>${r.name} <span style="font-size: 0.8em; color: var(--text-secondary);">(${r.class}) - ${r.subject}</span></td>
            <td style="color: var(--accent-color); font-weight: bold;">${r.percentage}%</td>
        `;
        leaderboardBody.appendChild(tr);
    });
}

// --- Anti-Cheat Proctoring Events ---
function handleVisibilityChange() {
    if (document.hidden && !isLocked) {
        triggerLock();
    }
}

function handleFullscreenChange() {
    if (!document.fullscreenElement && !isLocked) {
        triggerLock();
    }
}

function triggerLock() {
    blockCount++;
    isLocked = true;
    lockScreen.classList.remove('hidden');
    playSound('wrong');
    unlockError.classList.add('hidden');
    adminPassInput.value = "";
    adminPassInput.focus();
}

unlockBtn.addEventListener('click', () => {
    const pass = adminPassInput.value;
    if (btoa(pass) === HASHED_ADMIN_PASS) {
        isLocked = false;
        lockScreen.classList.add('hidden');
        document.documentElement.requestFullscreen().catch(e => e);
    } else {
        unlockError.classList.remove('hidden');
    }
});

// --- Certificate Canvas Draw & Download ---
downloadCertBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');

    // Background Gradient
    const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grd.addColorStop(0, "#0f172a");
    grd.addColorStop(1, "#1e293b");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 15;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Inner gold border
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 5;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Text Header
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 50px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FAXRIIY YORLIQ", canvas.width / 2, 120);

    // School Name
    ctx.fillStyle = "#94a3b8";
    ctx.font = "30px Outfit, sans-serif";
    ctx.fillText("Xo'jayli tumani Ixtisoslashtirilgan Maktabi", canvas.width / 2, 180);

    // Awarded to
    ctx.fillStyle = "white";
    ctx.font = "24px Outfit, sans-serif";
    ctx.fillText("Ushbu sertifikat topshiriladi:", canvas.width / 2, 280);

    // Student Name
    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 60px Outfit, sans-serif";
    ctx.fillText(studentName, canvas.width / 2, 360);

    // Description
    ctx.fillStyle = "white";
    ctx.font = "26px Outfit, sans-serif";
    ctx.fillText(`${studentClass}-sinf o'quvchisi, ${studentSubject} fanidan`, canvas.width / 2, 450);
    ctx.fillText(`Ichki SHSB sinovida a'lo natija (${totalUserPoints.toFixed(1)} ball) ko'rsatganligi uchun.`, canvas.width / 2, 500);

    // Date and Signatures
    ctx.fillStyle = "#94a3b8";
    ctx.font = "20px Courier New, monospace";
    ctx.fillText(`Sana: ${new Date().toLocaleDateString()}`, 200, 620);
    ctx.fillText("Maktab ma'muriyati", 800, 620);

    // Line for signatures
    ctx.beginPath();
    ctx.moveTo(120, 590);
    ctx.lineTo(280, 590);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(700, 590);
    ctx.lineTo(900, 590);
    ctx.stroke();

    // Trigger Download
    const link = document.createElement('a');
    link.download = `Sertifikat_${studentName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// --- QR Code Generator (QRious) ---
function generateQR() {
    const url = window.location.href; // Assumes current URL is the portal
    new QRious({
        element: qrCanvas,
        value: url,
        size: 250,
        background: 'white',
        foreground: '#0f172a',
        level: 'H'
    });
}

downloadQrBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'QR_Kod_SHSB.png';
    link.href = qrCanvas.toDataURL('image/png');
    link.click();
});

// Utility to parse simple Markdown for Questions and Gemini Output
function parseMarkdownToHtml(md) {
    let html = md;
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
    html = html.replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>');
    html = html.replace(/<\/ul>\n<ul>/gim, '\n');
    html = html.replace(/^\d+\. (.*$)/gim, '<ol><li>$1</li></ol>');
    html = html.replace(/<\/ol>\n<ol>/gim, '\n');
    html = html.replace(/\n/g, '<br>');
    return html;
}

// Kickoff
init();
