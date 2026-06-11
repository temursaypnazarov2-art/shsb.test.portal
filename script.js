/**
 * shsb.test.portal - Script Logic with Docx, Telegram, Filters, Leaderboard, Canvas Cert & Audio
 * Author: Antigravity AI
 */

// --- Constants & Database ---
const HASHED_ADMIN_PASS = "YWRtaW4xMjNfc2hzYg==";

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
let tgBotToken = localStorage.getItem('tg_bot_token') || "";
let tgChatId = localStorage.getItem('tg_chat_id') || "";

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
}

// App State
let currentQuestionIndex = 0;
let totalUserPoints = 0;
let studentName = "";
let studentClass = "";
let studentAnswers = []; // Tracks indexes of user choices
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
const adminAuthModal = document.getElementById('admin-auth-modal');
const lockScreen = document.getElementById('lock-screen');
const toastAlert = document.getElementById('toast');

// Auth Screen Elements
const studentNameInput = document.getElementById('student-name');
const studentClassInput = document.getElementById('student-class');
const startBtn = document.getElementById('start-btn');
const adminLoginBtn = document.getElementById('admin-login-btn');
const leaderboardBody = document.getElementById('leaderboard-body');

// Admin Auth Modal Elements
const adminPortalPassInput = document.getElementById('admin-portal-pass');
const adminAuthSubmit = document.getElementById('admin-auth-submit');
const adminAuthCancel = document.getElementById('admin-auth-cancel');
const adminAuthError = document.getElementById('admin-auth-error');

// Admin Panel Elements
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const tabQuestionsBtn = document.getElementById('tab-questions-btn');
const tabResultsBtn = document.getElementById('tab-results-btn');
const tabSettingsBtn = document.getElementById('tab-settings-btn');
const tabQrcodeBtn = document.getElementById('tab-qrcode-btn');
const tabQuestions = document.getElementById('tab-questions');
const tabResults = document.getElementById('tab-results');
const tabSettings = document.getElementById('tab-settings');
const tabQrcode = document.getElementById('tab-qrcode');
const addQBtn = document.getElementById('add-q-btn');
const clearResultsBtn = document.getElementById('clear-results-btn');
const exportExcelBtn = document.getElementById('export-excel-btn');
const testDurationInput = document.getElementById('test-duration-input');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const filterClass = document.getElementById('filter-class');

// Telegram Settings Inputs
const tgBotTokenInput = document.getElementById('tg-bot-token');
const tgChatIdInput = document.getElementById('tg-chat-id');

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


// --- Initial Setup ---
function init() {
    totalQuestionsSpan.textContent = questions.length;
    testDurationInput.value = quizDuration;
    tgBotTokenInput.value = tgBotToken;
    tgChatIdInput.value = tgChatId;
    
    renderQuestionsList();
    renderResultsTable();
    populateClassFilters();
    renderLeaderboard();
    setupAntiCheat();
}


// --- Anti-Cheat (Anti-Inspect & Key Blockers) ---
function setupAntiCheat() {
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        triggerToast();
    });

    document.addEventListener('keydown', (e) => {
        if (
            e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
            (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
        ) {
            e.preventDefault();
            triggerToast();
        }
    });
}

function triggerToast() {
    toastAlert.classList.remove('hidden');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastAlert.classList.add('hidden');
    }, 3000);
}


// --- Web Audio API Synthesizer ---
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    try {
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'correct') {
            // High double-beep
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            osc.frequency.setValueAtTime(1000, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.25);
        } else if (type === 'incorrect') {
            // Low buzz
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 0.35);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.35);
        } else if (type === 'warning') {
            // Fast alarm double-beep
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
        }
    } catch (e) {
        console.warn("Audio Context error: ", e);
    }
}


// --- Event Listeners ---

// Save Settings
saveSettingsBtn.addEventListener('click', () => {
    const durationVal = parseInt(testDurationInput.value);
    if (isNaN(durationVal) || durationVal < 1) {
        alert(t('alertDuration'));
        return;
    }
    saveSettings(durationVal, tgBotTokenInput.value.trim(), tgChatIdInput.value.trim());
    alert(t('alertSaved'));
});

