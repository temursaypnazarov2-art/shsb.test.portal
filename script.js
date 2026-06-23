/**
 * shsb.test.portal - Script Logic with Docx, Telegram, Filters, Leaderboard, Canvas Cert & Audio
 * Author: Antigravity AI
 */

// --- Constants & Database ---
const HASHED_ADMIN_PASS = "YWRtaW4xMjNfc2hzYg==";
const SUBJECTS = ["Ona tili", "Matematika", "Fizika", "Kimyo", "Biologiya", "Tarix", "Huquq", "Informatika"];
const PIN_INPUT_IDS = ['pin-onatili', 'pin-matematika', 'pin-fizika', 'pin-kimyo', 'pin-biologiya', 'pin-tarix', 'pin-huquq', 'pin-informatika'];
const DUR_INPUT_IDS = ['dur-onatili', 'dur-matematika', 'dur-fizika', 'dur-kimyo', 'dur-biologiya', 'dur-tarix', 'dur-huquq', 'dur-informatika'];
const QUARTERS = ["1", "2", "3", "4"];

function getGeminiApiKey() {
    const key = (localStorage.getItem('gemini_api_key') || '').trim();
    return key && key !== 'Sizning_API_Kalitingiz' ? key : '';
}

function ensureSubjectQuarterMaps() {
    SUBJECTS.forEach(subj => {
        if (!subjectPinsDatabase[subj]) subjectPinsDatabase[subj] = { "1": "", "2": "", "3": "", "4": "" };
        if (!subjectDurationsDatabase[subj]) subjectDurationsDatabase[subj] = { "1": 20, "2": 20, "3": 20, "4": 20 };
        if (!subjectTestTypesDatabase[subj]) subjectTestTypesDatabase[subj] = { "1": "BSB", "2": "BSB", "3": "BSB", "4": "BSB" };
        if (!subjectUnblockPinsDatabase[subj]) subjectUnblockPinsDatabase[subj] = { "1": "admin123", "2": "admin123", "3": "admin123", "4": "admin123" };
        if (!subjectClassesDatabase[subj]) subjectClassesDatabase[subj] = { "1": "all", "2": "all", "3": "all", "4": "all" };
        QUARTERS.forEach(q => {
            if (subjectPinsDatabase[subj][q] === undefined) subjectPinsDatabase[subj][q] = "";
            if (subjectDurationsDatabase[subj][q] === undefined) subjectDurationsDatabase[subj][q] = 20;
            if (subjectTestTypesDatabase[subj][q] === undefined) subjectTestTypesDatabase[subj][q] = "BSB";
            if (subjectUnblockPinsDatabase[subj][q] === undefined) subjectUnblockPinsDatabase[subj][q] = "admin123";
            if (subjectClassesDatabase[subj][q] === undefined) subjectClassesDatabase[subj][q] = "all";
        });
    });
}

function loadAdminPinFields(quarter) {
    ensureSubjectQuarterMaps();
    SUBJECTS.forEach((subj, index) => {
        const el = document.getElementById(PIN_INPUT_IDS[index]);
        const durEl = document.getElementById(DUR_INPUT_IDS[index]);
        if (el) el.value = subjectPinsDatabase[subj][quarter] || "";
        if (durEl) durEl.value = subjectDurationsDatabase[subj][quarter] || 20;
    });
}

function saveAdminPinFields(quarter) {
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
}

function setAdminActiveQuarter(quarter, syncSelectors = true) {
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
}

const defaultSavollar = [
    // --- Ona tili (5-11 sinf namunasi) ---
    { subject: "Ona tili", question: "18-bob. Fe'l nisbatlari nechta turga bo'linadi?", options: ["3 ta", "4 ta", "5 ta", "6 ta"], correct: 2, points: 2.0 },
    { subject: "Ona tili", question: "19-bob. Qo'shma gaplarning qanday turlari mavjud?", options: ["Bog'langan va ergashgan", "Sodda va murakkab", "To'liqsiz va to'liq", "Yoyiq va yig'iq"], correct: 0, points: 2.0 },
    { subject: "Ona tili", question: "20-bob. O'zlashtirma gap qanday qo'shtirnoq ichiga olinadi?", options: ["Sohibining so'zidan oldin", "Bosh harf bilan boshlanib qo'shtirnoqda beriladi", "Doim qavs ichida yoziladi", "Nuqtadan keyin ajratiladi"], correct: 1, points: 2.0 },

    // --- Matematika (5-11 sinf namunasi) ---
    { subject: "Matematika", question: "18-bob. Uchburchakning ichki burchaklari yig'indisi nimaga teng?", options: ["90\u00B0", "180\u00B0", "360\u00B0", "270\u00B0"], correct: 1, points: 3.0 },
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

// --- Firebase Configuration ---
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
} catch (e) {
    console.error("Firebase init error", e);
}

// Global Variables
let questions = [];
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

                const toggleBtn = document.getElementById('toggleShowAnswersBtn');
                if (toggleBtn) {
                    if (showAnswersToStudent) {
                        toggleBtn.style.backgroundColor = '#10b981';
                        toggleBtn.textContent = typeof t === 'function' ? (t('btnShowAnswersOn') || "Javoblarni ko'rsatish: YOQILGAN") : "Javoblarni ko'rsatish: YOQILGAN";
                    } else {
                        toggleBtn.style.backgroundColor = '#ef4444';
                        toggleBtn.textContent = typeof t === 'function' ? (t('btnShowAnswersOff') || "Javoblarni ko'rsatish: O'CHIRILGAN") : "Javoblarni ko'rsatish: O'CHIRILGAN";
                    }
                }
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

let isTestActive = false;

ensureSubjectQuarterMaps();

const staticTeacherPasswords = {
    '3UTYGB': 'Ona tili'
};

function saveQuestions() {
    if (database) database.ref('questionsDatabase').set(questionsDatabase);
}
function saveResults() {
    if (database) database.ref('resultsDatabase').set(resultsDatabase);
}

function getResultsArray(filterQ) {
    if (filterQ === 'all' || !filterQ) {
        return [
            ...(resultsDatabase["1"] || []),
            ...(resultsDatabase["2"] || []),
            ...(resultsDatabase["3"] || []),
            ...(resultsDatabase["4"] || [])
        ];
    }
    return [...(resultsDatabase[filterQ] || [])];
}

function saveSettings(duration, token, chatId) {
    const gKeyEl = document.getElementById('gemini-api-key');
    if (gKeyEl) {
        geminiApiKey = gKeyEl.value.trim();
        localStorage.setItem('gemini_api_key', geminiApiKey);
    }

    quizDuration = duration;
    tgBotToken = token;
    tgChatId = chatId;
    if (database) {
        database.ref('quizDuration').set(quizDuration);
        database.ref('tgBotToken').set(tgBotToken);
        database.ref('tgChatId').set(tgChatId);
    }

    const quarterEl = document.getElementById('admin-settings-quarter');
    const quarter = quarterEl ? quarterEl.value : adminActiveQuarter;
    saveAdminPinFields(quarter);
    setAdminActiveQuarter(quarter, true);

    const toggleEl = document.getElementById('toggle-show-answers');
    if (toggleEl) {
        showAnswersToStudent = toggleEl.checked;
        if (database) database.ref('showAnswersToStudent').set(showAnswersToStudent);
    }
}
function saveTeacherTokens() {
    if (database) database.ref('teacherTokens').set(teacherTokens);
}

let currentQuestionIndex = 0;
let totalUserPoints = 0;
let studentName = "";
let studentClass = "";
let studentSubject = "";
let studentQuarter = "";
let currentQuizQuestions = [];
let studentAnswers = [];
let earnedPoints = [];
let isLocked = false;
let blockCount = 0;
let testTimeLimitSeconds = 0;
let timeElapsedSeconds = 0;
let timerInterval;
let toastTimeout;

let audioCtx = null;
let analyticsChartInstance = null;

function seedDefaultQuestions() {
    const total = QUARTERS.reduce((sum, q) => sum + (questionsDatabase[q]?.length || 0), 0);
    if (total > 0) return;
    defaultSavollar.forEach(q => {
        questionsDatabase["1"].push({
            ...q,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            type: 'closed',
            targetClass: 'all',
            cognitive: 'Bilish'
        });
    });
    saveQuestions();
    questions = questionsDatabase[adminActiveQuarter];
}

function seedDefaultPins() {
    ensureSubjectQuarterMaps();
    let hasPin = false;
    SUBJECTS.forEach(subj => {
        if (subjectPinsDatabase[subj]?.["1"]) hasPin = true;
    });
    if (hasPin) return;
    SUBJECTS.forEach(subj => {
        subjectPinsDatabase[subj]["1"] = "SHSB1";
    });
    if (database) database.ref('subjectPinsDatabase').set(subjectPinsDatabase);
}

