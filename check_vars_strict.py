import re

with open('script_strict.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

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
    'errorReviewList', 'adminPassInput', 'unlockBtn', 'unlockError', 'qrCanvas', 'downloadQrBtn',
    'database', 't', 'QRious', 'document', 'window', 'localStorage', 'console', 'sessionStorage',
    'Date', 'Math', 'parseInt', 'parseFloat', 'btoa', 'atob', 'setTimeout', 'setInterval',
    'clearTimeout', 'clearInterval', 'alert', 'confirm', 'String', 'JSON'
])

for i, line in enumerate(lines):
    # check for assignment:  word = 
    matches = re.finditer(r'\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=', line)
    for match in matches:
        var_name = match.group(1)
        if var_name not in declared and var_name not in ['let', 'const', 'var', 'if', 'for', 'while', 'return']:
            # check if it's declared in the same line or previous lines
            # this is a heuristic
            print(f"Possible undeclared assignment at line {i+1}: {var_name}")