// Student Start Quiz
startBtn.addEventListener('click', () => {
    const name = studentNameInput.value.trim();
    const classGroup = studentClassInput.value.trim();
    if (name.length < 3 || classGroup.length < 1) {
        alert(t('alertDetails'));
        return;
    }
    if (questions.length === 0) {
        alert(t('alertNoQuestions'));
        return;
    }
    studentName = name;
    studentClass = classGroup;
    blockCount = 0;
    studentAnswers = [];
    startQuiz();
});

// Admin Panel Modal Actions
adminLoginBtn.addEventListener('click', () => {
    adminAuthModal.classList.remove('hidden');
    adminPortalPassInput.value = "";
    adminAuthError.classList.add('hidden');
    adminPortalPassInput.focus();
});

adminAuthCancel.addEventListener('click', () => {
    adminAuthModal.classList.add('hidden');
});

adminAuthSubmit.addEventListener('click', handleAdminAuth);
adminPortalPassInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAdminAuth();
});

function handleAdminAuth() {
    const correctPassword = atob(HASHED_ADMIN_PASS);
    if (adminPortalPassInput.value === correctPassword) {
        adminAuthModal.classList.add('hidden');
        authScreen.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        testDurationInput.value = quizDuration;
        tgBotTokenInput.value = tgBotToken;
        tgChatIdInput.value = tgChatId;
        renderQuestionsList();
        renderResultsTable();
        populateClassFilters();
    } else {
        adminAuthError.classList.remove('hidden');
        adminPortalPassInput.value = "";
    }
}

adminLogoutBtn.addEventListener('click', () => {
    adminPanel.classList.add('hidden');
    authScreen.classList.remove('hidden');
    renderLeaderboard();
});

// Admin Tab Switching
tabQuestionsBtn.addEventListener('click', () => {
    setTabActive(tabQuestionsBtn, tabQuestions);
});
tabResultsBtn.addEventListener('click', () => {
    setTabActive(tabResultsBtn, tabResults);
    renderResultsTable();
});
tabSettingsBtn.addEventListener('click', () => {
    setTabActive(tabSettingsBtn, tabSettings);
});
tabQrcodeBtn.addEventListener('click', () => {
    setTabActive(tabQrcodeBtn, tabQrcode);
    generateQR();
});

function setTabActive(activeBtn, activeTab) {
    [tabQuestionsBtn, tabResultsBtn, tabSettingsBtn, tabQrcodeBtn].forEach(b => b.classList.remove('active'));
    [tabQuestions, tabResults, tabSettings, tabQrcode].forEach(t => t.classList.add('hidden'));
    
    activeBtn.classList.add('active');
    activeTab.classList.remove('hidden');
}

// Add Question Manually
addQBtn.addEventListener('click', () => {
    const text = newQText.value.trim();
    const o0 = newQOpt0.value.trim();
    const o1 = newQOpt1.value.trim();
    const o2 = newQOpt2.value.trim();
    const o3 = newQOpt3.value.trim();
    const correctVal = parseInt(newQCorrect.value);
    const pts = parseFloat(newQPoints.value);

    if (!text || !o0 || !o1 || !o2 || !o3 || isNaN(pts) || pts <= 0) {
        alert(t('alertFields'));
        return;
    }

    questions.push({
        question: text,
        options: [o0, o1, o2, o3],
        correct: correctVal,
        points: pts
    });
    saveQuestions();
    renderQuestionsList();

    // Reset Form
    newQText.value = "";
    newQOpt0.value = "";
    newQOpt1.value = "";
    newQOpt2.value = "";
    newQOpt3.value = "";
    newQPoints.value = "1.0";
    alert(t('alertAdded'));
});