const authScreen = document.getElementById('auth-screen');
const instructionScreen = document.getElementById('instruction-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const adminPanel = document.getElementById('admin-panel');
const lockScreen = document.getElementById('lock-screen');
const toastAlert = document.getElementById('toast');

const instTitle = document.getElementById('inst-title');
const instTime = document.getElementById('inst-time');
const instCount = document.getElementById('inst-count');
const beginTestBtn = document.getElementById('begin-test-btn');

const studentLoginSection = document.getElementById('student-login-section');
const adminLoginSection = document.getElementById('admin-login-section');
const backToStudentBtn = document.getElementById('back-to-student-btn');

const studentNameInput = document.getElementById('student-name');
const studentClassInput = document.getElementById('student-class');
const studentSubjectInput = document.getElementById('student-subject');
const quizPinInput = document.getElementById('quiz-pin');
const adminSettingsQuarter = document.getElementById('admin-settings-quarter');
const adminQuestionsQuarter = document.getElementById('admin-questions-quarter');
const startBtn = document.getElementById('start-btn');
const adminLoginBtn = document.getElementById('admin-login-btn');
const leaderboardBody = document.getElementById('leaderboard-body');

const adminPortalPassInput = document.getElementById('admin-portal-pass');
const adminAuthSubmit = document.getElementById('admin-auth-submit');
const adminAuthError = document.getElementById('admin-auth-error');

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
const clearResultsBtn = document.getElementById('clear-results-btn');
const exportExcelBtn = document.getElementById('export-excel-btn');
const filterClass = document.getElementById('filter-class');

const testDurationInput = document.getElementById('quiz-duration');

const compQ1 = document.getElementById('comp-q1');
const compQ2 = document.getElementById('comp-q2');
const analyzeBtn = document.getElementById('analyze-btn');
const comparisonResult = document.getElementById('comparison-result');
const filterQuarter = document.getElementById('filter-quarter');

const tgBotTokenInput = document.getElementById('tg-bot-token');
const tgChatIdInput = document.getElementById('tg-chat-id');

const teacherNameInput = document.getElementById('teacher-name-input');
const teacherSubjectSelect = document.getElementById('teacher-subject-select');
const tempPasswordExpiry = document.getElementById('tempPasswordExpiry');
const generateTokenBtn = document.getElementById('generate-token-btn');
const teacherTokensList = document.getElementById('teacher-tokens-list');

const wordFileInput = document.getElementById('word-file-input');
const wordUploadBtn = document.getElementById('word-upload-btn');

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

const certificateZone = document.getElementById('certificate-zone');
const downloadCertBtn = document.getElementById('download-cert-btn');
const errorReviewList = document.getElementById('error-review-list');

const adminPassInput = document.getElementById('admin-pass');
const unlockBtn = document.getElementById('unlock-btn');
const unlockError = document.getElementById('unlock-error');

const qrCanvas = document.getElementById('qr-canvas');
const downloadQrBtn = document.getElementById('download-qr-btn');

function init() {
    try {
        syncFromFirebase();
        seedDefaultPins();
        if (!questions) questions = [];
        if (totalQuestionsSpan) totalQuestionsSpan.textContent = questions.length;
        if (testDurationInput) testDurationInput.value = quizDuration;
        if (tgBotTokenInput) tgBotTokenInput.value = tgBotToken;
        if (tgChatIdInput) tgChatIdInput.value = tgChatId;

        setAdminActiveQuarter(adminActiveQuarter, true);
        loadAdminPinFields(adminActiveQuarter);

        const gKeyEl = document.getElementById('gemini-api-key');
        if (gKeyEl) gKeyEl.value = geminiApiKey;

        const toggleBtn = document.getElementById('toggleShowAnswersBtn');
        if (toggleBtn) {
            // Initial state
            if (showAnswersToStudent) {
                toggleBtn.style.backgroundColor = '#10b981';
                toggleBtn.setAttribute('data-i18n', 'btnShowAnswersOn');
                toggleBtn.textContent = typeof t === 'function' ? (t('btnShowAnswersOn') || "Javoblarni ko'rsatish: YOQILGAN") : "Javoblarni ko'rsatish: YOQILGAN";
            } else {
                toggleBtn.style.backgroundColor = '#ef4444';
                toggleBtn.setAttribute('data-i18n', 'btnShowAnswersOff');
                toggleBtn.textContent = typeof t === 'function' ? (t('btnShowAnswersOff') || "Javoblarni ko'rsatish: O'CHIRILGAN") : "Javoblarni ko'rsatish: O'CHIRILGAN";
            }

            toggleBtn.addEventListener('click', () => {
                showAnswersToStudent = !showAnswersToStudent;
                if (database) database.ref('showAnswersToStudent').set(showAnswersToStudent);
                if (showAnswersToStudent) {
                    toggleBtn.style.backgroundColor = '#10b981';
                    toggleBtn.setAttribute('data-i18n', 'btnShowAnswersOn');
                    toggleBtn.textContent = typeof t === 'function' ? (t('btnShowAnswersOn') || "Javoblarni ko'rsatish: YOQILGAN") : "Javoblarni ko'rsatish: YOQILGAN";
                } else {
                    toggleBtn.style.backgroundColor = '#ef4444';
                    toggleBtn.setAttribute('data-i18n', 'btnShowAnswersOff');
                    toggleBtn.textContent = typeof t === 'function' ? (t('btnShowAnswersOff') || "Javoblarni ko'rsatish: O'CHIRILGAN") : "Javoblarni ko'rsatish: O'CHIRILGAN";
                }
            });
        }

        if (adminSettingsQuarter) {
            if (adminSettingsQuarter) adminSettingsQuarter.addEventListener('change', (e) => {
                const quarter = e.target.value;
                setAdminActiveQuarter(quarter, true);
                loadAdminPinFields(quarter);
            });
        }
        if (adminQuestionsQuarter) {
            if (adminQuestionsQuarter) adminQuestionsQuarter.addEventListener('change', (e) => {
                const quarter = e.target.value;
                setAdminActiveQuarter(quarter, true);
                renderQuestionsList();
            });
        }

        renderQuestionsList();
        renderResultsTable();
        renderTeacherTokens();
        populateClassFilters();
        renderLeaderboard();
        setupAntiCheat();
        if (typeof toggleQuestionFormat === 'function') toggleQuestionFormat();
    } catch (error) {
        console.error("Init Error:", error);
        alert("Dastur yuklanishida xatolik yuz berdi: " + error.message + " (" + error.stack + ")");
    }
}

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
            oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(880.00, audioCtx.currentTime + 0.1);
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
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
            oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.4);
        }
    } catch (e) {
        console.log('Audio error:', e);
    }
}

if (adminLoginBtn) adminLoginBtn.addEventListener('click', () => {
    studentLoginSection.classList.add('hidden');
    adminLoginSection.classList.remove('hidden');
    adminPortalPassInput.value = "";
    adminAuthError.classList.add('hidden');
    adminPortalPassInput.focus();
});

if (backToStudentBtn) backToStudentBtn.addEventListener('click', () => {
    adminLoginSection.classList.add('hidden');
    studentLoginSection.classList.remove('hidden');
});

if (adminAuthSubmit) adminAuthSubmit.addEventListener('click', handleAdminAuth);
if (adminPortalPassInput) adminPortalPassInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAdminAuth();
});

function handleAdminAuth() {
    const inputPass = adminPortalPassInput.value.trim();
    if (!inputPass) return;

    if (btoa(inputPass) === HASHED_ADMIN_PASS) {
        currentTeacherSession = null;
        openAdminPanelUI();
        return;
    }

    if (staticTeacherPasswords[inputPass]) {
        currentTeacherSession = { subject: staticTeacherPasswords[inputPass] };
        openAdminPanelUI();
        return;
    }

    const now = new Date().getTime();
    const existingToken = teacherTokens.find(t => t.token === inputPass);
    if (existingToken) {
        if (existingToken.expireAt <= now) {
            adminAuthError.textContent = t('tempPasswordExpired') || "Vaqtinchalik parol muddati tugagan!";
            adminAuthError.classList.remove('hidden');
            playSound('wrong');
            return;
        }
        currentTeacherSession = existingToken;
        openAdminPanelUI();
        return;
    }

    adminAuthError.textContent = t('incorrectPass') || "Noto'g'ri parol!";
    adminAuthError.classList.remove('hidden');
    playSound('wrong');
}

