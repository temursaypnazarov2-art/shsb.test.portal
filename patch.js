const fs = require('fs');

let content = fs.readFileSync('c:\\Project AI\\quiz-portal\\script.js', 'utf8');

const replacements = [
    ['alert("Iltimos, test vaqtini to\'g\'ri kiriting!")', 'alert(t(\'alertDuration\'))'],
    ['alert("Barcha sozlamalar saqlandi!")', 'alert(t(\'alertSaved\'))'],
    ['alert("Iltimos, ismingiz va sinfingizni to\'liq kiriting!")', 'alert(t(\'alertDetails\'))'],
    ['alert("Savollar mavjud emas! Iltimos, admin bilan bog\'laning.")', 'alert(t(\'alertNoQuestions\'))'],
    ['alert("Barcha maydonlarni to\'ldiring!")', 'alert(t(\'alertFields\'))'],
    ['alert("Savol qo\'shildi!")', 'alert(t(\'alertAdded\'))'],
    ['alert("Iltimos, avval Word (.docx) faylini tanlang!")', 'alert(t(\'alertSelectFile\'))'],
    ['alert("Faylni o\'qishda xatolik yuz berdi!")', 'alert(t(\'alertReadError\'))'],
    ['confirm("Natijalarni butunlay o\'chirmoqchimisiz?")', 'confirm(t(\'alertConfirmClear\'))'],
    ['alert("Eksport qilish uchun natijalar mavjud emas!")', 'alert(t(\'alertNoExport\'))'],
    [`alert(\`Muvaffaqiyatli yuklandi: \${importedQuestions.length} ta yangi savol qo'shildi!\`)`, `alert(\`\${t('alertImportSuccess')} \${importedQuestions.length} \${t('alertImportSuccess2')}\`)`],
    ['alert("Fayl ichidan mos formatdagi savollar topilmadi! Iltimos shablonni tekshiring.")', 'alert(t(\'alertImportEmpty\'))'],
    ['confirm("Ushbu savolni o\'chirib tashlamoqchimisiz?")', 'confirm(t(\'alertConfirmDelete\'))'],
    ['alert("Vaqt tugadi! Test avtomatik yakunlanadi.")', 'alert(t(\'alertTimeout\'))'],

    // Leaderboard
    ['<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">Reyting jadvali bo\'sh.</td></tr>', `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">\${t('emptyLeaderboard')}</td></tr>`],

    // Results table
    ['<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">Hozircha natijalar mavjud emas.</td></tr>', `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">\${t('noResults')}</td></tr>`],
    [`<td>\${res.classGroup || 'Noma\\'lum'}</td>`, `<td>\${res.classGroup || t('unknown')}</td>`],
    [`<td style="color: \${res.blocks > 0 ? 'var(--error-color)' : 'var(--success-color)'}">\${res.blocks} marta</td>`, `<td style="color: \${res.blocks > 0 ? 'var(--error-color)' : 'var(--success-color)'}">\${res.blocks} \${t('times')}</td>`],

    // Admin questions list
    [`<span style="color: var(--accent-color);">(\${q.points || 1} ball)</span>`, `<span style="color: var(--accent-color);">(\${q.points || 1} \${t('quizInfoPoints')})</span>`],
    [`To'g'ri javob: \${q.options[q.correct]}`, `\${t('lblCorrect')} \${q.options[q.correct]}`],
    [`<button class="danger-btn" onclick="deleteQuestion(\${index})">O'chirish</button>`, `<button class="danger-btn" onclick="deleteQuestion(\${index})">\${t('btnDelete')}</button>`],

    // Finish Quiz Analysis
    ['analysis = "A\'lo daraja! Siz mavzuni mukammal o\'zlashtirgansiz."', 'analysis = t(\'analysisEx\')'],
    ['analysis = "Yaxshi natija. Bilimingizni yanada mustahkamlashingiz mumkin."', 'analysis = t(\'analysisGood\')'],
    ['analysis = "Qoniqarli. Takrorlash ko\'proq talab etiladi."', 'analysis = t(\'analysisSat\')'],
    ['analysis = "Past natija. Iltimos, darslikni qaytadan o\'qib chiqing."', 'analysis = t(\'analysisBad\')'],

    // Finish Quiz details
    ['<span>Talaba:</span>', `<span>\${t('studentLabel')}</span>`],
    ['<span>To\'plangan ball:</span>', `<span>\${t('thScore')}:</span>`],
    ['ball</strong></div>', `\${t('quizInfoPoints')}</strong></div>`],
    ['<span>Foiz ko\'rsatkichi:</span>', `<span>\${t('percentageLabel')}</span>`],
    ['<span>Sarflangan vaqt:</span>', `<span>\${t('timeSpent')}</span>`],
    [`(Jami limit: \${quizDuration} daq)`, `(\${t('totalLimit')} \${quizDuration} \${t('min')})`],
    ['<span>Qoidabuzarliklar (Bloklar):</span>', `<span>\${t('violations')}</span>`],
    ['marta</strong></div>', `\${t('times')}</strong></div>`],
    ['<strong>Tahlil:</strong>', `<strong>\${t('analysisLabel')}</strong>`],

    // Error Review
    ['userChoice === -1 || userChoice === undefined ? "Javob berilmagan" : q.options[userChoice]', 'userChoice === -1 || userChoice === undefined ? t(\'notAnswered\') : q.options[userChoice]'],
    [`<div class="review-user-ans">Siz tanlagan javob: \${userAnsText}</div>`, `<div class="review-user-ans">\${t('yourAnswer')} \${userAnsText}</div>`],
    [`<div class="review-correct-ans">To'g'ri javob: \${correctAnsText}</div>`, `<div class="review-correct-ans">\${t('lblCorrect')} \${correctAnsText}</div>`],
    ['<p style="color: var(--success-color); text-align: center; font-weight: 600;">Tabriklaymiz! Hech qanday xatoga yo\'l qo\'yilmadi.</p>', `<p style="color: var(--success-color); text-align: center; font-weight: 600;">\${t('noMistakes')}</p>`],

    // Telegram Notification
    ['📊 *IMTIHON NATIJASI (shsb.test.portal)*', `📊 *\${t('examResult')} (shsb.test.portal)*`],
    [`👤 *Talaba:* \${res.name}`, `👤 *\${t('studentLabel')}* \${res.name}`],
    [`🏫 *Sinf/Guruh:* \${res.classGroup}`, `🏫 *\${t('thClass')}:* \${res.classGroup}`],
    [`🎯 *Ball:* \${res.score} / \${res.totalPossible} (\${res.percentage}%)`, `🎯 *\${t('thScore')}:* \${res.score} / \${res.totalPossible} (\${res.percentage}%)`],
    [`⏳ *Sarflangan vaqt:* \${res.time}`, `⏳ *\${t('timeSpent')}* \${res.time}`],
    [`⚠️ *Bloklar soni:* \${res.blocks} marta`, `⚠️ *\${t('violations')}* \${res.blocks} \${t('times')}`],
    [`📅 *Sana:* \${new Date().toLocaleString('uz-UZ')}`, `📅 *\${t('dateLabel')}* \${new Date().toLocaleString('uz-UZ')}`],

    // Certificate Canvas
    [`ctx.fillText('MAQTOV YORLIG\\'I', 400, 160)`, `ctx.fillText(t('certTitle'), 400, 160)`],
    ['ctx.fillText(\'Ushbu sertifikat topshiriladi:\', 400, 240)', 'ctx.fillText(t(\'certGivenTo\'), 400, 240)'],
    [`ctx.fillText(\`\${studentClass}-sinf o'quvchisi\`, 400, 345)`, `ctx.fillText(\`\${studentClass} \${t('studentOfClass')}\`, 400, 345)`],
    [`ctx.fillText(\`Portalimizdagi imtihondan yuqori natija (\${percentage}%) ko'rsatib,\`, 400, 400)`, `ctx.fillText(\`\${t('certText1')} (\${percentage}%),\`, 400, 400)`],
    ['ctx.fillText(`maxsus fanlar bo\'yicha mustahkam bilimini namoyon etganligi uchun.`, 400, 430)', 'ctx.fillText(t(\'certText2\'), 400, 430)'],
    [`ctx.fillText(\`Sana: \${new Date().toLocaleDateString('uz-UZ')}\`, 200, 520)`, `ctx.fillText(\`\${t('dateLabel')} \${new Date().toLocaleDateString('uz-UZ')}\`, 200, 520)`],
    [`ctx.fillText('Portal Ma\\'muriyati', 600, 520)`, `ctx.fillText(t('portalAdmin'), 600, 520)`],
    ['<option value="all">Barchasi</option>', `<option value="all">\${t('filterAll')}</option>`]
];

for (let i = 0; i < replacements.length; i++) {
    content = content.replace(replacements[i][0], replacements[i][1]);
}

fs.writeFileSync('c:\\Project AI\\quiz-portal\\script.js', content, 'utf8');
console.log('Patch complete.');
