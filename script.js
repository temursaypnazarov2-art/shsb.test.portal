/**
 * shsb.test.portal - Script Logic with Timer, Question weights & CSV Export
 * Author: Antigravity AI
 */

// --- Constants & Database ---
const ADMIN_PASSWORD = "admin123_shsb";

const defaultQuestions = [
    {
        question: "O'zbekiston Respublikasining poytaxti qaysi shahar?",
        options: ["Samarqand", "Toshkent", "Buxoro", "Xiva"],
        correct: 1,
        points: 2.0
    },
    {
        question: "Kompyuterning asosiy tezkor xotira turi qaysi?",
        options: ["RAM", "HDD", "Processor", "Monitor"],
        correct: 0,
        points: 3.0
    }
];

// Load from LocalStorage
let questions = JSON.parse(localStorage.getItem('quiz_questions')) || defaultQuestions;
let results = JSON.parse(localStorage.getItem('quiz_results')) || [];
let quizDuration = parseInt(localStorage.getItem('quiz_duration')) || 20; // Default 20 mins

// Save Helpers
function saveQuestions() {
    localStorage.setItem('quiz_questions', JSON.stringify(questions));
}
function saveResults() {
    localStorage.setItem('quiz_results', JSON.stringify(results));
}
function saveDuration() {
    localStorage.setItem('quiz_duration', quizDuration.toString());
}

// App State
let currentQuestionIndex = 0;
let totalUserPoints = 0; // Sum of points for correct answers
let studentName = "";
let isLocked = false;
let blockCount = 0;
let testTimeLimitSeconds = 0;
let timeElapsedSeconds = 0;
let timerInterval;

// --- DOM Elements ---
// Screens
const authScreen = document.getElementById('auth-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const adminPanel = document.getElementById('admin-panel');
const adminAuthModal = document.getElementById('admin-auth-modal');
const lockScreen = document.getElementById('lock-screen');

// Auth Screen Elements
const studentNameInput = document.getElementById('student-name');
const startBtn = document.getElementById('start-btn');
const adminLoginBtn = document.getElementById('admin-login-btn');

// Admin Auth Modal Elements
const adminPortalPassInput = document.getElementById('admin-portal-pass');
const adminAuthSubmit = document.getElementById('admin-auth-submit');
const adminAuthCancel = document.getElementById('admin-auth-cancel');
const adminAuthError = document.getElementById('admin-auth-error');

// Admin Panel Elements
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const tabQuestionsBtn = document.getElementById('tab-questions-btn');
const tabResultsBtn = document.getElementById('tab-results-btn');
const tabQuestions = document.getElementById('tab-questions');
const tabResults = document.getElementById('tab-results');
const addQBtn = document.getElementById('add-q-btn');
const clearResultsBtn = document.getElementById('clear-results-btn');
const exportExcelBtn = document.getElementById('export-excel-btn');
const testDurationInput = document.getElementById('test-duration-input');
const saveSettingsBtn = document.getElementById('save-settings-btn');

// Admin Form Inputs
const newQText = document.getElementById('new-q-text');
const newQOpt0 = document.getElementById('new-q-opt0');
const newQOpt1 = document.getElementById('new-q-opt1');
const newQOpt2 = document.getElementById('new-q-opt2');
const newQOpt3 = document.getElementById('new-q-opt3');
const newQCorrect = document.getElementById('new-q-correct');
const newQPoints = document.getElementById('new-q-points');
const adminQuestionsCount = document.getElementById('admin-questions-count');
const adminQuestionsList = document.getElementById('admin-questions-list');
const resultsTableBody = document.getElementById('results-table-body');

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

// Lock Screen Elements
const adminPassInput = document.getElementById('admin-pass');
const unlockBtn = document.getElementById('unlock-btn');
const unlockError = document.getElementById('unlock-error');


// --- Initial Setup ---
function init() {
    totalQuestionsSpan.textContent = questions.length;
    testDurationInput.value = quizDuration;
    renderQuestionsList();
    renderResultsTable();
}


// --- Event Listeners ---

// Save Timer Settings
saveSettingsBtn.addEventListener('click', () => {
    const val = parseInt(testDurationInput.value);
    if (isNaN(val) || val < 1) {
        alert("Iltimos, to'g'ri vaqt miqdorini kiriting (kamida 1 daqiqa)!");
        return;
    }
    quizDuration = val;
    saveDuration();
    alert("Test sozlamalari saqlandi!");
});

// Student Start Quiz
startBtn.addEventListener('click', () => {
    const name = studentNameInput.value.trim();
    if (name.length < 3) {
        alert("Iltimos, testni boshlash uchun to'liq ismingizni kiriting!");
        return;
    }
    if (questions.length === 0) {
        alert("Ayni paytda test tizimida hech qanday savol mavjud emas! Iltimos, admin bilan bog'laning.");
        return;
    }
    studentName = name;
    blockCount = 0;
    startQuiz();
});

// Admin Panel Access Modal Trigger
adminLoginBtn.addEventListener('click', () => {
    adminAuthModal.classList.remove('hidden');
    adminPortalPassInput.value = "";
    adminAuthError.classList.add('hidden');
    adminPortalPassInput.focus();
});

// Admin Auth Cancel
adminAuthCancel.addEventListener('click', () => {
    adminAuthModal.classList.add('hidden');
});

// Admin Auth Submit
adminAuthSubmit.addEventListener('click', handleAdminAuth);
adminPortalPassInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAdminAuth();
});