function openAdminPanelUI() {
    currentScreen = 'admin';
    adminLoginSection.classList.add('hidden');
    authScreen.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    testDurationInput.value = quizDuration;

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    tabQuestionsBtn.classList.add('active');
    tabQuestions.classList.remove('hidden');

    if (currentTeacherSession) {
        tabSettingsBtn.classList.add('hidden');
        tabQrcodeBtn.classList.add('hidden');
        tabSecurityBtn.classList.add('hidden');

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
        subjLabel.textContent = currentTeacherSession.subject;

        teacherTimerBanner.classList.remove('hidden');
        teacherPinSetter.classList.remove('hidden');
        const adminQuarterSelector = document.getElementById('admin-quarter-selector');
        if (adminQuarterSelector) adminQuarterSelector.classList.add('hidden');
        filterClass.value = 'all';

        clearInterval(teacherTimerInterval);
        updateTeacherTimer();
        teacherTimerInterval = setInterval(updateTeacherTimer, 1000);

        const subj = currentTeacherSession.subject;
        const qtr = teacherSubjectQuarter.value;
        questions = questionsDatabase[qtr];

        teacherSubjectPin.value = subjectPinsDatabase[subj][qtr] || "";
        teacherSubjectDuration.value = subjectDurationsDatabase[subj][qtr] || 20;
        const unblockPasswordInput = document.getElementById('unblockPasswordInput');
        if (unblockPasswordInput) unblockPasswordInput.value = subjectUnblockPinsDatabase[subj][qtr] || "admin123";
        if (teacherSubjectTestType) teacherSubjectTestType.value = subjectTestTypesDatabase[subj][qtr] || "BSB";
        const testTargetClass = document.getElementById('testTargetClass');
        if (testTargetClass) testTargetClass.value = subjectClassesDatabase[subj][qtr] || "all";

        showToast(`Xush kelibsiz, ${currentTeacherSession.name || currentTeacherSession.subject}`);
        
        // Show June 30 timer ONLY for static subject passwords, hide for temporary tokens
        if (!currentTeacherSession.expireAt) {
            startAdminLicenseTimer();
        } else {
            let banner = document.getElementById('admin-license-banner');
            if (banner) banner.style.display = 'none';
            if (window.adminLicenseInterval) clearInterval(window.adminLicenseInterval);
        }
    } else {
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
        const adminQuarterSelector = document.getElementById('admin-quarter-selector');
        if (adminQuarterSelector) adminQuarterSelector.classList.remove('hidden');
        clearInterval(teacherTimerInterval);

        setAdminActiveQuarter(adminActiveQuarter, true);
        loadAdminPinFields(adminActiveQuarter);

        let banner = document.getElementById('admin-license-banner');
        if (banner) banner.style.display = 'none';
        if (window.adminLicenseInterval) clearInterval(window.adminLicenseInterval);

        showToast("Admin paneliga kirdingiz!");
    }

    renderQuestionsList();
    renderResultsTable();
}

function startAdminLicenseTimer() {
    let banner = document.getElementById('admin-license-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'admin-license-banner';
        banner.style.cssText = 'width: 100%; max-width: 1000px; background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; border-radius: 12px; padding: 15px; margin-bottom: 20px; text-align: center; color: white; display: flex; justify-content: center; align-items: center; gap: 10px; font-size: 1.1rem;';
        
        const adminPanelContent = document.querySelector('#admin-panel');
        if (adminPanelContent) {
            adminPanelContent.insertBefore(banner, adminPanelContent.firstChild);
        }
    } else {
        banner.style.display = 'flex';
    }
    
    if (window.adminLicenseInterval) clearInterval(window.adminLicenseInterval);
    
    const targetDate = new Date("2026-06-30T23:59:59").getTime();
    
    function updateTimer() {
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        if (distance < 0) {
            banner.innerHTML = `<strong>Sizning adminlik huquqingiz muddati tugagan!</strong>`;
            clearInterval(window.adminLicenseInterval);
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        banner.innerHTML = `<span style="font-size: 1.5rem;">⏱</span> <strong>Sizning adminlik huquqingiz tugashiga <span style="color: #fef08a;">${days} kun, ${hours} soat, ${minutes} daqiqa, ${seconds} soniya</span> qoldi</strong>`;
    }
    
    updateTimer();
    window.adminLicenseInterval = setInterval(updateTimer, 1000);
}

function updateTeacherTimer() {
    if (!currentTeacherSession || !currentTeacherSession.expireAt) return;
    const now = new Date().getTime();
    const diff = currentTeacherSession.expireAt - now;

    if (diff <= 0) {
        clearInterval(teacherTimerInterval);
        alert("Sizning vaqtinchalik ruxsatnomangiz o'z nihoyasiga yetdi!");
        adminLogoutBtn.click();
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    let timeString = '';
    if (days > 0) timeString += `${days} kun, `;
    if (hours > 0 || days > 0) timeString += `${hours} soat, `;
    
    const mStr = minutes < 10 ? '0' + minutes : minutes;
    const sStr = seconds < 10 ? '0' + seconds : seconds;
    timeString += `${mStr}:${sStr}`;
    
    teacherTimerText.textContent = timeString;
}

if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', () => {
    adminPanel.classList.add('hidden');
    authScreen.classList.remove('hidden');
    adminLoginSection.classList.add('hidden');
    studentLoginSection.classList.remove('hidden');
    currentTeacherSession = null;
    currentScreen = 'auth';
    clearInterval(teacherTimerInterval);
    renderLeaderboard();
});

if (saveTeacherPinBtn) saveTeacherPinBtn.addEventListener('click', () => {
    if (!currentTeacherSession) return;
    const pin = teacherSubjectPin.value.trim();
    const dur = parseInt(teacherSubjectDuration.value) || 20;
    const testType = teacherSubjectTestType ? teacherSubjectTestType.value : "BSB";
    const unblockPasswordInput = document.getElementById('unblockPasswordInput');
    const unblockPin = unblockPasswordInput ? unblockPasswordInput.value.trim() : "admin123";
    const testTargetClass = document.getElementById('testTargetClass');
    const targetClass = testTargetClass ? testTargetClass.value : "all";
    const subj = currentTeacherSession.subject;
    const qtr = teacherSubjectQuarter.value;

    if (!subjectPinsDatabase[subj]) subjectPinsDatabase[subj] = { "1": "", "2": "", "3": "", "4": "" };
    if (!subjectDurationsDatabase[subj]) subjectDurationsDatabase[subj] = { "1": 20, "2": 20, "3": 20, "4": 20 };
    if (!subjectTestTypesDatabase[subj]) subjectTestTypesDatabase[subj] = { "1": "BSB", "2": "BSB", "3": "BSB", "4": "BSB" };
    if (!subjectUnblockPinsDatabase[subj]) subjectUnblockPinsDatabase[subj] = { "1": "admin123", "2": "admin123", "3": "admin123", "4": "admin123" };
    if (!subjectClassesDatabase[subj]) subjectClassesDatabase[subj] = { "1": "all", "2": "all", "3": "all", "4": "all" };

    subjectPinsDatabase[subj][qtr] = pin;
    subjectDurationsDatabase[subj][qtr] = dur;
    subjectTestTypesDatabase[subj][qtr] = testType;
    subjectUnblockPinsDatabase[subj][qtr] = unblockPin || "admin123";
    subjectClassesDatabase[subj][qtr] = targetClass;
    subjectQuarters[subj] = qtr;

    if (database) {
        database.ref('subjectPinsDatabase').set(subjectPinsDatabase);
        database.ref('subjectDurationsDatabase').set(subjectDurationsDatabase);
        database.ref('subjectTestTypesDatabase').set(subjectTestTypesDatabase);
        database.ref('subjectUnblockPinsDatabase').set(subjectUnblockPinsDatabase);
        database.ref('subjectClassesDatabase').set(subjectClassesDatabase);
        database.ref('subjectQuarters').set(subjectQuarters);
    }

    alert("Faningiz uchun sozlamalar muvaffaqiyatli saqlandi!");
    questions = questionsDatabase[qtr];

    teacherSubjectPin.value = subjectPinsDatabase[subj][qtr] || "";
    teacherSubjectDuration.value = subjectDurationsDatabase[subj][qtr] || 20;
    if (teacherSubjectTestType) teacherSubjectTestType.value = subjectTestTypesDatabase[subj][qtr] || "BSB";
    if (unblockPasswordInput) unblockPasswordInput.value = subjectUnblockPinsDatabase[subj][qtr] || "admin123";

    renderQuestionsList();
});

