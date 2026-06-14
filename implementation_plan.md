# LocalStorage'dan Firebase Realtime Database'ga O'tish Rejasi

Hozirgi tizim barcha test savollari, natijalar, o'qituvchi parollari va vaqtinchalik ruxsatnomalarni faqatgina o'sha kompyuterning o'zida (LocalStorage'da) saqlamoqda. Bu degani, o'quvchi boshqa kompyuter yoki telefondan saytga kirsa, testlarni va sozlamalarni ko'ra olmaydi.

Buni global miqyosda ishlaydigan qilish uchun tizimni **Firebase Realtime Database** orqali bulutli (Cloud) sinxronizatsiyaga o'tkazish rejalashtirilmoqda. 

## User Review Required

> [!IMPORTANT]
> **Firebase Konfiguratsiyasi Kerak:** Men tizimni to'liq Firebase'ga ulaydigan kodni yozib tayyorlayman, biroq sizning shaxsiy bazangizga ulanishi uchun o'zingiz yaratgan Firebase loyihasining sozlamalari (Firebase Config) kerak bo'ladi. Agar sizda hali Firebase ochilmagan bo'lsa, qanday ochishni o'rgatishim mumkin. Yoki bo'lmasa test uchun vaqtinchalik bepul ochiq bazadan (masalan jsonbin kabi) foydalanishimizni xohlaysizmi?  

> [!WARNING]
> **Eski Ma'lumotlar:** LocalStorage'dan Firebase'ga birinchi marta o'tayotganda, barcha kompyuterdagi eski natijalar bulutga bitta joyga yig'iladi, shuning uchun eski test bazalari ustma-ust tushib ketishining oldini olish uchun ularni bir marta tozalash (yoki ehtiyotkorlik bilan yuklash) tavsiya etiladi.

## Open Questions

1. Sizda tayyor Firebase loyihasi va uning `firebaseConfig` kodlari (apiKey, authDomain, databaseURL, projectId va h.k.) bormi?
2. Agar yo'q bo'lsa, test uchun ochiq konfiguratsiyali bepul ma'lumotlar bazasi api'sini ulab beraymi yoki o'zingiz Firebase ochishingizni kutaymi?

## Proposed Changes

---

### Baza ulanishi (index.html)
Firebase SDK (Javascript kutubxonalarini) `index.html` ga qo'shamiz:

#### [MODIFY] index.html
- `<head>` qismiga Firebase App va Firebase Database kutubxonalarini (CDN orqali) yuklash skriptlarini qo'shamiz.
- Kodirovka (`<meta charset="UTF-8">`) va eski modullar daxlsiz qoladi.

---

### Sinxronizatsiya va Global Baza Mantiqi (script.js)

`script.js` ichidagi barcha ma'lumot saqlash/o'qish arxitekturasini o'zgartiramiz:

#### [MODIFY] script.js
- **Firebase Initsializatsiyasi:** Dastur boshlanishida `firebase.initializeApp(firebaseConfig)` va `database = firebase.database()` ni ishga tushirish qatorlari qo'shiladi.
- **`saveQuestions`, `saveResults` va `saveSettings` o'zgarishi:** LocalStorage (`localStorage.setItem`) o'rniga zudlik bilan `database.ref('...').set(...)` ishlatiladi. Masalan, o'qituvchi yangi vaqtinchalik parol yaratsa, bu parol darhol bulutga yoziladi.
- **Real vaqtda o'qish (Realtime Sync):** Tizim ochilishi bilan `database.ref('/').on('value', snapshot => {...})` orqali bazadagi barcha so'nggi o'zgarishlar (jumladan javoblarni ko'rsatish yashil tugmasi, parollar, savollar va o'quvchilar javoblari) yuklab olinadi va ekranda yangilanadi.
- **O'quvchi interfeysi:** O'quvchi boshqa qurilmadan saytga kirganda, u brauzeridagi eskirgan lokal xotirani emas, balki to'g'ridan-to'g'ri Firebase'dan olingan eng so'nggi savollar ro'yxatini (`questionsDatabase`) ko'radi. Qulflanish tekshiruvlari va Unlock jarayoni (anti-cheat) ham global bazadan tekshiriladi.

---

### Xavfsizlik va Til formatlari (lang.js va patch.js)
Ushbu fayllarning daxlsizligini saqlash:

#### [MODIFY] lang.js / patch.js (Teginilmaydi)
- Hech qanday ma'lumot o'zgarmaydi, "🏆 Top-10 Reyting ⭐" yoki oldingi Qoraqalpoqcha tarjimalar toza UTF-8 holida ishlashda davom etadi. `patch.js` sintaksislariga ham tegilmaydi.

## Verification Plan

### Manual Verification
1. Dasturni ishga tushirib, bitta kompyuter (brauzer) dan test savollarini qo'shib saqlaymiz.
2. Butunlay boshqa brauzer yoki Inkognito rejimidan ochganda, kiritilgan testlar, parollar va o'qituvchi sozlamalari (vaqtinchalik parol) o'sha zahoti ko'rinishi tekshiriladi.
3. Test vaqtida o'quvchi qoidani buzganda ekranni qulflash uchun o'qituvchi paroli boshqa qurilmada qanday bo'lsa shundayligicha to'g'ri ishlashini sinab ko'ramiz.
4. Excel eksporti eski formatda UTF-8 bo'lib aniq yuklanishini yana bir bor sinaymiz.