function handleAdminAuth() {
    if (adminPortalPassInput.value === ADMIN_PASSWORD) {
        adminAuthModal.classList.add('hidden');
        authScreen.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        testDurationInput.value = quizDuration;
        renderQuestionsList();
        renderResultsTable();
    } else {
        adminAuthError.classList.remove('hidden');
        adminPortalPassInput.value = "";
    }
}

// Admin Logout
adminLogoutBtn.addEventListener('click', () => {
    adminPanel.classList.add('hidden');
    authScreen.classList.remove('hidden');
});

// Admin Tab Switching
tabQuestionsBtn.addEventListener('click', () => {
    tabQuestionsBtn.classList.add('active');
    tabResultsBtn.classList.remove('active');
    tabQuestions.classList.remove('hidden');
    tabResults.classList.add('hidden');
});

tabResultsBtn.addEventListener('click', () => {
    tabQuestionsBtn.classList.remove('active');
    tabResultsBtn.classList.add('active');
    tabQuestions.classList.add('hidden');
    tabResults.classList.remove('hidden');
});

// Add New Question
addQBtn.addEventListener('click', () => {
    const text = newQText.value.trim();
    const o0 = newQOpt0.value.trim();
    const o1 = newQOpt1.value.trim();
    const o2 = newQOpt2.value.trim();
    const o3 = newQOpt3.value.trim();
    const correctVal = parseInt(newQCorrect.value);
    const pts = parseFloat(newQPoints.value);

    if (!text || !o0 || !o1 || !o2 || !o3 || isNaN(pts) || pts <= 0) {
        alert("Iltimos, barcha maydonlarni to'g'ri to'ldiring!");
        return;
    }

    const newQuestion = {
        question: text,
        options: [o0, o1, o2, o3],
        correct: correctVal,
        points: pts
    };

    questions.push(newQuestion);
    saveQuestions();
    renderQuestionsList();

    // Reset Inputs
    newQText.value = "";
    newQOpt0.value = "";
    newQOpt1.value = "";
    newQOpt2.value = "";
    newQOpt3.value = "";
    newQPoints.value = "1.0";
    alert("Yangi savol muvaffaqiyatli saqlandi!");
});

// Clear Results
clearResultsBtn.addEventListener('click', () => {
    if (confirm("Haqiqatan ham barcha natijalarni butunlay o'chirib tashlamoqchimisiz?")) {
        results = [];
        saveResults();
        renderResultsTable();
    }
});

// Export Results to Excel (CSV)
exportExcelBtn.addEventListener('click', exportResultsToCSV);

// Admin Unlock Screen Trigger
unlockBtn.addEventListener('click', handleProctorUnlock);
adminPassInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleProctorUnlock();
});

function handleProctorUnlock() {
    if (adminPassInput.value === ADMIN_PASSWORD) {
        unlockApp();
    } else {
        unlockError.classList.remove('hidden');
        adminPassInput.value = "";
    }
}


// --- Admin Panel Renderers ---

