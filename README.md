# AI-Powered Collaborative Code Editor

A real-time collaborative code editor with integrated AI features for code understanding and interview preparation.

## Live Demo

https://collaborative-editor-one.vercel.app

---

## Features

### Real-Time Collaborative Editing

* Create or join rooms.
* Multiple users can edit code simultaneously.
* Changes are synchronized instantly using Socket.IO.

### AI Code Explanation

Select any piece of code and click **"Explain Code"**.

The AI provides:

* Explanation of what the code does.
* Time Complexity.
* Space Complexity.
* Possible optimizations.
* Alternative approaches when applicable.

### AI Interview Mode

Click **"Interview Me"** and choose a role:

* TCS Prime
* SDE
* Frontend Developer
* Backend Developer

The AI asks **5 technical questions** related to:

* DSA
* DBMS
* OOP
* Web Development
* Projects

After every answer, the AI evaluates:

* Technical correctness
* Communication clarity
* Missing concepts
* Suggestions for improvement

---

## Tech Stack

### Frontend

* React
* Tailwind CSS
* Monaco Editor
* Socket.IO Client

### Backend

* Node.js
* Express.js
* Socket.IO

### Database

* PostgreSQL

### AI

* OpenRouter
* Cohere North Mini Code (`cohere/north-mini-code:free`)

### Deployment

* Vercel

---

## Architecture

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

## Screenshots

Add screenshots here:

* Collaborative Editing
* AI Code Explanation
* AI Interview Mode

---

## Future Improvements

* Voice-based interview mode
* Multi-language interview support
* AI code generation
* Interview history and analytics
* More AI models via OpenRouter

---

## Motivation

This project was built to combine:

* Real-time collaborative programming
* AI-assisted code understanding
* AI-powered interview preparation

into a single platform that helps developers learn, collaborate, and prepare for technical interviews.