// Parse questions from Word .docx file
wordUploadBtn.addEventListener('click', () => {
    const file = wordFileInput.files[0];
    if (!file) {
        alert(t('alertSelectFile'));
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const arrayBuffer = event.target.result;
        
        // Mammoth.js reader
        mammoth.extractRawText({ arrayBuffer: arrayBuffer })
            .then(function(result) {
                const text = result.value;
                parseQuestionsFromText(text);
            })
            .catch(function(err) {
                console.error(err);
                alert(t('alertReadError'));
            });
    };
    reader.readAsArrayBuffer(file);
});

// Filter Results
filterClass.addEventListener('change', () => {
    renderResultsTable(filterClass.value);
});

// Clear All Results
clearResultsBtn.addEventListener('click', () => {
    if (confirm(t('alertConfirmClear'))) {
        results = [];
        saveResults();
        renderResultsTable();
        populateClassFilters();
    }
});

// Export CSV
exportExcelBtn.addEventListener('click', exportResultsToCSV);

// Certificate Download
downloadCertBtn.addEventListener('click', downloadCertificatePNG);

// Admin Lock Screen Unlock Trigger
unlockBtn.addEventListener('click', handleProctorUnlock);
adminPassInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleProctorUnlock();
});

function handleProctorUnlock() {
    const correctPassword = atob(HASHED_ADMIN_PASS);
    if (adminPassInput.value === correctPassword) {
        unlockApp();
    } else {
        unlockError.classList.remove('hidden');
        adminPassInput.value = "";
    }
}

// --- QR Code Generator ---
let qrInstance = null;
function generateQR() {
    const currentUrl = window.location.href;
    if (!qrInstance) {
        qrInstance = new QRious({
            element: qrCanvas,
            value: currentUrl,
            size: 250,
            background: 'white',
            foreground: 'black'
        });
    } else {
        qrInstance.value = currentUrl;
    }
}

downloadQrBtn.addEventListener('click', () => {
    if (!qrInstance) return;
    const url = qrCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shsb_quiz_qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});


// --- Word .docx Parsing Engine ---
function parseQuestionsFromText(rawText) {
    // Normalise text spacing and split by lines
    const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let importedQuestions = [];
    let currentQ = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Match Question: (e.g. "1. O'zbekiston..." or "12) Matematika...")
        const questionMatch = line.match(/^(\d+)[\.\)]\s*(.*)/);
        if (questionMatch) {
            if (currentQ) {
                validateAndPushQuestion(currentQ, importedQuestions);
            }
            currentQ = {
                question: questionMatch[2],
                options: [],
                correct: -1,
                points: 1.0
            };
            continue;
        }

        if (!currentQ) continue;

        // Match Options: (A) B) C) D) or A. B. C. D.)
        const optionMatch = line.match(/^([A-D])[A-D]?[\.\)]\s*(.*)/i);
        if (optionMatch) {
            currentQ.options.push(optionMatch[2]);
            continue;
        }

        // Match Correct Option: "To'g'ri javob: B"
        const correctMatch = line.match(/To'g'ri javob:\s*([A-D])/i);
        if (correctMatch) {
            const letter = correctMatch[1].toUpperCase();
            currentQ.correct = letter.charCodeAt(0) - 65; // A->0, B->1...
            continue;
        }
    }

    // Push the last parsed question
    if (currentQ) {
        validateAndPushQuestion(currentQ, importedQuestions);
    }

    if (importedQuestions.length > 0) {
        questions = questions.concat(importedQuestions);
        saveQuestions();
        renderQuestionsList();
        wordFileInput.value = "";
        alert(`${t('alertImportSuccess')} ${importedQuestions.length} ${t('alertImportSuccess2')}`);
    } else {
        alert(t('alertImportEmpty'));
    }
}

