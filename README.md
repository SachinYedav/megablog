# MegaBlog — A Scalable Full‑Stack Blogging Platform

MegaBlog is a modern, production‑inspired blogging platform built with **React**, **Appwrite**, and **Vite**.
This project focuses on **real‑world architecture**, clean frontend patterns, and backend‑as‑a‑service integration rather than being a simple demo CRUD app.

> 🎯 **Goal:** Learn how real applications are structured, deployed, and scaled — by actually building one.

---

## 🌐 Live Demo

👉 [https://magablog.vercel.app](https://magablog.vercel.app)

---

## ✨ Key Highlights

* 🔐 Secure authentication using Appwrite
* 📝 Rich blog creation and publishing flow
* 💬 Comments, bookmarks, and user interactions
* 🔔 Notifications & subscriptions system
* ⚡ Fast Vite + React setup
* 🎨 Clean UI with Tailwind CSS
* 📱 Progressive Web App (PWA) ready
* 🧩 Modular, maintainable codebase

This project is intentionally built to feel **close to a real production app**, not a tutorial project.

---

## 📸 Screenshots

> Screenshots are stored inside `public/screenshots/`

* Home page
* Blog reader view
* Editor / dashboard
* Authentication screens
* Mobile & PWA view

```txt
public/screenshots/
├── daddpostpage.png
├── dhelppage.png
├── dhomepage.png
├── dpostpage.png
├── dprofilepage.png
├── mhomepage.jpeg
├── mpostpage.jpg
├── msettingspage.jpg
├── mprofilepage.jpg
└── msubscriptionspage.jpg
```
---

## 🛠️ Tech Stack

| Layer            | Technology                                    |
| ---------------- | --------------------------------------------- |
| Frontend         | React 18, Vite                                |
| State Management | Redux Toolkit                                 |
| Styling          | Tailwind CSS                                  |
| Backend          | Appwrite (Auth, Database, Storage, Functions) |
| Realtime         | Appwrite Realtime                             |
| Notifications    | Firebase Cloud Messaging                      |
| AI               | Google Gemini API                             |
| Deployment       | Vercel                                        |

---

## 📁 Project Structure (High Level)

```txt
megablog/
├── public/                 # Static assets & screenshots
├── scripts/                # Utility / setup scripts
├── src/
│   ├── app/                # Redux store & slices
│   ├── components/         # Reusable UI components
│   ├── pages/              # Route-level pages
│   ├── services/           # Appwrite, Firebase, API logic
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Helpers & constants
│   └── main.jsx            # App entry point
├── .env.sample             # Environment variables example
├── index.html
├── vite.config.js
├── tailwind.config.js
├── vercel.json
└── package.json
```

> Folder structure may evolve as features grow.

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/SachinYedav/megablog.git
cd megablog
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Variables Setup

Create a `.env` file in the root directory and copy values from `.env.sample`.

### 🔐 Appwrite Core

```env
VITE_APPWRITE_URL=
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_DATABASE_ID=
VITE_APPWRITE_COLLECTION_ID=
VITE_APPWRITE_BUCKET_ID=
```

### 📚 Appwrite Collections

```env
VITE_APPWRITE_PROFILES_COLLECTION_ID=
VITE_APPWRITE_COMMENTS_COLLECTION_ID=
VITE_APPWRITE_SUBSCRIPTIONS_COLLECTION_ID=
VITE_APPWRITE_REPORTS_COLLECTION_ID=
VITE_APPWRITE_BOOKMARKS_COLLECTION_ID=
VITE_APPWRITE_HISTORY_COLLECTION_ID=
VITE_APPWRITE_SEARCHHISTORY_COLLECTION_ID=
VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID=
VITE_APPWRITE_COLLECTION_CHATS_ID=
VITE_APPWRITE_COLLECTION_MESSAGES_ID=
VITE_APPWRITE_SUPPORT_COLLECTION_ID=
VITE_APPWRITE_RATINGS_COLLECTION_ID=
```

### ⚙️ Appwrite Functions

```env
VITE_APPWRITE_FUNCTION_AUTH_ID=
VITE_APPWRITE_FUNCTION_CHAT_ID=
```

### 🤖 AI Integration

```env
VITE_GEMINI_API_KEY=
```

### 🔔 Firebase (Push Notifications)

```env
VITE_FIREBASE_VAPID_KEY=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

### 🔊 Assets

```env
VITE_APPWRITE_FCM_PROVIDER_ID=
VITE_APPWRITE_SOUND_FILE_ID=
```

> ⚠️ Never commit `.env` files to the repository.

---

### 4️⃣ Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🧪 Project Status

**Status:** Learning Project / Alpha

This project is under active development. Expect:

* incomplete features
* refactors
* breaking changes

This is intentional and part of the learning process.

---

## 🤝 Contributing

Contributions are welcome.

You can help by:

* fixing bugs
* improving UI/UX
* refactoring code
* suggesting features
* improving documentation

This repository is beginner‑friendly and open for discussion.

---

## 📬 Contact

* GitHub: [https://github.com/SachinYedav](https://github.com/SachinYedav)
* Project Repo: [https://github.com/SachinYedav/megablog](https://github.com/SachinYedav/megablog)

---

### ❤️ Final Note

MegaBlog exists to **learn by building real things**.

Not perfect. Not finished. But real.

Built with patience, curiosity, and a lot of debugging ☕
