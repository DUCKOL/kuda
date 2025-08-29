# QuickAnswer AI - Intelligent Test Assistance System

**QuickAnswer AI** is a stealthy and advanced tool for test assistance.
It captures text or screenshots on your desktop and sends them to a cloud AI for processing.
Answers are instantly pushed to any logged-in device through a secure web app.

---

## 🚀 Core Features

-   **Clipboard Monitoring (Recommended)**
    Copy text (`Ctrl+C`) → auto-send to AI → get an instant answer.

-   **Hotkey Screenshot**
    Press `Ctrl+Alt+S` → capture the full screen → AI performs OCR & provides an answer.

-   **Real-time Answer Push**
    AI results appear in seconds via WebSocket.

-   **Model Switching**
    Press `Alt+Z` to switch between different Gemini AI models.

---

## 🛠️ System Architecture

1.  **Backend (`kuai-da-ai-backend`)**
    -   Manages user accounts, WebSocket connections, Gemini API calls, and pushes answers to the client.

2.  **Web Frontend (`kuai-da-ai-webapp`)**
    -   A browser-based interface for receiving and displaying real-time answers.

3.  **Desktop Client (`kuai-da-ai-desktop`)**
    -   Runs in the background, monitors the clipboard/hotkeys, and sends data to the backend.

---

## 🔧 Tech Stack

-   **Backend**: express, socket.io, prisma, bcryptjs, jwt, axios
-   **Frontend**: vue@3, vite, pinia, vue-router, axios, socket.io-client
-   **Desktop**: electron, vue@3, typescript, vite, electron-builder

---

## ⚙️ Setup Guide

### Step 0. Environment Setup
-   Install Node.js v20+ (using NVM is recommended)
-   Install PostgreSQL v16+
-   Install pnpm globally:
    ```bash
    npm install -g pnpm
    ```
-   Enable a system proxy (Global/TUN mode) if required to access APIs.
-   Create a .env file and add the following configuration:
    ```bash
    DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/postgres"
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    JWT_SECRET="YOUR_SECRET_KEY"
    ```
-   Initialize the database and start the backend server:
    `npx prisma migrate dev --name init`
    `node index.js`

---
### Step 2. Web Frontend Setup

Navigate to the web frontend directory, install dependencies, and start the development server:
```bash
cd kuai-da-ai-webapp
npm install
npm run dev
```

---
### Step 3. Desktop Client Setup

Navigate to the desktop client directory, install dependencies, and start the application in development mode:
```bash
cd kuai-da-ai-desktop
pnpm install
pnpm run dev
```
cd kuai-da-ai-backend
npm installStep

---
### Usage
Start Services: Ensure the backend, web frontend, and desktop client are all running.
Register & Login: Use the web frontend to register a new account and log in.
Login on Desktop: Log in to the desktop client using the same account credentials.
Capture Content:
Copy text to your clipboard (Ctrl+C).
Or, take a screenshot using the hotkey (Ctrl+Alt+S).
View Answers: Answers will appear on the web frontend within 1–3 seconds.
Switch Models: Press Alt+Z at any time to switch the AI model.
