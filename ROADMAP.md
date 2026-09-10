# SHSB Test Portal — rivojlantirish yo‘l xaritasi

## 1-bosqich — Poydevor
- [x] Loyiha ildizini tozalash (`tools/legacy/`)
- [x] README + deploy yo‘riqnomasi
- [x] `.gitignore`, `firebase.json`, `database.rules.json`
- [x] Saqlash/xato xabarlarini yaxshilash
- [x] Admin login urinishlarini cheklash

## 2-bosqich — Xavfsizlik (hozir)
- [x] Firebase Authentication (Email/Password)
- [x] Birinchi admin ro‘yxatdan o‘tish
- [x] O‘qituvchi akkauntlari (secondary Auth app)
- [x] RTDB rules: yozish `staff` + auth bilan
- [x] Natijani `append` (o‘quvchi to‘liq bazani o‘chira olmaydi)
- [x] Telegram tokenlarini faqat admin o‘qishi
- [ ] Console’da Email/Password yoqish (**qo‘lda**)
- [ ] `firebase deploy --only database` (**qo‘lda**)

## 3-bosqich — UX va pedagogika
- Savol banki filtrlari (fan, sinf, chorak, kognitiv)
- Natijalarni sinf/fan bo‘yicha dashboard
- Offline / sekin internet holati
- Rasm uchun Firebase Storage (base64 o‘rniga)
- PIN tekshiruvini server tomonga (Cloud Functions)

## 4-bosqich — Arxitektura
- Kodni modullarga bo‘lish (`auth`, `quiz`, `admin`, `firebase`)
- Vite yoki shunga o‘xshash build
- Minimal avtomatik testlar
- CI + preview deploy
