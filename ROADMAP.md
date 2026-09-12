# SHSB Test Portal — rivojlantirish yo‘l xaritasi

## 1-bosqich — Poydevor
- [x] Loyiha tozalash, README, gitignore, Firebase fayllari

## 2-bosqich — Xavfsizlik
- [x] Firebase Auth, staff rules, o‘qituvchi akkauntlari

## 3-bosqich — UX
- [x] Savol filtrlari, natijalar dashboard, offline banner, PIN hash
- [x] Storage ixtiyoriy (Blaze kerak — hozir base64 fallback)

## 4-bosqich — Arxitektura
- [x] `src/lib/` — constants, crypto, normalize, filters, scoring
- [x] `src/config/firebase.js` — Firebase config
- [x] `src/app/app.js` + `src/i18n.js` + `src/style.css`
- [x] `index.html` modular skriptlarni yuklaydi
- [x] `package.json` + `vite.config.js` (Node o‘rnatilgach)
- [x] Unit testlar: `python tools/run_tests.py`
- [x] README yangilandi
- [ ] Node o‘rnatib `npm install && npm run dev` (ixtiyoriy)
- [ ] Keyingi refactor: `app.js` ni yanada kichik fayllarga bo‘lish
- [ ] GitHub Actions CI (ixtiyoriy)
