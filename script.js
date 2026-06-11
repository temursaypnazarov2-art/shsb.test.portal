/**
 * shsb.test.portal - Script Logic with Docx, Telegram, Filters, Leaderboard, Canvas Cert & Audio
 * Author: Antigravity AI
 */

// --- Constants & Database ---
const HASHED_ADMIN_PASS = "YWRtaW4xMjNfc2hzYg==";

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
let storedQuestionsStr = localStorage.getItem('quiz_questions');
let questions = storedQuestionsStr ? JSON.parse(storedQuestionsStr) : JSON.parse(JSON.stringify(defaultSavollar));

// Force load defaultSavollar if database is completely empty so users don't see "Test topilmadi"
if (!questions || questions.length === 0) {
    questions = JSON.parse(JSON.stringify(defaultSavollar));
}
let results = JSON.parse(localStorage.getItem('quiz_results')) || [];
let quizDuration = parseInt(localStorage.getItem('quiz_duration')) || 20; // Default 20 mins
let tgBotToken = localStorage.getItem('tg_bot_token') || "";
let tgChatId = localStorage.getItem('tg_chat_id') || "";

let subjectPins = JSON.parse(localStorage.getItem('quiz_subject_pins')) || {
    "Ona tili": "", "Matematika": "", "Fizika": "", "Kimyo": "",
    "Biologiya": "", "Tarix": "", "Huquq": "", "Informatika": ""
};
let subjectDurations = JSON.parse(localStorage.getItem('quiz_subject_durations')) || {
    "Ona tili": 20, "Matematika": 20, "Fizika": 20, "Kimyo": 20,
    "Biologiya": 20, "Tarix": 20, "Huquq": 20, "Informatika": 20
};
let subjectQuarters = JSON.parse(localStorage.getItem('quiz_subject_quarters')) || {
    "Ona tili": "1", "Matematika": "1", "Fizika": "1", "Kimyo": "1",
    "Biologiya": "1", "Tarix": "1", "Huquq": "1", "Informatika": "1"
};
let teacherTokens = JSON.parse(localStorage.getItem('quiz_teacher_tokens')) || [];
let geminiApiKey = localStorage.getItem('gemini_api_key') || "";
let showAnswersToStudent = localStorage.getItem('quiz_show_answers') === 'true';
let currentTeacherSession = null; // Stores token object if logged in as teacher