if (teacherSubjectQuarter) teacherSubjectQuarter.addEventListener('change', () => {
    if (!currentTeacherSession) return;
    const qtr = teacherSubjectQuarter.value;
    const subj = currentTeacherSession.subject;

    subjectQuarters[subj] = qtr;
    questions = questionsDatabase[qtr];

    teacherSubjectPin.value = subjectPinsDatabase[subj][qtr] || "";
    teacherSubjectDuration.value = subjectDurationsDatabase[subj][qtr] || 20;
    if (teacherSubjectTestType) teacherSubjectTestType.value = subjectTestTypesDatabase[subj][qtr] || "BSB";
    const unblockPasswordInput = document.getElementById('unblockPasswordInput');
    if (unblockPasswordInput) unblockPasswordInput.value = subjectUnblockPinsDatabase[subj][qtr] || "admin123";
    const testTargetClass = document.getElementById('testTargetClass');
    if (testTargetClass) testTargetClass.value = subjectClassesDatabase[subj][qtr] || "all";

    renderQuestionsList();
});

Object.keys({
    'tab-questions-btn': 'tab-questions',
    'tab-results-btn': 'tab-results',
    'tab-settings-btn': 'tab-settings',
    'tab-qrcode-btn': 'tab-qrcode',
    'tab-security-btn': 'tab-security'
}).forEach(btnId => {
    document.getElementById(btnId).addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
        e.target.classList.add('active');
        document.getElementById({
            'tab-questions-btn': 'tab-questions',
            'tab-results-btn': 'tab-results',
            'tab-settings-btn': 'tab-settings',
            'tab-qrcode-btn': 'tab-qrcode',
            'tab-security-btn': 'tab-security'
        }[btnId]).classList.remove('hidden');
        if (btnId === 'tab-qrcode-btn') generateQR();
    });
});

if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', () => {
    let dur = parseInt(testDurationInput.value);
    if (isNaN(dur) || dur < 1) {
        dur = 20;
    }
    const token = tgBotTokenInput.value.trim();
    const chatId = tgChatIdInput.value.trim();

    saveSettings(dur, token, chatId);
    alert(typeof t === 'function' ? (t('msgSettingsSaved') || "Sozlamalar saqlandi!") : "Sozlamalar saqlandi!");
});

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

if (generateTokenBtn) generateTokenBtn.addEventListener('click', () => {
    const tName = teacherNameInput.value.trim();
    const tSubj = teacherSubjectSelect.value;
    const expiryVal = tempPasswordExpiry.value;

    if (!tName) {
        showToast("Iltimos o'qituvchi ismini kiriting!");
        return;
    }
    if (!expiryVal) {
        showToast(t('tempPasswordExpired') || "Iltimos amal qilish muddatini tanlang!");
        return;
    }

    const expireTime = new Date(expiryVal).getTime();
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

    const activeDisplay = document.getElementById('activeTempPasswordDisplay');
    if (activeDisplay) {
        const validTokens = teacherTokens.filter(t => t.expireAt > now);
        if (validTokens.length > 0) {
            const latest = validTokens[validTokens.length - 1];
            const dateStr = `${new Date(latest.expireAt).getFullYear()}-${String(new Date(latest.expireAt).getMonth() + 1).padStart(2, '0')}-${String(new Date(latest.expireAt).getDate()).padStart(2, '0')} ${String(new Date(latest.expireAt).getHours()).padStart(2, '0')}:${String(new Date(latest.expireAt).getMinutes()).padStart(2, '0')}`;
            activeDisplay.innerHTML = `<span data-i18n="currentActiveToken">${t('currentActiveToken') || 'Joriy vaqtinchalik parol:'}</span> <strong style="font-family:monospace; color:var(--text-color);">${latest.token}</strong> | <span data-i18n="thExpireDate">${t('thExpireDate') || 'Amal qilish muddati:'}</span> ${dateStr}`;
        } else {
            activeDisplay.innerHTML = `<span data-i18n="noActiveToken">${t('noActiveToken') || 'Faol vaqtinchalik parol mavjud emas'}</span>`;
        }
    }

    if (teacherTokens.length === 0) {
        teacherTokensList.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Faol tokenlar yo'q</td></tr>";
        return;
    }

    teacherTokens.forEach(t => {
        const isExpired = t.expireAt <= now;
        const expDate = new Date(t.expireAt).toLocaleString();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="${isExpired ? 'text-decoration: line-through; color: #ef4444;' : ''}">${t.name}</td>
            <td><span class="subject-badge">${t.subject}</span></td>
            <td><strong style="color:var(--accent-color); font-family:monospace;">${t.token}</strong></td>
            <td style="${isExpired ? 'color: #ef4444;' : ''}">${expDate} ${isExpired ? '(Eskirgan)' : ''}</td>
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

function renderQuestionsList() {
    adminQuestionsList.innerHTML = '';
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
                <div class="q-answer-check">To'g'ri: ${q.type === 'open' ? q.openAnswer : q.options[q.correct]} (${q.points} ball)</div>
            </div>
            <button class="danger-btn" onclick="deleteQuestion(${realIndex})">O'chirish</button>
        `;
        adminQuestionsList.appendChild(div);
    });
}

if (addQBtn) addQBtn.addEventListener('click', () => {
    const text = newQText.value.trim();
    const pts = parseFloat(newQPoints.value);
    const typeElement = document.getElementById('new-q-type');
    const qType = typeElement ? typeElement.value : "closed";
    let subj = newQSubject.value;

    if (currentTeacherSession) subj = currentTeacherSession.subject;

    if (!text || isNaN(pts)) {
        showToast("Barcha maydonlarni to'ldiring!");
        return;
    }

    let questionObj = {
        subject: subj,
        question: text,
        points: pts,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        type: qType
    };

    if (qType === 'open') {
        const openAns = document.getElementById('new-q-open-answer').value.trim();
        if (!openAns) {
            showToast("Javobni kiriting!");
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
            showToast("Barcha javoblarni to'ldiring!");
            return;
        }
        questionObj.options = [opt0, opt1, opt2, opt3];
        questionObj.correct = corr;
    }

    const targetClassEl = document.getElementById('new-q-target-class');
    const cognitiveEl = document.getElementById('new-q-cognitive');
    if (targetClassEl) questionObj.targetClass = targetClassEl.value;
    if (cognitiveEl) questionObj.cognitive = cognitiveEl.value;

    questions.push(questionObj);
    saveQuestions();
    renderQuestionsList();
    newQText.value = '';
    newQOpt0.value = '';
    newQOpt1.value = '';
    newQOpt2.value = '';
    newQOpt3.value = '';
    const openAnsEl = document.getElementById('new-q-open-answer');
    if (openAnsEl) openAnsEl.value = '';
    showToast("Savol qo'shildi!");
});

window.deleteQuestion = (index) => {
    if (confirm("Rostdan ham o'chirmoqchimisiz?")) {
        questions.splice(index, 1);
        saveQuestions();
        renderQuestionsList();
        showToast("Savol o'chirildi");
    }
};

function populateClassFilters() {
    filterClass.innerHTML = '<option value="all">Barchasi</option>';
    const allResults = getResultsArray('all');
    const classes = new Set(allResults.map(r => r.class));
    classes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        filterClass.appendChild(opt);
    });
}

function renderResultsTable() {
    resultsTableBody.innerHTML = '';
    const filterCls = filterClass.value;
    const filterQ = filterQuarter ? filterQuarter.value : 'all';

    let filteredResults = getResultsArray(filterQ);
    if (filterCls !== 'all') filteredResults = filteredResults.filter(r => r.class === filterCls);
    if (currentTeacherSession) filteredResults = filteredResults.filter(r => r.subject === currentTeacherSession.subject);

    filteredResults.sort((a, b) => b.percentage - a.percentage);
    populateStudentSelect(filteredResults);

    if (filteredResults.length === 0) {
        resultsTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">${t('noResults') || "Hozircha natijalar mavjud emas."}</td></tr>`;
        renderAnalyticsChart(filteredResults);
        return;
    }

    filteredResults.forEach((r, idx) => {
        const tr = document.createElement('tr');
        const dateStr = r.date ? new Date(r.date).toLocaleString() : '-';
        tr.innerHTML = `
            <td>${r.name}</td>
            <td>${r.class}</td>
            <td>${r.subject}</td>
            <td>${r.quarter || '-'}</td>
            <td>${(r.score ?? 0).toFixed ? r.score.toFixed(1) : r.score} / ${r.maxScore ?? '-'}</td>
            <td>${r.percentage}%</td>
            <td>
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                    <span>${dateStr}</span>
                    <button class="batafsil-btn" data-idx="${idx}" style="background: var(--accent-color); border: none; padding: 4px 8px; border-radius: 4px; color: white; cursor: pointer; font-size: 12px;">Batafsil</button>
                </div>
            </td>
        `;
        resultsTableBody.appendChild(tr);
    });

    document.querySelectorAll('.batafsil-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            showStudentDetails(filteredResults[idx]);
        });
    });

    renderAnalyticsChart(filteredResults);
}

