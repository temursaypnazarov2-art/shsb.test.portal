# SHSB Test Portal

Xo‘jayli tumani ixtisoslashtirilgan maktabi uchun onlayn BSB/CHSB test portali.

**Asosiy stack:** HTML + CSS + JavaScript, Firebase Auth + Realtime Database, Chart.js.

## Tezkor ishga tushirish (lokal)

```bash
npx --yes serve .
```

Brauzerda ochilgan manzilni oching (odatda `http://localhost:3000`).

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

## Asosiy fayllar

| Fayl | Vazifasi |
|------|----------|
| `index.html` | UI |
| `script.js` | Mantiq + Auth |
| `style.css` | Dizayn |
| `lang.js` | UZ / QQ / EN |
| `firebase.json` | Deploy |
| `database.rules.json` | RTDB qoidalari |
| `ROADMAP.md` | Bosqichlar |
| `tools/legacy/` | Eski skriptlar |

## Xavfsizlik holati (2-bosqich)

Yaxshilangan:
- Admin/o‘qituvchi **Firebase Auth** orqali kiradi
- Savol/sozlama yozish uchun `staff` profili kerak
- Telegram tokenlari faqat admin o‘qiydi
- O‘quvchi natijasi `push` (butun bazani o‘chirib yubora olmaydi)
- Login urinishlari cheklangan

Hali ochiq (keyingi bosqich):
- Fan PIN’lari client’da o‘qiladi (o‘quvchi PIN tekshiruvi uchun)
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
