# SHSB Test Portal

Xo‘jayli tumani ixtisoslashtirilgan maktabi uchun onlayn BSB/CHSB test portali.

**Asosiy stack:** HTML + CSS + JavaScript, Firebase Auth + Realtime Database, Chart.js.

## Tezkor ishga tushirish (lokal)

Node bo‘lmasa (tavsiya):

```bash
python -m http.server 5500
```

Brauzerda: `http://localhost:5500`

Node o‘rnatilgan bo‘lsa:

```bash
npm install
npm run dev
```

Unit testlar (Node shart emas):

```bash
python tools/run_tests.py
```

## 2-bosqich: Firebase Authentication (muhim)

### 1) Console’da Auth yoqing

1. [Firebase Console](https://console.firebase.google.com/) → `shsbtestportal`
2. **Authentication** → **Sign-in method**
3. **Email/Password** → Enable → Save

### 2) Database rules’ni deploy qiling

```bash
npm i -g firebase-tools
firebase login
firebase use shsbtestportal
firebase deploy --only database
```

Yoki Console → Realtime Database → Rules → `database.rules.json` mazmunini joylashtiring → Publish.

### 3) Birinchi adminni yarating

1. Saytni oching → **O‘qituvchilar va Admin kirishi**
2. **Birinchi adminni yaratish** tugmasi chiqadi (faqat bir marta)
3. Email + parol (kamida 6 belgi) kiriting
4. Keyin shu email/parol bilan kirasiz

### 4) O‘qituvchi akkaunti

Admin panel → **Sozlamalar**:
- F.I.SH, email, parol, fan, muddat
- **Akkaunt yaratish**
- O‘qituvchi shu email/parol bilan kiradi (faqat o‘z fani)

## Rollar

| Rol | Kirish | Huquq |
|-----|--------|--------|
| O‘quvchi | PIN | Test topshirish, natija yozish |
| O‘qituvchi | Email/parol (Auth) | O‘z faniga savol/PIN |
| Admin | Email/parol (Auth) | To‘liq boshqaruv |

## Asosiy fayllar (4-bosqich)

| Fayl / papka | Vazifasi |
|--------------|----------|
| `index.html` | UI |
| `src/app/app.js` | Asosiy mantiq + Auth |
| `src/lib/` | constants, crypto, filters, normalize, scoring |
| `src/config/firebase.js` | Firebase config |
| `src/i18n.js` | UZ / QQ / EN |
| `src/style.css` | Dizayn |
| `tests/unit.mjs` + `tools/run_tests.py` | Unit testlar |
| `package.json` / `vite.config.js` | Vite (Node bo‘lganda) |
| `firebase.json` | Deploy |
| `database.rules.json` | RTDB qoidalari |
| `ROADMAP.md` | Bosqichlar |
| `script.js` / `lang.js` / `style.css` | Legacy (ishlatilmaydi) |

## 3-bosqich (UX)

- Savol filtrlari + natijalar dashboard
- Offline / sekin internet banner
- Rasmlar: **Firebase Storage** (ishlamasa avtomatik base64)
- PIN: bazada **hash** (ochiq matn emas). Eski ochiq PIN hali ishlaydi; yangi saqlashda hash yoziladi

### Storage yoqish

1. Firebase Console → **Storage** → Get started
2. Rules faylini joylang:

```bash
firebase deploy --only storage
firebase deploy --only database
```

Yoki Console’da `storage.rules` va yangilangan `database.rules.json` ni Publish qiling.

**Muhim:** PIN’ni qayta saqlang (o‘qituvchi/admin) — shunda hash yoziladi.

## 4-bosqich (arxitektura)

- Kod `src/` ostida modullarga ajratildi (`window.SHSB.*`)
- Node shart emas — oddiy HTTP server yetarli
- Keyinroq: `npm install && npm run dev` / `npm test` (Vitest)

## Xavfsizlik holati

Yaxshilangan:
- Admin/o‘qituvchi **Firebase Auth**
- Savol/sozlama yozish uchun `staff`
- Telegram faqat admin
- Natija `push`
- PIN hash
- Offline banner

Hali cheklangan:
- PIN tekshiruvi brauzerda (hash bilan). To‘liq server-side uchun Cloud Functions (Blaze) kerak
- Gemini kaliti localStorage’da
- Cloud Functions yo‘q

## Hosting

```bash
firebase deploy --only hosting
```

## Muammo chiqsa

| Xato | Yechim |
|------|--------|
| `operation-not-allowed` | Email/Password Auth yoqing |
| `PERMISSION_DENIED` | Rules deploy qiling / Auth bilan kiring |
| Birinchi admin tugmasi yo‘q | `meta/setupComplete` allaqachon `true` — Console’dan tekshiring |
| O‘qituvchi kira olmaydi | `staff/{uid}` yozilganmi va `active: true`mi |

Batafsil reja: [`ROADMAP.md`](./ROADMAP.md)