const closeDetailsBtn = document.getElementById('close-details-btn');
if (closeDetailsBtn) {
    if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', () => {
        const overlay = document.getElementById('student-details-overlay');
        if (overlay) overlay.classList.add('hidden');
    });
}

function showStudentDetails(result) {
    const overlay = document.getElementById('student-details-overlay');
    const title = document.getElementById('student-details-title');
    const content = document.getElementById('student-details-content');
    if (!overlay || !title || !content) return;

    title.textContent = `${result.name} (${result.class}) - ${result.subject}`;
    content.innerHTML = '';

    if (!result.studentAnswers || !result.earnedPoints) {
        content.innerHTML = '<p>Bu natijada batafsil ma\'lumotlar saqlanmagan.</p>';
        overlay.classList.remove('hidden');
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
    result.studentAnswers.forEach((ans, i) => {
        const earned = result.earnedPoints[i] || 0;
        const isCorrect = earned > 0;
        const color = isCorrect ? '#10b981' : '#ef4444';
        const status = isCorrect ? "To'g'ri" : "Xato";
        let ansText = (ans === null || ans === undefined) ? (t('notAnswered') || "Belgilanmagan") : String(ans);
        if (result.questions && result.questions[i] && result.questions[i].type !== 'open' && typeof ans === 'number') {
            const qtr = result.quarter || '1';
            const qList = (questionsDatabase[qtr] || []).filter(q => q.subject === result.subject);
            if (qList[i]?.options?.[ans]) ansText = qList[i].options[ans];
        }

        html += `
        <div style="padding: 10px; background: rgba(0,0,0,0.2); border-left: 4px solid ${color}; border-radius: 4px;">
            <div style="font-weight:bold; margin-bottom: 5px;">Savol ${i + 1} <span style="float:right; color: ${color};">${status} (${earned} ball)</span></div>
            <div style="font-size: 0.9em; color: var(--text-secondary);">O'quvchi javobi: <span style="color: white;">${ansText}</span></div>
        </div>`;
    });
    html += '</div>';

    content.innerHTML = html;
    overlay.classList.remove('hidden');
}

if (filterClass) filterClass.addEventListener('change', renderResultsTable);
if (filterQuarter) filterQuarter.addEventListener('change', renderResultsTable);

if (startBtn) startBtn.addEventListener('click', () => {
    studentName = studentNameInput.value.trim();
    studentClass = studentClassInput.value;
    studentSubject = studentSubjectInput.value;
    const pin = quizPinInput.value.trim();

    if (!studentName || !studentClass || !studentSubject || !pin) {
        alert("Barcha ma'lumotlarni to'ldiring!");
        return;
    }

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
        alert("Noto'g'ri kod!");
        return;
    }

    const targetClass = subjectClassesDatabase[studentSubject] ? subjectClassesDatabase[studentSubject][matchedQuarter] : "all";
    if (targetClass !== "all" && targetClass !== studentClass) {
        alert("Sizning sinfingiz uchun test hozircha mavjud emas!");
        return;
    }

    studentQuarter = matchedQuarter;
    currentQuizQuestions = questionsDatabase[studentQuarter].filter(q => {
        if (q.subject !== studentSubject) return false;
        if (!q.targetClass || q.targetClass === 'all') return true;
        return q.targetClass === studentClass;
    });

    if (currentQuizQuestions.length === 0) {
        alert("Test topilmadi!");
        return;
    }

    testTimeLimitSeconds = (subjectDurationsDatabase[studentSubject][studentQuarter] || 20) * 60;
    currentQuizQuestions.sort(() => Math.random() - 0.5);

    currentQuestionIndex = 0;
    studentAnswers = new Array(currentQuizQuestions.length).fill(null);
    earnedPoints = new Array(currentQuizQuestions.length).fill(0);
    isLocked = false;
    blockCount = 0;
    timeElapsedSeconds = 0;

    populateInstructionScreen();
    authScreen.classList.add('hidden');
    instructionScreen.classList.remove('hidden');
    currentScreen = 'instruction';
});

if (beginTestBtn) {
    if (beginTestBtn) beginTestBtn.addEventListener('click', () => {
        instructionScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');
        currentScreen = 'quiz';
        isTestActive = true;
        document.addEventListener('visibilitychange', handleCheating);
        window.addEventListener('blur', handleCheating);
        document.addEventListener('fullscreenchange', handleCheating);
        document.addEventListener('webkitfullscreenchange', handleCheating);
        document.addEventListener('mozfullscreenchange', handleCheating);
        document.addEventListener('MSFullscreenChange', handleCheating);
        const docElm = document.documentElement;
        if (docElm.requestFullscreen) docElm.requestFullscreen().catch(e => e);
        else if (docElm.webkitRequestFullscreen) docElm.webkitRequestFullscreen();
        else if (docElm.mozRequestFullScreen) docElm.mozRequestFullScreen();
        else if (docElm.msRequestFullscreen) docElm.msRequestFullscreen();
        startTimer();
        loadQuestion();
    });
}

function startTimer() {
    timerInterval = setInterval(() => {
        if (isLocked) return;
        timeElapsedSeconds++;
        const remaining = testTimeLimitSeconds - timeElapsedSeconds;
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        timerDisplay.textContent = `${m}:${s < 10 ? '0' + s : s}`;
        if (remaining <= 0) finishQuiz();
    }, 1000);
}

function loadQuestion() {
    if (currentQuestionIndex >= currentQuizQuestions.length) {
        finishQuiz();
        return;
    }
    const q = currentQuizQuestions[currentQuestionIndex];
    questionText.textContent = q.question;
    optionsContainer.innerHTML = '';
    nextBtn.classList.add('hidden');

    if (currentQuestionNum) currentQuestionNum.textContent = currentQuestionIndex + 1;
    if (totalQuestionsSpan) totalQuestionsSpan.textContent = currentQuizQuestions.length;
    if (questionPointsDisplay) questionPointsDisplay.textContent = q.points || 1;
    if (progressBar) progressBar.style.width = `${(currentQuestionIndex / currentQuizQuestions.length) * 100}%`;
    if (studentDisplay) studentDisplay.textContent = `${studentName} | ${studentClass} | ${studentSubject}`;

    if (q.type === 'open') {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'option';
        input.value = studentAnswers[currentQuestionIndex] || '';
        input.placeholder = t('phOpenAnswer') || "Javobingizni kiriting...";
        input.oninput = (e) => {
            studentAnswers[currentQuestionIndex] = e.target.value;
            nextBtn.classList.remove('hidden');
        };
        optionsContainer.appendChild(input);
        if (studentAnswers[currentQuestionIndex]) nextBtn.classList.remove('hidden');
    } else {
        q.options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'option' + (studentAnswers[currentQuestionIndex] === index ? ' selected' : '');
            btn.textContent = opt;
            btn.onclick = () => {
                studentAnswers[currentQuestionIndex] = index;
                optionsContainer.querySelectorAll('.option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                nextBtn.classList.remove('hidden');
            };
            optionsContainer.appendChild(btn);
        });
        if (studentAnswers[currentQuestionIndex] !== null) nextBtn.classList.remove('hidden');
    }
}

if (nextBtn) nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuizQuestions.length) loadQuestion();
    else finishQuiz();
});