function renderQuestionsList() {
    adminQuestionsList.innerHTML = "";
    adminQuestionsCount.textContent = questions.length;

    questions.forEach((q, index) => {
        const div = document.createElement('div');
        div.className = 'q-item';
        div.innerHTML = `
            <div class="q-info">
                <div class="q-text">${index + 1}. ${q.question} <span style="color: var(--accent-color);">(${q.points || 1} ball)</span></div>
                <div class="q-answer-check">To'g'ri javob: ${q.options[q.correct]}</div>
            </div>
            <button class="danger-btn" onclick="deleteQuestion(${index})">O'chirish</button>
        `;
        adminQuestionsList.appendChild(div);
    });
}

// Global scope delete function for click event handler in dynamic HTML
window.deleteQuestion = function(index) {
    if (confirm("Ushbu savolni o'chirib tashlamoqchimisiz?")) {
        questions.splice(index, 1);
        saveQuestions();
        renderQuestionsList();
    }
};

function renderResultsTable() {
    resultsTableBody.innerHTML = "";
    if (results.length === 0) {
        resultsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">Hozircha natijalar mavjud emas.</td></tr>`;
        return;
    }

    results.forEach(res => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${res.name}</strong></td>
            <td><strong>${res.score} / ${res.totalPossible}</strong></td>
            <td>${res.percentage}%</td>
            <td>${res.time}</td>
            <td style="color: ${res.blocks > 0 ? 'var(--error-color)' : 'var(--success-color)'}">${res.blocks} marta</td>
        `;
        resultsTableBody.appendChild(tr);
    });
}

// Excel Export Logic (using CSV with UTF-8 BOM)
function exportResultsToCSV() {
    if (results.length === 0) {
        alert("Eksport qilish uchun natijalar mavjud emas!");
        return;
    }

    // CSV header including UTF-8 BOM
    let csvContent = "\uFEFF";
    csvContent += "F.I.SH.,To'plangan ball,Maksimal ball,Foiz,Sarflangan vaqt,Bloklar soni\n";

    results.forEach(res => {
        // Clean values just in case they have commas
        const cleanedName = res.name.replace(/,/g, ' ');
        csvContent += `"${cleanedName}",${res.score},${res.totalPossible},${res.percentage}%,${res.time},${res.blocks}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    // Formatting filename with date
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `shsb_test_natijalari_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// --- Quiz Engine Logic ---

function startQuiz() {
    authScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    studentDisplay.textContent = studentName;
    totalQuestionsSpan.textContent = questions.length;
    currentQuestionIndex = 0;
    totalUserPoints = 0;
    
    // Launch Fullscreen
    requestFullscreen();
    
    // Countdown Timer calculation setup
    testTimeLimitSeconds = quizDuration * 60;
    timeElapsedSeconds = 0;
    
    startTimer();
    loadQuestion();
    
    // Setup Proctoring
    setupProctoring();
}

function loadQuestion() {
    const q = questions[currentQuestionIndex];
    questionText.textContent = q.question;
    optionsContainer.innerHTML = '';
    nextBtn.classList.add('hidden');
    
    // Update progress
    const progress = (currentQuestionIndex / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
    currentQuestionNum.textContent = currentQuestionIndex + 1;
    questionPointsDisplay.textContent = q.points || 1;

    q.options.forEach((opt, index) => {
        const div = document.createElement('div');
        div.className = 'option fade-in';
        div.textContent = opt;
        div.addEventListener('click', () => selectOption(index, div));
        optionsContainer.appendChild(div);
    });
}

function selectOption(index, element) {
    const options = optionsContainer.querySelectorAll('.option');
    options.forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    nextBtn.classList.remove('hidden');
    element.dataset.correct = (index === questions[currentQuestionIndex].correct);
}

// Next button handler
nextBtn.onclick = () => {
    const selected = optionsContainer.querySelector('.option.selected');
    if (selected && selected.dataset.correct === "true") {
        const currentPoints = parseFloat(questions[currentQuestionIndex].points) || 1.0;
        totalUserPoints += currentPoints;
    }
    
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        finishQuiz();
    }
};

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeElapsedSeconds++;
        const remainingSeconds = testTimeLimitSeconds - timeElapsedSeconds;

        if (remainingSeconds <= 0) {
            timerDisplay.textContent = "00:00";
            alert("Vaqt tugadi! Test avtomatik yakunlanadi.");
            // Handle last unanswered/selected question score addition
            const selected = optionsContainer.querySelector('.option.selected');
            if (selected && selected.dataset.correct === "true") {
                const currentPoints = parseFloat(questions[currentQuestionIndex].points) || 1.0;
                totalUserPoints += currentPoints;
            }
            finishQuiz();
            return;
        }

        const mins = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
        const secs = (remainingSeconds % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${mins}:${secs}`;
    }, 1000);
}

