# 🚀 AI-Powered Collaborative Code Editor

> Real-time collaborative coding with AI-powered code explanation and interview preparation.

🌐 **Live Demo:** https://collaborative-editor-one.vercel.app

---

## ✨ Features

### 🤝 Real-Time Collaboration

* Create or join coding rooms.
* Multiple users can edit simultaneously.
* Instant synchronization using Socket.IO.

### 🧠 AI Code Explanation

Select any piece of code and click **"Explain Code"**.

The AI provides:

✅ Code Explanation
✅ Time Complexity
✅ Space Complexity
✅ Possible Optimizations
✅ Alternative Approaches

---

### 🎯 AI Interview Mode

Choose your target role:

* 💼 TCS Prime
* 👨‍💻 SDE
* 🎨 Frontend Developer
* ⚙ Backend Developer

The AI asks **5 technical questions** covering:

* 📚 DSA
* 🗄 DBMS
* 🧩 OOP
* 🌐 Web Development
* 📁 Projects

For every answer, the AI evaluates:

⭐ Technical Correctness
🗣 Communication Clarity
📌 Missing Concepts
📈 Improvement Suggestions

---

## 🛠 Tech Stack

### Frontend

* ⚛ React
* 🎨 Tailwind CSS
* 📝 Monaco Editor
* 🔌 Socket.IO Client

### Backend

* 🟢 Node.js
* 🚂 Express.js
* 🔌 Socket.IO

### Database

* 🐘 PostgreSQL

### AI

* 🤖 OpenRouter
* 🧠 Cohere North Mini Code (`cohere/north-mini-code:free`)

### Deployment

* ▲ Vercel

---

## 🏗 Architecture

```text
User

↓

React + Monaco Editor

↓

Socket.IO

↓

Node + Express

↓

OpenRouter API

↓

Cohere North Mini Code

↓

PostgreSQL
```

---

## 🔮 Future Improvements

* 🎤 Voice-based Interview Mode
* 🌍 Multi-language Interview Support
* ✍ AI Code Generation
* 📊 Interview Analytics
* 🤖 Multiple AI Models

---

## 🎓 Motivation

This project combines:

* 🤝 Real-time collaboration
* 🧠 AI-assisted code understanding
* 🎯 AI-powered interview preparation

into a single platform to help developers **learn, collaborate, and prepare for technical interviews**.
