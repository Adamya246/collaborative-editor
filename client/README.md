![GitHub stars](https://img.shields.io/github/stars/Adamya246/collaborative-editor?style=for-the-badge)
![GitHub forks](https://img.shields.io/github/forks/Adamya246/collaborative-editor?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/Adamya246/collaborative-editor?style=for-the-badge)
![GitHub license](https://img.shields.io/github/license/Adamya246/collaborative-editor?style=for-the-badge)
![Repo size](https://img.shields.io/github/repo-size/Adamya246/collaborative-editor?style=for-the-badge)

# 🚀 Collaborative Code Editor

![React](https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js)
![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-black?style=for-the-badge&logo=socket.io)
![Monaco Editor](https://img.shields.io/badge/Editor-Monaco-orange?style=for-the-badge)

A real-time collaborative code editor where multiple users can join a room and write code together instantly.

---

## ✨ Features

- 🔗 Create or join rooms using a unique Room ID  
- ⚡ Real-time code syncing across all users  
- 👥 Live user presence tracking  
- 🌐 Multiple programming language support  
- 📋 Easy room sharing via copy button  
- 🧠 In-memory storage (extendable to database)  

---

## 🛠 Tech Stack

### Frontend
- React  
- Monaco Editor  
- Socket.IO Client  

### Backend
- Node.js  
- Express  
- Socket.IO  

---

## ⚙️ How It Works

1. User creates or joins a room  
2. WebSocket connection is established using Socket.IO  
3. Server maintains room state (code, language, users)  
4. When a user edits code:
   - Change is sent to server  
   - Server broadcasts update to all users in the room  
5. All connected users see updates instantly  

---

## 📁 Project Structure

```
collaborative-editor/
├── server/      # Backend (Node + Socket.IO)
├── client/      # Frontend (React + Monaco Editor)
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Adamya246/collaborative-editor.git
cd collaborative-editor
```

### 2. Start Backend

```bash
cd server
npm install
node index.js
```

### 3. Start Frontend

```bash
cd client
npm install
npm start
```

---

## 📸 Demo

Open two browser tabs, join the same room, and experience real-time collaboration.

---

## 🔮 Future Improvements

- Database integration (PostgreSQL / MongoDB)  
- User authentication (login/signup)  
- Code execution feature  
- Chat system  
- Cursor tracking (like Google Docs)  

---

## 📄 License

This project is licensed under the MIT License.