function validateAndPushQuestion(q, list) {
    // A valid question must have text, exactly 4 choices, and a correct key parsed
    if (q.question && q.options.length === 4 && q.correct >= 0 && q.correct <= 3) {
        list.push(q);
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
                <div class="q-text">${index + 1}. ${q.question} <span style="color: var(--accent-color);">(${q.points || 1} ${t('quizInfoPoints')})</span></div>
                <div class="q-answer-check">${t('lblCorrect')} ${q.options[q.correct]}</div>
            </div>
            <button class="danger-btn" onclick="deleteQuestion(${index})">${t('btnDelete')}</button>
        `;
        adminQuestionsList.appendChild(div);
    });
}

window.deleteQuestion = function(index) {
    if (confirm(t('alertConfirmDelete'))) {
        questions.splice(index, 1);
        saveQuestions();
        renderQuestionsList();
    }
};

function populateClassFilters() {
    const uniqueClasses = [...new Set(results.map(r => r.classGroup))].filter(Boolean);
    filterClass.innerHTML = `<option value="all">${t('filterAll')}</option>`;
    uniqueClasses.forEach(cls => {
        const opt = document.createElement('option');
        opt.value = cls;
        opt.textContent = cls;
        filterClass.appendChild(opt);
    });
}

function renderResultsTable(filter = "all") {
    resultsTableBody.innerHTML = "";
    let list = results;
    if (filter !== "all") {
        list = results.filter(r => r.classGroup === filter);
    }

    if (list.length === 0) {
        resultsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">${t('noResults')}</td></tr>`;
        return;
    }

    list.forEach(res => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${res.name}</strong></td>
            <td>${res.classGroup || t('unknown')}</td>
            <td><strong>${res.score} / ${res.totalPossible}</strong></td>
            <td>${res.percentage}%</td>
            <td>${res.time}</td>
            <td style="color: ${res.blocks > 0 ? 'var(--error-color)' : 'var(--success-color)'}">${res.blocks} ${t('times')}</td>
        `;
        resultsTableBody.appendChild(tr);
    });
}

// CSV Export (with UTF-8 BOM)
function exportResultsToCSV() {
    if (results.length === 0) {
        alert(t('alertNoExport'));
        return;
    }

    let csvContent = "\uFEFF";
    csvContent += `"${t('thName')}","${t('thClass')}","${t('thScore')}","Maksimal ball","${t('thPercent')}","${t('timeSpent')}","${t('thBlocks')}"\n`;

    results.forEach(res => {
        const cleanName = res.name.replace(/,/g, ' ');
        const cleanClass = (res.classGroup || '').replace(/,/g, ' ');
        csvContent += `"${cleanName}","${cleanClass}",${res.score},${res.totalPossible},${res.percentage}%,${res.time},${res.blocks}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `shsb_test_natijalari_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// --- Leaderboard ---
function renderLeaderboard() {
    leaderboardBody.innerHTML = "";
    
    // Sort Results: Percentage DESC, Time spent ASC, Blocks ASC
    const sorted = [...results].sort((a, b) => {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        // Parse time to seconds: e.g. "05:20" -> 320
        const timeA = parseTimeToSeconds(a.time);
        const timeB = parseTimeToSeconds(b.time);
        if (timeA !== timeB) return timeA - timeB;
        return a.blocks - b.blocks;
    });

    const top10 = sorted.slice(0, 10);

    if (top10.length === 0) {
        leaderboardBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">${t('emptyLeaderboard')}</td></tr>`;
        return;
    }

    top10.forEach((res, index) => {
        let medal = index + 1;
        if (index === 0) medal = "🥇";
        else if (index === 1) medal = "🥈";
        else if (index === 2) medal = "🥉";

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${medal}</strong></td>
            <td><strong>${res.name}</strong></td>
            <td>${res.classGroup}</td>
            <td>${res.score} b</td>
            <td>${res.time}</td>
        `;
        leaderboardBody.appendChild(tr);
    });
}

function parseTimeToSeconds(timeStr) {
    const parts = timeStr.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}


// --- Quiz Engine Logic ---

function startQuiz() {
    authScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    studentDisplay.textContent = `${studentName} (${studentClass})`;
    totalQuestionsSpan.textContent = questions.length;
    currentQuestionIndex = 0;
    totalUserPoints = 0;
    studentAnswers = [];
    
    requestFullscreen();
    
    testTimeLimitSeconds = quizDuration * 60;
    timeElapsedSeconds = 0;
    
    startTimer();
    loadQuestion();
    setupProctoring();
}

function loadQuestion() {
    const q = questions[currentQuestionIndex];
    questionText.textContent = q.question;
    optionsContainer.innerHTML = '';
    nextBtn.classList.add('hidden');
    
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
    
    // Temporarily store selection index
    element.dataset.index = index;
}

nextBtn.onclick = () => {
    const selected = optionsContainer.querySelector('.option.selected');
    if (!selected) return;

    const selectedIndex = parseInt(selected.dataset.index);
    studentAnswers.push(selectedIndex);

    // Audio confirmation feedback
    if (selected.dataset.correct === "true") {
        const currentPoints = parseFloat(questions[currentQuestionIndex].points) || 1.0;
        totalUserPoints += currentPoints;
        playSound('correct');
    } else {
        playSound('incorrect');
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
            alert(t('alertTimeout'));
            
            // Check current selected question
            const selected = optionsContainer.querySelector('.option.selected');
            if (selected) {
                studentAnswers.push(parseInt(selected.dataset.index));
                if (selected.dataset.correct === "true") {
                    const currentPoints = parseFloat(questions[currentQuestionIndex].points) || 1.0;
                    totalUserPoints += currentPoints;
                }
            } else if (studentAnswers.length < questions.length) {
                // Fill remaining unanswered as -1
                while (studentAnswers.length < questions.length) {
                    studentAnswers.push(-1);
                }
            }
            finishQuiz();
            return;
        }

        // Play warning beeps during the final 30 seconds (every 5 seconds)
        if (remainingSeconds <= 30 && remainingSeconds % 5 === 0) {
            playSound('warning');
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
    
    let maxPossiblePoints = 0;
    questions.forEach(q => {
        maxPossiblePoints += parseFloat(q.points) || 1.0;
    });

    const percentage = maxPossiblePoints > 0 ? Math.round((totalUserPoints / maxPossiblePoints) * 100) : 0;
    const timeSpentString = formatTimeElapsed();
    let analysis = "";
    
    if (percentage >= 90) analysis = t('analysisEx');
    else if (percentage >= 70) analysis = t('analysisGood');
    else if (percentage >= 50) analysis = t('analysisSat');
    else analysis = t('analysisBad');

    resultContent.innerHTML = `
        <div class="stat-item"><span>${t('studentLabel')}</span> <strong>${studentName} (${studentClass})</strong></div>
        <div class="stat-item"><span>${t('thScore')}:</span> <strong>${totalUserPoints.toFixed(1)} / ${maxPossiblePoints.toFixed(1)} ${t('quizInfoPoints')}</strong></div>
        <div class="stat-item"><span>${t('percentageLabel')}</span> <strong>${percentage}%</strong></div>
        <div class="stat-item"><span>${t('timeSpent')}</span> <strong>${timeSpentString} (${t('totalLimit')} ${quizDuration} ${t('min')})</strong></div>
        <div class="stat-item"><span>${t('violations')}</span> <strong style="color: ${blockCount > 0 ? 'var(--error-color)' : 'var(--success-color)'}">${blockCount} ${t('times')}</strong></div>
        <div class="analysis-note">
            <strong>${t('analysisLabel')}</strong> ${analysis}
        </div>
    `;

    // Save student result to LocalStorage DB
    const studentResult = {
        name: studentName,
        classGroup: studentClass,
        score: totalUserPoints.toFixed(1),
        totalPossible: maxPossiblePoints.toFixed(1),
        percentage: percentage,
        time: timeSpentString,
        blocks: blockCount
    };

    results.push(studentResult);
    saveResults();
    
    // Error Review logic
    renderErrorReview();

    // Gamification (Certificate)
    if (percentage >= 85) {
        certificateZone.classList.remove('hidden');
        generateCertificateCanvas(percentage);
    } else {
        certificateZone.classList.add('hidden');
    }

    // Telegram Bot notify integration
    sendTelegramNotification(studentResult);

    clearProctoring();
}


// --- Pedagogic "Xatolar ustida ishlash" review ---
function renderErrorReview() {
    errorReviewList.innerHTML = "";
    let errorsCount = 0;

    questions.forEach((q, index) => {
        const userChoice = studentAnswers[index];
        if (userChoice !== q.correct) {
            errorsCount++;
            const item = document.createElement('div');
            item.className = 'review-item';
            
            const userAnsText = userChoice === -1 || userChoice === undefined ? t('notAnswered') : q.options[userChoice];
            const correctAnsText = q.options[q.correct];

            item.innerHTML = `
                <div class="review-q">${index + 1}. ${q.question}</div>
                <div class="review-user-ans">${t('yourAnswer')} ${userAnsText}</div>
                <div class="review-correct-ans">${t('lblCorrect')} ${correctAnsText}</div>
            `;
            errorReviewList.appendChild(item);
        }
    });

    if (errorsCount === 0) {
        errorReviewList.innerHTML = `<p style="color: var(--success-color); text-align: center; font-weight: 600;">${t('noMistakes')}</p>`;
    }
}


// --- Telegram Notification service ---
function sendTelegramNotification(res) {
    if (!tgBotToken || !tgChatId) return; // Telegram is not configured

    const text = `
📊 *${t('examResult')} (shsb.test.portal)*

👤 *${t('studentLabel')}* ${res.name}
🏫 *${t('thClass')}:* ${res.classGroup}
🎯 *${t('thScore')}:* ${res.score} / ${res.totalPossible} (${res.percentage}%)
⏳ *${t('timeSpent')}* ${res.time}
⚠️ *${t('violations')}* ${res.blocks} ${t('times')}
📅 *${t('dateLabel')}* ${new Date().toLocaleString('uz-UZ')}
    `;

    const url = `https://api.telegram.org/bot${tgBotToken}/sendMessage`;
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: tgChatId,
            text: text,
            parse_mode: 'Markdown'
        })
    })
    .then(response => {
        if (!response.ok) {
            console.error("Telegram bot API error");
        }
    })
    .catch(err => {
        console.error("Telegram connection error: ", err);
    });
}


