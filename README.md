# 🚀 Collaborative Code Editor

A real-time collaborative code editor where multiple developers can edit the same file simultaneously — changes sync across all connected clients in under 100ms.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

## 🌐 Live Demo

| Service | URL |
|--------|-----|
| Frontend | [collaborative-editor-one.vercel.app](https://collaborative-editor-one.vercel.app) |
| Backend | [collaborative-editor-h7z1.onrender.com](https://collaborative-editor-h7z1.onrender.com) |

---

## ✨ Features

- **Real-time sync** — edits appear on all connected clients in under 100ms via WebSockets
- **Room-based sessions** — create or join named rooms; session state persists across reconnects
- **Monaco Editor** — the same engine that powers VS Code, with syntax highlighting for 10+ languages
- **Conflict resolution** — concurrent edits from multiple users are merged gracefully without data loss
- **Dark mode UI** — clean, responsive interface built in React

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Monaco Editor |
| Backend | Node.js, Express.js |
| Real-time | Socket.io (WebSockets) |
| Database | PostgreSQL |

---

## 📁 Project Structure

```
collaborative-editor/
├── client/          # React frontend
│   ├── public/
│   └── src/
└── server/          # Node.js backend
    └── index.js
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js v16+
- PostgreSQL

### Backend
```bash
cd server
npm install
node index.js
```

### Frontend
```bash
cd client
npm install
npm start
```

---

## 📄 License

MIT