// Save Helpers
function saveQuestions() {
    localStorage.setItem('quiz_questions', JSON.stringify(questions));
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
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const adminPanel = document.getElementById('admin-panel');
const lockScreen = document.getElementById('lock-screen');
const toastAlert = document.getElementById('toast');

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

        // Show Teacher specific UI blocks
        teacherTimerBanner.classList.remove('hidden');
        teacherPinSetter.classList.remove('hidden');
        filterClass.value = 'all';

        // Start Teacher Timer
        clearInterval(teacherTimerInterval);
        updateTeacherTimer();
        teacherTimerInterval = setInterval(updateTeacherTimer, 1000);

        // Pre-fill Teacher PIN/Duration/Quarter
        teacherSubjectPin.value = subjectPins[currentTeacherSession.subject] || "";
        teacherSubjectDuration.value = subjectDurations[currentTeacherSession.subject] || 20;
        teacherSubjectQuarter.value = subjectQuarters[currentTeacherSession.subject] || "1";

        showToast(`Xush kelibsiz, ${currentTeacherSession.name}`);
    } else {
        // Admin Mode: Ensure everything is visible
        tabSettingsBtn.classList.remove('hidden');
        tabQrcodeBtn.classList.remove('hidden');
        tabSecurityBtn.classList.remove('hidden');
        document.querySelector('.admin-header h2').textContent = "Boshqaruv Paneli (Admin)";

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
    const subj = currentTeacherSession.subject;

    subjectPins[subj] = pin;
    subjectDurations[subj] = dur;
    subjectQuarters[subj] = teacherSubjectQuarter.value;

    localStorage.setItem('quiz_subject_pins', JSON.stringify(subjectPins));
    localStorage.setItem('quiz_subject_durations', JSON.stringify(subjectDurations));
    localStorage.setItem('quiz_subject_quarters', JSON.stringify(subjectQuarters));

    alert(t('teacherPinSaved') || "Faningiz uchun sozlamalar muvaffaqiyatli saqlandi!");
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

addQBtn.addEventListener('click', () => {
    const text = newQText.value.trim();
    const opt0 = newQOpt0.value.trim();
    const opt1 = newQOpt1.value.trim();
    const opt2 = newQOpt2.value.trim();
    const opt3 = newQOpt3.value.trim();
    const corr = parseInt(newQCorrect.value);
    const pts = parseFloat(newQPoints.value);
    let subj = newQSubject.value;

    if (currentTeacherSession) {
        subj = currentTeacherSession.subject;
    }

    if (!text || !opt0 || !opt1 || !opt2 || !opt3 || isNaN(pts)) {
        showToast(t('alertFillFields'));
        return;
    }

    questions.push({
        subject: subj,
        question: text,
        options: [opt0, opt1, opt2, opt3],
        correct: corr,
        points: pts
    });

    saveQuestions();
    renderQuestionsList();

    // Clear inputs
    newQText.value = '';
    newQOpt0.value = '';
    newQOpt1.value = '';
    newQOpt2.value = '';
    newQOpt3.value = '';
    newQPoints.value = '1';

    showToast(t('msgQuestionAdded'));
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
                    points: pointsVal
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
            points: pointsVal
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

    if (currentTeacherSession) {
        exportData = results.filter(r => r.subject === currentTeacherSession.subject);
        subjText = currentTeacherSession.subject;
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

    // We assume the first student's detail holds the correct metadata for this subset
    exportData.forEach(r => {
        if (r.details && r.details.length > maxQuestionsLength) {
            maxQuestionsLength = r.details.length;
            maxTotalPointsPossible = r.details.reduce((sum, d) => sum + (d.maxPoints || 0), 0);
        }
    });

    const currentYear = new Date().getFullYear();
    const currentDateStr = new Date().toLocaleDateString('uz-UZ');

    // Prepare Sheet Data Array
    let wsData = [];

    // Rows 1-3: Headers (Merged later)
    wsData.push([`Qaraqalpaqstan Respublikası Xojeyli rayonı qánigelestirilgen mektebiniń ${classText} klass, ${currentYear}-sherek`]);
    wsData.push([`${subjText.toUpperCase()} páninen ótkerilgen I-SHSB NÁTIYJELERI`]);
    wsData.push([""]); // Empty row 3

    // Row 4: Statistics
    let statRow = [""];
    statRow[1] = `SHSB ótkerilgen sáne: ${currentDateStr} | Sorawlar sanı: ${maxQuestionsLength} | Max ball: ${maxTotalPointsPossible.toFixed(1)} | Oqıwshılar sanı: ${exportData.length}`;
    wsData.push(statRow);

    // Row 5: Table Headers
    let headerRow = ["№", "Oqıwshınıń familiyası, atı"];

    // Add question columns with their respective max points dynamically based on first student's details
    let sampleStudentDetails = exportData.find(r => r.details && r.details.length === maxQuestionsLength)?.details || [];

    for (let i = 0; i < maxQuestionsLength; i++) {
        let maxP = sampleStudentDetails[i] ? sampleStudentDetails[i].maxPoints : 1;
        headerRow.push(`${i + 1}-soraw (${maxP} b)`);
    }

    headerRow.push("JÁMI");
    headerRow.push("%");
    wsData.push(headerRow);

    // Rows 6+: Student Data
    exportData.sort((a, b) => b.percentage - a.percentage);

    exportData.forEach((student, index) => {
        let row = [index + 1, student.name];

        let totalScore = 0;
        for (let i = 0; i < maxQuestionsLength; i++) {
            if (student.details && student.details[i]) {
                const earned = student.details[i].earnedPoints || 0;
                row.push(earned.toFixed(1));
                totalScore += earned;
            } else {
                row.push(0);
            }
        }

        row.push(totalScore.toFixed(1));
        row.push(`${student.percentage}%`);
        wsData.push(row);
    });

    // Create Workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Styling & Merging
    // A1 to max column merge
    const maxColIndex = 1 + maxQuestionsLength + 2; // № + Name + N_Questions + JÁMI + %

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
        ws['!cols'][i + 2] = { wch: 12 }; // Questions
    }
    ws['!cols'][maxQuestionsLength + 2] = { wch: 10 }; // JAMI
    ws['!cols'][maxQuestionsLength + 3] = { wch: 10 }; // %

    XLSX.utils.book_append_sheet(wb, ws, "Natijalar");

    const fileName = `SHSB_${subjText.replace(/\s+/g, '_')}_${classText}_${currentDateStr}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showToast(`Excel fayl yuklandi: ${fileName}`);
});

// --- Gemini API Call logic ---
geminiAnalyzeBtn.addEventListener('click', async () => {
    if (!geminiApiKey) {
        alert(t('alertGeminiKey') || "API kilit sozlanmagan!");
        return;
    }

    if (results.length === 0) {
        alert("Natijalar mavjud emas!");
        return;
    }

    geminiAnalyzeBtn.disabled = true;
    geminiAnalyzeBtn.textContent = t('analyzingAI') || "Tahlil qilinmoqda...";
    geminiAnalysisOutput.textContent = "";

    try {
        const statsStr = JSON.stringify(results.map(r => ({
            name: r.name, class: r.class, subject: r.subject, score: r.score, percentage: r.percentage
        })));

        const prompt = `Men o'qituvchiman. Quyida mening o'quvchilarimning test natijalari ro'yxati berilgan. Iltimos, ushbu natijalarni tahlil qilib, o'quvchilarning umumiy o'zlashtirish darajasi, oqsiyotgan mavzular (yoki past ball olganlar) va ularga qanday pedagogik yondashish kerakligi haqida chuqur, kasbiy va ilhomlantiruvchi xulosa yozib bering. Xulosani Markdown formatida, chiroyli sarlavhalar va ro'yxatlar bilan O'zbek tilida tayyorlang.\nNatijalar:\n${statsStr}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
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
        geminiAnalysisOutput.innerHTML = parseMarkdownToHtml(mdText);

    } catch (error) {
        geminiAnalysisOutput.textContent = "Xatolik yuz berdi: " + error.message;
    } finally {
        geminiAnalyzeBtn.disabled = false;
        geminiAnalyzeBtn.textContent = t('btnAnalyzeAI') || "AI Xulosasini Olish";
    }
});