// --- HTML5 Canvas Certificate Generator ---
function generateCertificateCanvas(percentage) {
    const canvas = document.getElementById('certificate-canvas');
    const ctx = canvas.getContext('2d');

    // Draw Background
    const gradient = ctx.createRadialGradient(400, 300, 100, 400, 300, 600);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Draw Gold Borders
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 760, 560);
    
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, 740, 540);

    // Top Header
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('shsb.test.portal', 400, 80);

    // Certificate Title
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 44px Outfit';
    ctx.fillText(t('certTitle'), 400, 160);

    // Decorative line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(250, 190);
    ctx.lineTo(550, 190);
    ctx.stroke();

    // Body text
    ctx.fillStyle = '#f8fafc';
    ctx.font = '20px Outfit';
    ctx.fillText(t('certGivenTo'), 400, 240);

    // Student Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Outfit';
    ctx.fillText(studentName, 400, 300);

    // Student Class
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 20px Outfit';
    ctx.fillText(`${studentClass} ${t('studentOfClass')}`, 400, 345);

    // Text detail
    ctx.fillStyle = '#f8fafc';
    ctx.font = '18px Outfit';
    ctx.fillText(`${t('certText1')} (${percentage}%),`, 400, 400);
    ctx.fillText(t('certText2'), 400, 430);

    // Sign details / Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px Outfit';
    ctx.fillText(`${t('dateLabel')} ${new Date().toLocaleDateString('uz-UZ')}`, 200, 520);
    
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 16px Outfit';
    ctx.fillText(t('portalAdmin'), 600, 520);
    ctx.font = '14px Outfit';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('shsb.test.portal', 600, 540);
}

function downloadCertificatePNG() {
    const canvas = document.getElementById('certificate-canvas');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `sertifikat_${studentName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
