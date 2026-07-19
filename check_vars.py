import re

with open('script_strict.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Define known declarations
declared = set([
    'HASHED_ADMIN_PASS', 'SUBJECTS', 'PIN_INPUT_IDS', 'DUR_INPUT_IDS', 'QUARTERS',
    'questionsDatabase', 'resultsDatabase', 'quizDuration', 'tgBotToken', 'tgChatId',
    'subjectPinsDatabase', 'subjectDurationsDatabase', 'subjectTestTypesDatabase',
    'subjectUnblockPinsDatabase', 'subjectQuarters', 'adminActiveQuarter', 'questions',
    'teacherTokens', 'showAnswersToStudent', 'geminiApiKey', 'currentTeacherSession',
    'currentScreen', 'staticTeacherPasswords', 'currentQuestionIndex', 'totalUserPoints',
    'studentName', 'studentClass', 'studentSubject', 'studentQuarter', 'currentQuizQuestions',
    'studentAnswers', 'earnedPoints', 'isLocked', 'blockCount', 'testTimeLimitSeconds',
    'timeElapsedSeconds', 'timerInterval', 'toastTimeout', 'audioCtx',
    # DOM elements
    'authScreen', 'instructionScreen', 'quizScreen', 'resultScreen', 'adminPanel', 'lockScreen',
    'toastAlert', 'instTitle', 'instTime', 'instCount', 'beginTestBtn', 'studentLoginSection',
    'adminLoginSection', 'backToStudentBtn', 'studentNameInput', 'studentClassInput',
    'studentSubjectInput', 'quizPinInput', 'adminSettingsQuarter', 'adminQuestionsQuarter',
    'startBtn', 'adminLoginBtn', 'leaderboardBody', 'adminPortalPassInput', 'adminAuthSubmit',
    'adminAuthError', 'adminLogoutBtn', 'tabQuestionsBtn', 'tabResultsBtn', 'tabSettingsBtn',
    'tabQrcodeBtn', 'tabSecurityBtn', 'tabQuestions', 'tabResults', 'tabSettings', 'tabQrcode',
    'tabSecurity', 'teacherPinSetter', 'teacherSubjectPin', 'teacherSubjectDuration',
    'teacherSubjectQuarter', 'teacherSubjectTestType', 'saveTeacherPinBtn', 'teacherTimerBanner',
    'teacherTimerText', 'teacherTimerInterval', 'addQBtn', 'saveSettingsBtn', 'clearResultsBtn',
    'exportExcelBtn', 'filterClass', 'testDurationInput', 'compQ1', 'compQ2', 'analyzeBtn',
    'comparisonResult', 'filterQuarter', 'tgBotTokenInput', 'tgChatIdInput', 'teacherNameInput',
    'teacherSubjectSelect', 'tempPasswordExpiry', 'generateTokenBtn', 'teacherTokensList',
    'wordFileInput', 'wordUploadBtn', 'newQText', 'newQOpt0', 'newQOpt1', 'newQOpt2', 'newQOpt3',
    'newQCorrect', 'newQPoints', 'newQSubject', 'wordQSubject', 'adminQuestionsCount',
    'adminQuestionsList', 'resultsTableBody', 'geminiAnalyzeBtn', 'geminiAnalysisOutput',
    'geminiOverlay', 'geminiLoading', 'closeGeminiBtn', 'questionText', 'optionsContainer',
    'nextBtn', 'progressBar', 'currentQuestionNum', 'totalQuestionsSpan', 'questionPointsDisplay',
    'timerDisplay', 'studentDisplay', 'resultContent', 'certificateZone', 'downloadCertBtn',
    'errorReviewList', 'adminPassInput', 'unlockBtn', 'unlockError', 'qrCanvas', 'downloadQrBtn'
])

# Let's find any assignment to a variable not in the list
lines = text.split('\n')
for i, line in enumerate(lines):
    # simple regex for assignment: word = value
    match = re.search(r'^\s*([a-zA-Z0-9_]+)\s*=', line)
    if match:
        var_name = match.group(1)
        if var_name not in declared and var_name not in ['let', 'const', 'var', 'localStorage', 'document', 'window', 'sessionStorage']:
            # might be an undeclared assignment
            if 'let ' + var_name not in text and 'const ' + var_name not in text and 'var ' + var_name not in text:
                print(f"Undeclared assignment at line {i+1}: {var_name}")
                
    # also check for `isVoiceAntiCheatEnabled` since it was mentioned in previous context!
    if 'isVoiceAntiCheatEnabled' in line:
        print(f"Found isVoiceAntiCheatEnabled at line {i+1}: {line}")