function finishQuiz() {
    isTestActive = false;
    document.removeEventListener('visibilitychange', handleCheating);
    window.removeEventListener('blur', handleCheating);
    document.removeEventListener('fullscreenchange', handleCheating);
    document.removeEventListener('webkitfullscreenchange', handleCheating);
    document.removeEventListener('mozfullscreenchange', handleCheating);
    document.removeEventListener('MSFullscreenChange', handleCheating);
    clearInterval(timerInterval);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    currentScreen = 'result';

    let score = 0;
    currentQuizQuestions.forEach((q, index) => {
        const p = parseFloat(q.points) || 1;
        const ans = studentAnswers[index];
        if (q.type === 'open') {
            const correctAns = q.openAnswer || q.correct || '';
            if (normalizeAnswer(ans) === normalizeAnswer(correctAns)) {
                score += p;
                earnedPoints[index] = p;
            }
        } else {
            const correctIdx = parseInt(q.correct, 10);
            if (ans === correctIdx) {
                score += p;
                earnedPoints[index] = p;
            }
        }
    });
    totalUserPoints = score;
    const maxPoints = currentQuizQuestions.reduce((sum, q) => sum + (parseFloat(q.points) || 1), 0);
    const percentage = Math.round((totalUserPoints / maxPoints) * 100) || 0;

    const newResult = {
        name: studentName,
        class: studentClass,
        subject: studentSubject,
        quarter: studentQuarter,
        score: totalUserPoints,
        maxScore: maxPoints,
        percentage: percentage,
        date: new Date().toISOString(),
        timeSpent: timeElapsedSeconds,
        blocks: blockCount,
        studentAnswers: [...studentAnswers],
        earnedPoints: [...earnedPoints],
        questions: currentQuizQuestions.map(q => ({ question: q.question, type: q.type }))
    };

    if (!resultsDatabase[studentQuarter]) resultsDatabase[studentQuarter] = [];
    resultsDatabase[studentQuarter].push(newResult);
    saveResults();
    populateClassFilters();
    renderLeaderboard();

    populateResultScreen(percentage, maxPoints);
    sendTelegramMessage(
        `SHSB natija\n${studentName} (${studentClass})\nFan: ${studentSubject}\nChorak: ${studentQuarter}\nBall: ${totalUserPoints.toFixed(1)} / ${maxPoints}\nFoiz: ${percentage}%`
    );

    if (showAnswersToStudent) {
        errorReviewList.innerHTML = '';
        currentQuizQuestions.forEach((q, index) => {
            const div = document.createElement('div');
            const earned = earnedPoints[index] || 0;
            div.style.marginBottom = '15px';
            div.style.padding = '10px';
            div.style.background = 'rgba(0,0,0,0.2)';
            div.style.borderLeft = earned > 0 ? '4px solid #10b981' : '4px solid #ef4444';
            const correctText = q.type === 'open' ? (q.openAnswer || q.correct) : q.options[q.correct];
            const studentText = q.type === 'open'
                ? (studentAnswers[index] || t('notAnswered'))
                : (studentAnswers[index] !== null ? q.options[studentAnswers[index]] : t('notAnswered'));
            div.innerHTML = `
                <div style="font-weight:bold; margin-bottom:5px;">Savol ${index + 1}: ${q.question}</div>
                <div style="color: #ef4444; font-size: 0.9em; margin-bottom: 3px;">${t('yourAnswer') || "Sizning javobingiz:"} ${studentText}</div>
                <div style="color: #10b981; font-size: 0.9em;">${t('lblCorrectAnswer') || "To'g'ri javob:"} ${correctText}</div>
                <div style="color: #f59e0b; font-size: 0.8em; margin-top:5px;">Ball: ${earned} / ${q.points || 1}</div>
            `;
            errorReviewList.appendChild(div);
        });
        errorReviewList.style.display = 'block';
    } else {
        errorReviewList.style.display = 'none';
        errorReviewList.innerHTML = '';
    }
}

function triggerLock() {
    blockCount++;
    isLocked = true;
    clearInterval(timerInterval);
    lockScreen.classList.remove('hidden');
    // playSound('wrong'); // Ovoz olib tashlandi
    unlockError.classList.add('hidden');
    const teacherUnlockInput = document.getElementById('teacherUnlockInput');
    if (teacherUnlockInput) {
        teacherUnlockInput.value = "";
        teacherUnlockInput.focus();
    }
}

if (unlockBtn) unlockBtn.addEventListener('click', () => {
    const teacherUnlockInput = document.getElementById('teacherUnlockInput');
    const pass = teacherUnlockInput ? teacherUnlockInput.value.trim() : "";
    let requiredPin = "admin123";
    if (studentSubject && studentQuarter && subjectUnblockPinsDatabase[studentSubject] && subjectUnblockPinsDatabase[studentSubject][studentQuarter]) {
        requiredPin = subjectUnblockPinsDatabase[studentSubject][studentQuarter];
    }
    if (pass === requiredPin || btoa(pass) === HASHED_ADMIN_PASS) {
        isLocked = false;
        lockScreen.classList.add('hidden');
        const docElm = document.documentElement;
        if (docElm.requestFullscreen) docElm.requestFullscreen().catch(e => e);
        else if (docElm.webkitRequestFullscreen) docElm.webkitRequestFullscreen();
        else if (docElm.mozRequestFullScreen) docElm.mozRequestFullScreen();
        else if (docElm.msRequestFullscreen) docElm.msRequestFullscreen();
        startTimer();
    } else {
        unlockError.classList.remove('hidden');
    }
});

if (downloadCertBtn) {
    if (downloadCertBtn) downloadCertBtn.addEventListener('click', () => {
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
}

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

if (downloadQrBtn) downloadQrBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'QR_Kod_SHSB.png';
    link.href = qrCanvas.toDataURL('image/png');
    link.click();
});

function normalizeAnswer(str) {
    return String(str || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function getOpenAnswer(q) {
    return q.openAnswer || q.correct || '';
}

function getAnalysisNote(percentage) {
    if (percentage >= 90) return t('analysisEx');
    if (percentage >= 70) return t('analysisGood');
    if (percentage >= 50) return t('analysisSat');
    return t('analysisBad');
}

function populateInstructionScreen() {
    const testType = subjectTestTypesDatabase[studentSubject]?.[studentQuarter] || 'BSB';
    if (instTitle) instTitle.textContent = `${studentSubject} - ${testType}`;
    const mins = subjectDurationsDatabase[studentSubject]?.[studentQuarter] || 20;
    if (instTime) instTime.textContent = `${t('lblTime') || 'Vaqt:'} ${mins} ${t('min') || 'daq'}`;
    if (instCount) instCount.textContent = `${t('lblCount') || 'Savollar soni:'} ${currentQuizQuestions.length} ta`;
    if (timerDisplay) {
        const m = Math.floor(testTimeLimitSeconds / 60);
        const s = testTimeLimitSeconds % 60;
        timerDisplay.textContent = `${m}:${s < 10 ? '0' + s : s}`;
    }
}

function populateResultScreen(percentage, maxPoints) {
    if (!resultContent) return;
    const mins = Math.floor(timeElapsedSeconds / 60);
    const secs = timeElapsedSeconds % 60;
    resultContent.innerHTML = `
        <div class="stat-item"><span>${t('studentLabel') || 'Talaba:'}</span><strong>${studentName}</strong></div>
        <div class="stat-item"><span>${t('thClass') || 'Sinf:'}</span><strong>${studentClass}</strong></div>
        <div class="stat-item"><span>${t('thSubject') || 'Fan:'}</span><strong>${studentSubject}</strong></div>
        <div class="stat-item"><span>${t('thScore') || 'Ball:'}</span><strong>${totalUserPoints.toFixed(1)} / ${maxPoints}</strong></div>
        <div class="stat-item"><span>${t('percentageLabel') || 'Foiz:'}</span><strong>${percentage}%</strong></div>
        <div class="stat-item"><span>${t('timeSpent') || 'Vaqt:'}</span><strong>${mins}:${secs < 10 ? '0' + secs : secs}</strong></div>
        <div class="stat-item"><span>${t('violations') || 'Bloklar:'}</span><strong>${blockCount} ${t('times') || 'marta'}</strong></div>
        <div class="analysis-note">${getAnalysisNote(percentage)}</div>
    `;
    if (certificateZone) {
        if (percentage >= 80) certificateZone.classList.remove('hidden');
        else certificateZone.classList.add('hidden');
    }
}

function renderLeaderboard() {
    if (!leaderboardBody) return;
    const all = getResultsArray('all');
    all.sort((a, b) => b.percentage - a.percentage);
    const top10 = all.slice(0, 10);
    if (top10.length === 0) {
        leaderboardBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">${t('emptyLeaderboard') || "Reyting jadvali bo'sh."}</td></tr>`;
        return;
    }
    leaderboardBody.innerHTML = '';
    top10.forEach((r, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i + 1}</td><td>${r.name}</td><td>${r.percentage}%</td>`;
        leaderboardBody.appendChild(tr);
    });
}

window.toggleQuestionFormat = function toggleQuestionFormat() {
    const type = document.getElementById('new-q-type')?.value || 'closed';
    const closed = document.getElementById('closed-format-inputs');
    const open = document.getElementById('open-format-inputs');
    const correctGroup = document.getElementById('correct-selection-group');
    if (closed) closed.style.display = type === 'closed' ? 'block' : 'none';
    if (open) open.style.display = type === 'open' ? 'block' : 'none';
    if (correctGroup) correctGroup.style.display = type === 'closed' ? 'flex' : 'none';
};

function populateStudentSelect(results) {
    const studentSelect = document.getElementById('studentSelect');
    if (!studentSelect) return;
    const current = studentSelect.value;
    studentSelect.innerHTML = `<option value="" disabled selected>${t('selStudent') || "O'quvchini tanlang..."}</option>`;
    const seen = new Set();
    results.forEach((r, idx) => {
        const key = `${r.name}|${r.class}|${r.subject}|${r.date}`;
        if (seen.has(key)) return;
        seen.add(key);
        const opt = document.createElement('option');
        opt.value = String(idx);
        opt.textContent = `${r.name} (${r.class}) - ${r.subject}`;
        studentSelect.appendChild(opt);
    });
    if (current) studentSelect.value = current;
}

function renderAnalyticsChart(results) {
    const canvas = document.getElementById('analytics-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    const levels = ['Bilish', "Qo'llash", 'Mulohaza qilish'];
    const totals = { 'Bilish': 0, "Qo'llash": 0, 'Mulohaza qilish': 0 };
    const counts = { 'Bilish': 0, "Qo'llash": 0, 'Mulohaza qilish': 0 };

    results.forEach(r => {
        if (!r.earnedPoints) return;
        const qtr = r.quarter || '1';
        const subjectQs = (questionsDatabase[qtr] || []).filter(q => q.subject === r.subject);
        r.earnedPoints.forEach((earned, i) => {
            const q = subjectQs[i];
            const level = q?.cognitive || 'Bilish';
            if (!totals[level]) totals[level] = 0;
            totals[level] += earned;
            counts[level] = (counts[level] || 0) + 1;
        });
    });

    const data = levels.map(l => counts[l] ? Math.round((totals[l] / counts[l]) * 100) / 100 : 0);
    if (analyticsChartInstance) analyticsChartInstance.destroy();
    analyticsChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: levels,
            datasets: [{
                label: "O'rtacha ball",
                data: data,
                backgroundColor: ['#38bdf8', '#10b981', '#f59e0b']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#fff' } } },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.1)' }, beginAtZero: true }
            }
        }
    });
}

function compareQuarters() {
    if (!compQ1 || !compQ2 || !comparisonResult) return;
    const q1 = compQ1.value;
    const q2 = compQ2.value;
    const r1 = getResultsArray(q1);
    const r2 = getResultsArray(q2);
    const avg = arr => arr.length ? arr.reduce((s, r) => s + r.percentage, 0) / arr.length : 0;
    const a1 = avg(r1);
    const a2 = avg(r2);
    const diff = a2 - a1;
    let trend = t('compSame') || "O'zgarishsiz";
    if (diff > 0) trend = `${t('compIncreased') || "O'sdi"} ${diff.toFixed(1)}%`;
    else if (diff < 0) trend = `${t('compDecreased') || "Pasaydi"} ${Math.abs(diff).toFixed(1)}%`;

    let conclusion = t('compConclusionNeutral');
    if (diff > 3) conclusion = t('compConclusionGood');
    else if (diff < -3) conclusion = t('compConclusionBad');

    comparisonResult.classList.remove('hidden');
    comparisonResult.innerHTML = `
        <p><strong>${q1}-chorak:</strong> ${a1.toFixed(1)}% (${r1.length} ta natija)</p>
        <p><strong>${q2}-chorak:</strong> ${a2.toFixed(1)}% (${r2.length} ta natija)</p>
        <p><strong>${trend}</strong></p>
        <p style="margin-top:10px;">${t('compConclusion') || 'Xulosa:'} ${conclusion}</p>
    `;
}

async function sendTelegramMessage(text) {
    if (!tgBotToken || !tgChatId) return;
    try {
        await fetch(`https://api.telegram.org/bot${tgBotToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: tgChatId, text })
        });
    } catch (e) {
        console.log('Telegram error:', e);
    }
}