function formatTimeElapsed() {
    const mins = Math.floor(timeElapsedSeconds / 60).toString().padStart(2, '0');
    const secs = (timeElapsedSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

function finishQuiz() {
    clearInterval(timerInterval);
    exitFullscreen();
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    
    // Calculate total possible points in this test instance
    let maxPossiblePoints = 0;
    questions.forEach(q => {
        maxPossiblePoints += parseFloat(q.points) || 1.0;
    });

    const percentage = maxPossiblePoints > 0 ? Math.round((totalUserPoints / maxPossiblePoints) * 100) : 0;
    const timeSpentString = formatTimeElapsed();
    let analysis = "";
    
    if (percentage >= 90) analysis = "A'lo daraja! Siz mavzuni mukammal o'zlashtirgansiz.";
    else if (percentage >= 70) analysis = "Yaxshi natija. Bilimingizni yanada mustahkamlashingiz mumkin.";
    else if (percentage >= 50) analysis = "Qoniqarli. Takrorlash ko'proq talab etiladi.";
    else analysis = "Past natija. Iltimos, darslikni qaytadan o'qib chiqing.";

    resultContent.innerHTML = `
        <div class="stat-item"><span>Talaba:</span> <strong>${studentName}</strong></div>
        <div class="stat-item"><span>To'plangan ball:</span> <strong>${totalUserPoints.toFixed(1)} / ${maxPossiblePoints.toFixed(1)} ball</strong></div>
        <div class="stat-item"><span>Foiz ko'rsatkichi:</span> <strong>${percentage}%</strong></div>
        <div class="stat-item"><span>Sarflangan vaqt:</span> <strong>${timeSpentString} (Jami limit: ${quizDuration} daq)</strong></div>
        <div class="stat-item"><span>Qoidabuzarliklar (Bloklar):</span> <strong style="color: ${blockCount > 0 ? 'var(--error-color)' : 'var(--success-color)'}">${blockCount} marta</strong></div>
        <div class="analysis-note">
            <strong>Tahlil:</strong> ${analysis}
        </div>
    `;

    // Save student result to LocalStorage DB
    const studentResult = {
        name: studentName,
        score: totalUserPoints.toFixed(1),
        totalPossible: maxPossiblePoints.toFixed(1),
        percentage: percentage,
        time: timeSpentString,
        blocks: blockCount
    };

    results.push(studentResult);
    saveResults();
    
    // Clear event listeners for proctoring
    clearProctoring();
}


// --- Proctoring & Lock System ---

function onProctorViolation() {
    if (!isLocked && !quizScreen.classList.contains('hidden')) {
        lockApp();
    }
}

const visibilityHandler = () => {
    if (document.hidden) onProctorViolation();
};

const blurHandler = () => {
    onProctorViolation();
};

const fullscreenHandler = () => {
    if (!document.fullscreenElement) onProctorViolation();
};

function setupProctoring() {
    document.addEventListener('visibilitychange', visibilityHandler);
    window.addEventListener('blur', blurHandler);
    document.addEventListener('fullscreenchange', fullscreenHandler);
}

function clearProctoring() {
    document.removeEventListener('visibilitychange', visibilityHandler);
    window.removeEventListener('blur', blurHandler);
    document.removeEventListener('fullscreenchange', fullscreenHandler);
}

function lockApp() {
    isLocked = true;
    blockCount++;
    lockScreen.classList.remove('hidden');
    adminPassInput.value = "";
    unlockError.classList.add('hidden');
    clearInterval(timerInterval);
    adminPassInput.focus();
}

function unlockApp() {
    isLocked = false;
    lockScreen.classList.add('hidden');
    requestFullscreen();
    
    // Resume countdown timer
    startTimer();
}


// --- Utility Functions ---

function requestFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => {
            console.log("Fullscreen request denied: ", err);
        });
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
    }
}

// Launch app
init();
