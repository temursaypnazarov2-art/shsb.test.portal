/**
 * shsb.test.portal - Script Logic
 * Author: Antigravity AI
 */

// 1. SAVOLLAR SHABLONI (TEMPLATE)
// O'zingizning savollaringizni shu yerga qo'shing
const questions = [
    {
        question: "O'zbekiston Respublikasining poytaxti qaysi shahar?",
        options: ["Samarqand", "Toshkent", "Buxoro", "Xiva"],
        correct: 1 // Indeks 0 dan boshlanadi (1 = Toshkent)
    },
    {
        question: "Shablon savol 2: Bu yerga savol matnini yozing?",
        options: ["Variant A", "Variant B", "Variant C", "Variant D"],
        correct: 0
    },
    // Yangi savollarni shu tartibda qo'shishda davom eting...
];

// App State
let currentQuestionIndex = 0;
let score = 0;
let studentName = "";
let isLocked = false;
let startTime;
let timerInterval;
const ADMIN_PASSWORD = "admin123_shsb";

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const lockScreen = document.getElementById('lock-screen');
const studentNameInput = document.getElementById('student-name');
const startBtn = document.getElementById('start-btn');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const currentQuestionNum = document.getElementById('current-question-num');
const totalQuestionsSpan = document.getElementById('total-questions');
const timerDisplay = document.getElementById('timer');
const studentDisplay = document.getElementById('student-display');
const resultContent = document.getElementById('result-content');
const adminPassInput = document.getElementById('admin-pass');
const unlockBtn = document.getElementById('unlock-btn');
const unlockError = document.getElementById('unlock-error');

// --- Initialization ---
totalQuestionsSpan.textContent = questions.length;

// --- Event Listeners ---

// Start Test
startBtn.addEventListener('click', () => {
    const name = studentNameInput.value.trim();
    if (name.length < 3) {
        alert("Iltimos, to'liq ismingizni kiriting!");
        return;
    }
    studentName = name;
    startQuiz();
});

// Admin Unlock
unlockBtn.addEventListener('click', () => {
    if (adminPassInput.value === ADMIN_PASSWORD) {
        unlockApp();
    } else {
        unlockError.classList.remove('hidden');
        adminPassInput.value = "";
    }
});

// Next Question
nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        finishQuiz();
    }
});

// --- Core Functions ---

function startQuiz() {
    authScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    studentDisplay.textContent = studentName;
    
    // Enable Fullscreen
    requestFullscreen();
    
    startTime = Date.now();
    startTimer();
    loadQuestion();
    
    // Start Proctoring
    setupProctoring();
}

function loadQuestion() {
    const q = questions[currentQuestionIndex];
    questionText.textContent = q.question;
    optionsContainer.innerHTML = '';
    nextBtn.classList.add('hidden');
    
    // Update progress
    const progress = ((currentQuestionIndex) / questions.length) * 100;
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
    // Prevent re-selection
    const options = optionsContainer.querySelectorAll('.option');
    options.forEach(opt => opt.classList.remove('selected'));
    
    element.classList.add('selected');
    
    // Store if correct
    if (index === questions[currentQuestionIndex].correct) {
        // We calculate score at the end or track here
    }
    
    // In this version, we'll just store the user response logic
    // and highlight the next button
    nextBtn.classList.remove('hidden');
    
    // Temporary score tracking
    element.dataset.correct = (index === questions[currentQuestionIndex].correct);
}

// We wrap the next logic to handle scoring
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
    let analysis = "";
    
    if (percentage >= 90) analysis = "A'lo daraja! Siz mavzuni mukammal o'zlashtirgansiz.";
    else if (percentage >= 70) analysis = "Yaxshi natija. Bilimingizni yanada mustahkamlashingiz mumkin.";
    else if (percentage >= 50) analysis = "Qoniqarli. Takrorlash ko'proq talab etiladi.";
    else analysis = "Past natija. Iltimos, darslikni qaytadan o'qib chiqing.";

    resultContent.innerHTML = `
        <div class="stat-item"><span>Talaba:</span> <strong>${studentName}</strong></div>
        <div class="stat-item"><span>To'g'ri javoblar:</span> <strong>${score} / ${questions.length}</strong></div>
        <div class="stat-item"><span>Foiz ko'rsatkichi:</span> <strong>${percentage}%</strong></div>
        <div class="stat-item"><span>Sarflangan vaqt:</span> <strong>${timerDisplay.textContent}</strong></div>
        <div class="analysis-note">
            <strong>Tahlil:</strong> ${analysis}
        </div>
    `;
}

// --- Proctoring Logic ---

function setupProctoring() {
    // Detect tab switch or window minimize
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && !isLocked) {
            lockApp();
        }
    });

    // Detect focus loss
    window.addEventListener('blur', () => {
        if (!isLocked) lockApp();
    });

    // Detect exiting fullscreen
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && !isLocked) {
            lockApp();
        }
    });
}

function lockApp() {
    isLocked = true;
    lockScreen.classList.remove('hidden');
    adminPassInput.value = "";
    unlockError.classList.add('hidden');
    // Pause timer if needed
    clearInterval(timerInterval);
}

function unlockApp() {
    isLocked = false;
    lockScreen.classList.add('hidden');
    requestFullscreen(); // Force back to fullscreen
    startTimer(); // Resume timer
}

// --- Utility Functions ---

function requestFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => {
            console.log("Fullscreen error: ", err);
        });
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
    }
}