function parseWordQuestions(text, subject) {
    const blocks = text.split(/\n(?=\d+[\.\)]\s)/).filter(b => b.trim());
    const parsed = [];
    blocks.forEach(block => {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        if (!lines.length) return;
        const questionLine = lines[0].replace(/^\d+[\.\)]\s*/, '');
        const options = [];
        let correct = 0;
        let points = 1;
        let type = 'closed';
        let openAnswer = '';

        lines.slice(1).forEach(line => {
            const optMatch = line.match(/^([A-Da-d])[\)\.\:]\s*(.+)/);
            if (optMatch) {
                options.push(optMatch[2].trim());
                return;
            }
            const ansMatch = line.match(/^Javob\s*:\s*([A-Da-d]|.+)$/i);
            if (ansMatch) {
                const val = ansMatch[1].trim();
                if (/^[A-Da-d]$/.test(val)) correct = val.toUpperCase().charCodeAt(0) - 65;
                else { type = 'open'; openAnswer = val; }
                return;
            }
            const ptsMatch = line.match(/^Ball\s*:\s*([\d.]+)/i);
            if (ptsMatch) points = parseFloat(ptsMatch[1]) || 1;
        });

        if (!questionLine) return;
        const obj = {
            subject,
            question: questionLine,
            points,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            type,
            targetClass: 'all',
            cognitive: 'Bilish'
        };
        if (type === 'open') obj.openAnswer = openAnswer;
        else if (options.length >= 2) { obj.options = options.slice(0, 4); obj.correct = correct; }
        else return;
        parsed.push(obj);
    });
    return parsed;
}

async function handleWordUpload() {
    const file = wordFileInput?.files?.[0];
    if (!file) {
        showToast(t('alertSelectFile') || "Word faylini tanlang!");
        return;
    }
    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const subject = wordQSubject?.value || SUBJECTS[0];
        const parsed = parseWordQuestions(result.value, subject);
        if (!parsed.length) {
            showToast(t('alertImportEmpty') || "Mos formatdagi savollar topilmadi!");
            return;
        }
        parsed.forEach(q => questions.push(q));
        saveQuestions();
        renderQuestionsList();
        wordFileInput.value = '';
        showToast(`${t('alertImportSuccess') || 'Yuklandi:'} ${parsed.length} ${t('alertImportSuccess2') || 'ta savol'}`);
    } catch (e) {
        console.error(e);
        showToast(t('alertReadError') || "Faylni o'qishda xatolik!");
    }
}

