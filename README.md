# QuickAnswer AI - Intelligent Test Assistance System

**QuickAnswer AI** is a stealthy and advanced tool for test assistance.  
It captures text or screenshots on your desktop and sends them to cloud AI.  
Answers are instantly pushed to any logged-in device through a secure web app.

---

## 🚀 Core Features

- **Clipboard Monitoring (Recommended)**  
  Copy text (`Ctrl+C`) → auto-send to AI → instant answer.  

- **Hotkey Screenshot**  
  Press `Ctrl+Alt+S` → capture full screen → AI OCR & answer.  

- **Real-time Answer Push**  
  AI results appear in seconds via WebSocket.  

- **Model Switching**  
  Press `Alt+Z` to switch Gemini AI models.  

---

## 🛠️ System Architecture

1. **Backend (`kuai-da-ai-backend`)**  
   - User accounts, WebSocket, Gemini API call, push answers.  

2. **Web Frontend (`kuai-da-ai-webapp`)**  
   - Browser interface for real-time answers.  

3. **Desktop Client (`kuai-da-ai-desktop`)**  
   - Runs in background, monitors clipboard/hotkeys, sends data.  

---

## 🔧 Tech Stack

- **Backend**: express, socket.io, prisma, bcryptjs, jwt, axios  
- **Frontend**: vue@3, vite, pinia, vue-router, axios, socket.io-client  
- **Desktop**: electron, vue@3, typescript, vite, electron-builder  

---

## ⚙️ Setup Guide

### Step 0. Environment
- Install Node.js v20 (via NVM)  
- Install PostgreSQL v16+  
- Install pnpm:  
  ```bash
  npm install -g pnpm
Enable proxy (Global/TUN mode)

Step 1. Backend
bash
复制代码
cd kuai-da-ai-backend
npm install
Create .env:

env
复制代码
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/postgres"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
JWT_SECRET="YOUR_SECRET_KEY"
Init DB & start:

bash
复制代码
npx prisma migrate dev --name init
node index.js
Step 2. Web Frontend
bash
复制代码
cd kuai-da-ai-webapp
npm install
npm run dev
Step 3. Desktop Client
bash
复制代码
cd kuai-da-ai-desktop
pnpm install
pnpm run dev
📖 Usage
Start backend + frontend + desktop client.

Register & log in via web frontend.

Log in desktop client with same account.

Copy text (Ctrl+C) or screenshot (Ctrl+Alt+S).

Answers show up in 1–3 seconds.

Press Alt+Z to switch AI models.

📦 Packaging
Build desktop client .exe:

bash
复制代码
cd kuai-da-ai-desktop
pnpm run build