// --- Quiz Start Logic ---
startBtn.addEventListener('click', () => {
    studentName = studentNameInput.value.trim();
    studentClass = studentClassInput.value;
    studentSubject = studentSubjectInput.value;
    studentQuarter = subjectQuarters[studentSubject] || "1";
    const pin = quizPinInput.value.trim();

    if (!studentName || !studentClass || !studentSubject) {
        alert(t('alertDetails') || "Barcha ma'lumotlarni to'ldiring!");
        return;
    }

    // Verify PIN globally
    const expectedPin = subjectPins[studentSubject];
    if (expectedPin && expectedPin !== "" && pin !== expectedPin) {
        alert(t('alertWrongPin') || "Maxsus kod noto'g'ri kiritildi!");
        return;
    }

    currentQuizQuestions = questions.filter(q => q.subject === studentSubject);

    if (currentQuizQuestions.length === 0) {
        alert(t('alertNoQuestions'));
        return;
    }

    // Fetch dynamic duration for this subject
    let activeDuration = subjectDurations[studentSubject] || quizDuration;

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
    testTimeLimitSeconds = activeDuration * 60;

    authScreen.classList.add('hidden');
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

    optionsContainer.innerHTML = '';

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
    if (studentAnswers[currentQuestionIndex] === q.correct) {
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
        correctIndex: q.correct
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
        div.innerHTML = `
            <div class="review-q">${m.question}</div>
            <div class="review-correct-ans">Tog'ri javob: ${currentQuizQuestions.find(q => q.question === m.question).options[m.correctIndex]}</div>
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