function exportResultsToExcel() {
    const filterCls = filterClass?.value || 'all';
    const filterQ = filterQuarter?.value || 'all';
    let data = getResultsArray(filterQ);
    if (filterCls !== 'all') data = data.filter(r => r.class === filterCls);
    if (currentTeacherSession) data = data.filter(r => r.subject === currentTeacherSession.subject);
    if (!data.length) {
        showToast(t('alertNoExport') || "Eksport uchun natijalar yo'q!");
        return;
    }
    if (typeof XLSX === 'undefined') {
        showToast("Excel kutubxonasi yuklanmagan!");
        return;
    }

    let numQuestions = 0;
    data.forEach(r => {
        if (r.earnedPoints && r.earnedPoints.length > numQuestions) numQuestions = r.earnedPoints.length;
    });

    const aoa = [];
    const yearStr = new Date().getFullYear();
    const sherekStr = filterQ === 'all' ? yearStr + '-sherek' : filterQ + '-sherek';
    const classStr = filterCls === 'all' ? 'Barcha sinflar' : filterCls;

    aoa.push([`Qaraqalpaqstan Respublikası Xojeyli rayonı qánigelestirilgen mektebiniń ${classStr} klass, ${yearStr}-sherek`]);
    aoa.push(["BARCHA FANLAR páninen ótkerilgen BSB/CHSB NÁTIYJELERI"]);
    aoa.push([]);
    aoa.push([`BSB/CHSB ótkerilgen sáne: ${new Date().toLocaleDateString('en-GB')} | Sorawlar sanı: ${numQuestions} | Max ball: ${data[0].maxScore || 0} | Oqıwshılar sanı: ${data.length}`]);

    const headers = ["№", "Oqıwshınıń familiyası, atı"];

    const firstR = data[0];
    const qtr = firstR.quarter || '1';
    const subjectQs = (questionsDatabase[qtr] || []).filter(q => q.subject === firstR.subject);

    for (let i = 0; i < numQuestions; i++) {
        let cat = 'Biliw';
        if (subjectQs[i] && subjectQs[i].cognitive) {
            let c = subjectQs[i].cognitive.toLowerCase();
            if (c.includes('qollaw') || c.includes('qollash') || c.includes("qo'llash")) cat = 'Qollaw';
            else if (c.includes('pikirlew') || c.includes('mulohaza')) cat = 'Pikirlew';
        }
        headers.push(`${i + 1}-soraw (${cat})`);
    }
    headers.push("Biliw %", "Qollaw %", "Pikirlew %", "JÁMI (Ball)", "JÁMI %");
    aoa.push(headers);

    data.forEach((r, idx) => {
        const row = [idx + 1, r.name];

        let biliwTotal = 0, qollawTotal = 0, pikirlewTotal = 0;
        let biliwMax = 0, qollawMax = 0, pikirlewMax = 0;

        const currentQs = (questionsDatabase[r.quarter || '1'] || []).filter(q => q.subject === r.subject);

        for (let i = 0; i < numQuestions; i++) {
            const earned = (r.earnedPoints && r.earnedPoints[i] !== undefined) ? r.earnedPoints[i] : 0;
            const q = currentQs[i];
            const max = q ? (q.points || 1) : 1;

            let cat = 'Biliw';
            if (q && q.cognitive) {
                let c = q.cognitive.toLowerCase();
                if (c.includes('qollaw') || c.includes('qollash') || c.includes("qo'llash")) cat = 'Qollaw';
                else if (c.includes('pikirlew') || c.includes('mulohaza')) cat = 'Pikirlew';
            }

            if (cat === 'Biliw') { biliwTotal += earned; biliwMax += max; }
            else if (cat === 'Qollaw') { qollawTotal += earned; qollawMax += max; }
            else { pikirlewTotal += earned; pikirlewMax += max; }

            if (r.earnedPoints && r.earnedPoints[i] !== undefined) {
                row.push(earned > 0 ? "+" : "-");
            } else {
                row.push("");
            }
        }

        row.push(biliwMax > 0 ? (biliwTotal / biliwMax * 100).toFixed(1) + '%' : '-');
        row.push(qollawMax > 0 ? (qollawTotal / qollawMax * 100).toFixed(1) + '%' : '-');
        row.push(pikirlewMax > 0 ? (pikirlewTotal / pikirlewMax * 100).toFixed(1) + '%' : '-');
        row.push(r.score || 0);
        row.push((r.percentage || 0) + '%');

        aoa.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const totalCols = headers.length;

    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: totalCols - 1 } }
    ];

    try {
        const titleStyle = { font: { bold: true, sz: 12 }, alignment: { horizontal: "center" } };
        const subtitleStyle = { font: { bold: true, sz: 14, color: { rgb: "0000FF" } }, alignment: { horizontal: "center" } };
        const infoStyle = { font: { bold: true, sz: 11 }, alignment: { horizontal: "center" } };
        const headerStyle = { font: { bold: true, sz: 11 }, alignment: { horizontal: "center", vertical: "center" } };

        if (ws['A1']) ws['A1'].s = titleStyle;
        if (ws['A2']) ws['A2'].s = subtitleStyle;
        if (ws['A4']) ws['A4'].s = infoStyle;

        for (let c = 0; c < totalCols; c++) {
            const cellRef = XLSX.utils.encode_cell({ r: 4, c: c });
            if (ws[cellRef]) ws[cellRef].s = headerStyle;
        }
    } catch (e) {
        console.warn("Styling issue", e);
    }

    const wscols = [{ wch: 5 }, { wch: 30 }];
    for (let i = 0; i < numQuestions; i++) wscols.push({ wch: 15 });
    wscols.push({ wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 10 });
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Natijalar');
    XLSX.writeFile(wb, `SHSB_Natijalar_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function clearAllResults() {
    if (!confirm(t('confirmClearResults') || t('alertConfirmClear') || "Natijalarni tozalashni tasdiqlaysizmi?")) return;
    QUARTERS.forEach(q => { resultsDatabase[q] = []; });
    saveResults();
    populateClassFilters();
    renderResultsTable();
    renderLeaderboard();
    showToast(t('msgResultsCleared') || "Natijalar tozalandi!");
}

async function runGeminiAnalysis() {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        showToast(t('alertGeminiKey') || "Gemini API kaliti sozlanmagan!");
        return;
    }
    if (!geminiOverlay) return;
    geminiOverlay.classList.remove('hidden');
    if (geminiLoading) geminiLoading.style.display = 'flex';
    if (geminiAnalysisOutput) {
        geminiAnalysisOutput.style.display = 'none';
        geminiAnalysisOutput.innerHTML = '';
    }

    const filterCls = filterClass?.value || 'all';
    const filterQ = filterQuarter?.value || 'all';
    let data = getResultsArray(filterQ);
    if (filterCls !== 'all') data = data.filter(r => r.class === filterCls);
    if (currentTeacherSession) data = data.filter(r => r.subject === currentTeacherSession.subject);

    const summary = data.slice(0, 50).map(r =>
        `${r.name} (${r.class}), ${r.subject}, ${r.percentage}%`
    ).join('\n');

    const prompt = `Siz pedagogik tahlilchisiz. Quyidagi maktab test natijalarini o'zbek tilida qisqa tahlil qiling:\n${summary || "Natijalar yo'q"}`;

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const json = await res.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "Tahlil natijasi olinmadi.";
        if (geminiLoading) geminiLoading.style.display = 'none';
        if (geminiAnalysisOutput) {
            geminiAnalysisOutput.style.display = 'block';
            geminiAnalysisOutput.innerHTML = parseMarkdownToHtml(text);
        }
    } catch (e) {
        if (geminiLoading) geminiLoading.style.display = 'none';
        if (geminiAnalysisOutput) {
            geminiAnalysisOutput.style.display = 'block';
            geminiAnalysisOutput.textContent = "Gemini API xatosi: " + e.message;
        }
    }
}

if (wordUploadBtn) wordUploadBtn.addEventListener('click', handleWordUpload);
if (exportExcelBtn) exportExcelBtn.addEventListener('click', exportResultsToExcel);
if (clearResultsBtn) clearResultsBtn.addEventListener('click', clearAllResults);
if (geminiAnalyzeBtn) geminiAnalyzeBtn.addEventListener('click', runGeminiAnalysis);
if (closeGeminiBtn) closeGeminiBtn.addEventListener('click', () => {
    if (geminiOverlay) geminiOverlay.classList.add('hidden');
});
if (analyzeBtn) analyzeBtn.addEventListener('click', compareQuarters);

const viewDetailsBtn = document.getElementById('view-details-btn');
if (viewDetailsBtn) {
    if (viewDetailsBtn) viewDetailsBtn.addEventListener('click', () => {
        const studentSelect = document.getElementById('studentSelect');
        const filterCls = filterClass?.value || 'all';
        const filterQ = filterQuarter?.value || 'all';
        let data = getResultsArray(filterQ);
        if (filterCls !== 'all') data = data.filter(r => r.class === filterCls);
        if (currentTeacherSession) data = data.filter(r => r.subject === currentTeacherSession.subject);
        data.sort((a, b) => b.percentage - a.percentage);
        const idx = parseInt(studentSelect?.value, 10);
        if (isNaN(idx) || !data[idx]) {
            showToast(t('selStudent') || "O'quvchini tanlang!");
            return;
        }
        showStudentDetails(data[idx]);
    });
}

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






function handleCheating(e) {
    if (isTestActive && !isLocked) {
        if (document.hidden || (e && e.type === 'blur')) {
            triggerLock();
        } else if (e && e.type.includes('fullscreenchange')) {
            const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            if (!isFullscreen) {
                triggerLock();
            }
        }
    }
}

window.addEventListener('beforeunload', function (e) {
    if (isTestActive && !isLocked) {
        e.preventDefault();
        e.returnValue = "Siz testni tark etmoqchimisiz? Natijangiz saqlanmaydi yoki bloklanadi!";
        return e.returnValue;
    }
});

// Sinf bo'yicha o'rtacha o'zlashtirishni hisoblash
(function() {
    const filterClassEl = document.getElementById('filter-class');
    const filterSection = filterClassEl ? filterClassEl.parentElement : null;
    if (!filterSection) return;

    const avgContainer = document.createElement('div');
    avgContainer.id = 'average-percentage-display';
    avgContainer.style.cssText = 'margin-top: 15px; padding: 10px; background: rgba(56, 189, 248, 0.1); border: 1px solid #38bdf8; border-radius: 8px; color: #38bdf8; font-weight: bold; text-align: center; display: none;';
    
    // Insert after the filter section
    filterSection.parentNode.insertBefore(avgContainer, filterSection.nextSibling);

    function calculateAndDisplayAverage() {
        const filterCls = filterClassEl ? filterClassEl.value : 'all';
        const rows = document.querySelectorAll('#results-table-body tr');
        
        let totalPercent = 0;
        let count = 0;

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 5) {
                const percentText = cells[5].textContent;
                if (percentText && percentText.includes('%')) {
                    totalPercent += parseFloat(percentText);
                    count++;
                }
            }
        });

        if (count > 0 && filterCls !== 'all') {
            const avg = (totalPercent / count).toFixed(1);
            avgContainer.style.display = 'block';
            avgContainer.textContent = `Tanlangan sinf bo'yicha o'rtacha o'zlashtirish: ${avg}% (${count} nafar o'quvchi)`;
        } else {
            avgContainer.style.display = 'none';
        }
    }

    const observer = new MutationObserver(calculateAndDisplayAverage);
    const tbody = document.getElementById('results-table-body');
    if (tbody) {
        observer.observe(tbody, { childList: true, subtree: true });
    }
    
    if (filterClassEl) {
        filterClassEl.addEventListener('change', () => setTimeout(calculateAndDisplayAverage, 100));
    }
})();
