/**
 * shsb.test.portal - Script Logic with Admin Panel & LocalStorage
 * Author: Antigravity AI
 */

// --- Constants & Database ---
const ADMIN_PASSWORD = "admin123_shsb";

const defaultQuestions = [
    {
        question: "O'zbekiston Respublikasining poytaxti qaysi shahar?",
        options: ["Samarqand", "Toshkent", "Buxoro", "Xiva"],
        correct: 1
    },
    {
        question: "Kompyuterning asosiy xotira turi qaysi?",
        options: ["RAM", "HDD", "Processor", "Monitor"],
        correct: 0
    }
];

// Load from LocalStorage
let questions = JSON.parse(localStorage.getItem('quiz_questions')) || defaultQuestions;
let results = JSON.parse(localStorage.getItem('quiz_results')) || [];

// Save Helper
function saveQuestions() {
    localStorage.setItem('quiz_questions', JSON.stringify(questions));
}
function saveResults() {
    localStorage.setItem('quiz_results', JSON.stringify(results));
}

// App State
let currentQuestionIndex = 0;
let score = 0;
let studentName = "";
let isLocked = false;
let blockCount = 0;
let startTime;
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

// Admin Form Inputs
const newQText = document.getElementById('new-q-text');
const newQOpt0 = document.getElementById('new-q-opt0');
const newQOpt1 = document.getElementById('new-q-opt1');
const newQOpt2 = document.getElementById('new-q-opt2');
const newQOpt3 = document.getElementById('new-q-opt3');
const newQCorrect = document.getElementById('new-q-correct');
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
    renderQuestionsList();
    renderResultsTable();
}


// --- Event Listeners ---

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

    if (!text || !o0 || !o1 || !o2 || !o3) {
        alert("Iltimos, barcha maydonlarni to'ldiring!");
        return;
    }

    const newQuestion = {
        question: text,
        options: [o0, o1, o2, o3],
        correct: correctVal
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
                <div class="q-text">${index + 1}. ${q.question}</div>
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
        resultsTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-secondary);">Hozircha natijalar mavjud emas.</td></tr>`;
        return;
    }

    results.forEach(res => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${res.name}</strong></td>
            <td>${res.percentage}% (${res.score}/${res.total})</td>
            <td>${res.time}</td>
            <td style="color: ${res.blocks > 0 ? 'var(--error-color)' : 'var(--success-color)'}">${res.blocks} marta</td>
        `;
        resultsTableBody.appendChild(tr);
    });
}


// --- Quiz Engine Logic ---

function startQuiz() {
    authScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    studentDisplay.textContent = studentName;
    totalQuestionsSpan.textContent = questions.length;
    currentQuestionIndex = 0;
    score = 0;
    
    // Launch Fullscreen
    requestFullscreen();
    
    startTime = Date.now();
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
        score++;
    }
    
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        finishQuiz();
    }
};

function startTimer() {
    // Clear in case timer is already running
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const secs = (elapsed % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${mins}:${secs}`;
    }, 1000);
}

function finishQuiz() {
    clearInterval(timerInterval);
    exitFullscreen();
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    
    const percentage = Math.round((score / questions.length) * 100);
    const timeSpent = timerDisplay.textContent;
    let analysis = "";
    
    if (percentage >= 90) analysis = "A'lo daraja! Siz mavzuni mukammal o'zlashtirgansiz.";
    else if (percentage >= 70) analysis = "Yaxshi natija. Bilimingizni yanada mustahkamlashingiz mumkin.";
    else if (percentage >= 50) analysis = "Qoniqarli. Takrorlash ko'proq talab etiladi.";
    else analysis = "Past natija. Iltimos, darslikni qaytadan o'qib chiqing.";

    resultContent.innerHTML = `
        <div class="stat-item"><span>Talaba:</span> <strong>${studentName}</strong></div>
        <div class="stat-item"><span>To'g'ri javoblar:</span> <strong>${score} / ${questions.length}</strong></div>
        <div class="stat-item"><span>Foiz ko'rsatkichi:</span> <strong>${percentage}%</strong></div>
        <div class="stat-item"><span>Sarflangan vaqt:</span> <strong>${timeSpent}</strong></div>
        <div class="stat-item"><span>Qoidabuzarliklar (Bloklar):</span> <strong style="color: ${blockCount > 0 ? 'var(--error-color)' : 'var(--success-color)'}">${blockCount} marta</strong></div>
        <div class="analysis-note">
            <strong>Tahlil:</strong> ${analysis}
        </div>
    `;

    // Save student result to LocalStorage DB
    const studentResult = {
        name: studentName,
        score: score,
        total: questions.length,
        percentage: percentage,
        time: timeSpent,
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
    
    // Adjust start time to ignore block duration
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
