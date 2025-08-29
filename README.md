# 快答AI - 智能笔试辅助系统 (终版)

**快答AI** 是一个技术领先、绝对隐蔽的智能笔试辅助工具。它将桌面端的实时信息捕获能力（通过热键截图或剪贴板监听）与云端顶尖AI的分析能力无缝结合，通过一个独立的、跨设备的Web界面，为用户提供即时、准确的答案支持。

---

## 核心功能

- **剪贴板监听 (推荐)**: 在客户端勾选“监听剪贴板”后，程序会自动监测剪贴板的文本变化。当您复制 (`Ctrl+C`) 一段新文本时，程序会自动将其发送给AI进行解答。此方法最稳定、最高效。
- **热键全屏截图**: 按下 `Ctrl+Alt+S`，程序将在后台静默截取当前全屏图像，并发送给AI进行OCR识别和分析。
- **实时答案推送**: AI的解答会通过 WebSocket 实时推送到所有已登录的Web前端设备上，实现秒级响应。
- **多模型切换**: 通过热键 `Alt+Z`，可以在不同的 Gemini AI 模型（如 `gemini-1.5-flash` 和 `gemini-1.5-pro`）之间动态切换。

---

## 🛠️ 系统架构

本项目采用前后端分离的“铁三角”微服务架构，确保各模块独立、稳定、易于维护。

1.  **后端服务 (`kuai-da-ai-backend`)**:
    - **职责**: 系统的核心中枢。负责处理用户注册与登录、管理 WebSocket 持久连接、接收来自桌面客户端的问题数据（图片或文本）、调用 Google Gemini API、并将最终答案推送到指定用户的Web前端。

2.  **Web 前端 (`kuai-da-ai-webapp`)**:
    - **职责**: 答案的接收与展示端。用户可以在任何设备（手机、平板、备用电脑）的浏览器上登录，实时查看由AI生成的解答。

3.  **桌面客户端 (`kuai-da-ai-desktop`)**:
    - **职责**: 信息的采集与发送端。在主电脑上后台运行，负责用户登录、监听全局热键和剪贴板、并将捕获的信息通过 WebSocket 发送给后端。

---

## 🔧 技术栈 (Tech Stack)

### **第一部分：必备软件与环境 (从零开始)**

这是在一台全新的电脑上配置开发环境所需的全部软件。

| 软件/工具 | 图标/别称 | 版本 | 用途 | 官方网站/安装说明 |
| :--- | :--- | :--- | :--- | :--- |
| **Node.js** | - | **v20.x (LTS)** | JavaScript 核心运行环境。 | **必须使用 v20 版本**以保证所有依赖兼容。请使用下面的 `nvm-windows` 进行安装和版本管理。 |
| **NVM for Windows** | - | 最新版 | Node.js 版本管理器。 | 前往 [GitHub Releases](https://github.com/coreybutler/nvm-windows/releases) 下载 `nvm-setup.zip` 并安装。 |
| **PostgreSQL** | **大象图标** | v16 或更高 | 关系型数据库，存储用户信息。 | 前往 [官方网站](https://www.postgresql.org/download/) 下载。安装时请务必**记住您为 `postgres` 超级用户设置的密码**。 |
| **pnpm** | - | v10.x 或更高 | 高性能包管理器。 | 在安装完 Node.js 后，通过 `npm install -g pnpm` 安装。 |
| **Git** | - | 最新版 | 分布式版本控制系统。 | 前往 [官方网站](https://git-scm.com/downloads) 下载并安装。 |
| **科学上网工具**| V2Ray/Clash等 | - | 网络代理。 | **必须配置**，以确保后端服务能够稳定访问 Google Gemini API。推荐使用支持**全局代理(TUN模式)**的客户端。 |
| **代码编辑器** | VS Code 等 | - | 编写代码。 | 推荐 [Visual Studio Code](https://code.visualstudio.com/)。 |

### **第二部分：项目核心依赖库**

#### **后端 (`kuai-da-ai-backend`)**
- **框架**: `express`
- **实时通信**: `socket.io`
- **数据库 ORM**: `prisma`, `@prisma/client`
- **密码加密**: `bcryptjs`
- **认证**: `jsonwebtoken`
- **HTTP 客户端**: `axios`
- **环境变量**: `dotenv`
- **跨域处理**: `cors`

#### **Web 前端 (`kuai-da-ai-webapp`)**
- **框架**: `vue@3` (Composition API)
- **构建工具**: `vite`
- **状态管理**: `pinia`
- **路由**: `vue-router`
- **HTTP 客户端**: `axios`
- **实时通信**: `socket.io-client`

#### **桌面客户端 (`kuai-da-ai-desktop`)**
- **框架**: `electron`
- **界面**: `vue@3` + `typescript`
- **构建/打包**: `vite`, `electron-builder`
- **状态管理**: `pinia`
- **核心功能**:
  - `electron/clipboard`: 访问系统剪贴板。
  - `electron/globalShortcut`: 注册全局快捷键。
  - `electron/desktopCapturer`: 内置截图API。

---

## ⚙️ 本地部署与运行指南 (极其详细)

请严格按照以下步骤操作，以确保系统能完整地在您的本地计算机上运行。

### **第零步：环境配置 (全新电脑)**

1.  **安装 NVM for Windows**: 下载并安装 `nvm-setup.zip`。
2.  **安装 Node.js v20**:
    ```powershell
    # (以管理员身份打开终端)
    # 为 nvm 设置国内镜像以加速下载
    nvm node_mirror https://npmmirror.com/mirrors/node/
    nvm npm_mirror https://npmmirror.com/mirrors/npm/
    
    # 安装并使用 v20
    nvm install 20
    nvm use 20
    
    # 验证
    node -v 
    # 应显示 v20.x.x
    ```
3.  **安装 PostgreSQL**: 安装时，请务必**记下您为 `postgres` 超级用户设置的密码**。安装完成后，通过 Windows“服务”面板，确保 `postgresql` 服务是“正在运行”状态。
4.  **安装 pnpm**: `npm install -g pnpm`。
5.  **配置网络**: 启动您的科学上网工具，并设置为**全局代理模式 (TUN Mode)**，确保 `curl https://www.google.com` 命令可以成功返回内容。

### **第一步：配置并启动后端服务 (`kuai-da-ai-backend`)**

1.  **进入目录**:
    ```bash
    cd kuai-da-ai-backend
    ```
2.  **安装依赖**:
    ```bash
    npm install
    ```
3.  **配置环境变量 (`.env` 文件)**:
    - 在 `kuai-da-ai-backend` 根目录下，创建一个名为 `.env` 的新文件。
    - 将以下**模板内容**复制到 `.env` 文件中。
    - **请逐项修改为您自己的真实配置！**
      ```env
      # ==================================
      # 后端服务环境变量
      # ==================================

      # 1. 数据库连接字符串
      # 格式: postgresql://<用户名>:<密码>@<主机>:<端口>/<数据库名>
      # - <用户名>: 默认为 postgres
      # - <密码>: !! 替换为您安装 PostgreSQL 时设置的密码 !!
      # - <主机>: 本地开发通常是 localhost
      # - <端口>: PostgreSQL 默认是 5432
      # - <数据库名>: 默认是 postgres
      DATABASE_URL="postgresql://postgres:你的密码@localhost:5432/postgres"

      # 2. 你的 Google Gemini API 密钥
      # 从 Google AI Studio 获取
      GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX"

      # 3. (可选) 自定义一个用于 JWT 签名的密钥字符串
      # 这是一个用于加密用户登录令牌的“盐”，可以随意设置一个复杂的字符串
      JWT_SECRET="KuaidaAI_IS_THE_BEST_SECRET_KEY_NO_ONE_CAN_GUESS_IT!"
      ```
4.  **初始化数据库**: (仅在第一次运行时需要，此命令会根据 `prisma/schema.prisma` 文件在您的数据库中创建 `User` 表)
    ```bash
    npx prisma migrate dev --name init
    ```
5.  **启动服务**:
    ```bash
    node index.js
    ```
    > 终端应持续显示 `🚀 服务器正在端口 3000 上运行`。**保持此终端窗口不要关闭。**

### **第二步：启动 Web 前端 (`kuai-da-ai-webapp`)**

1.  **打开第二个终端窗口**。
2.  **进入目录**:
    ```bash
    cd kuai-da-ai-webapp
    ```
3.  **安装依赖**:
    ```bash
    npm install
    ```
4.  **启动服务**:
    ```bash
    npm run dev
    ```
    > 终端应显示 `➜ Local: http://localhost:XXXX/`。**保持此终端窗口不要关闭。**

### **第三步：启动桌面客户端 (`kuai-da-ai-desktop`)**

1.  **以管理员身份打开第三个终端窗口**。
2.  **进入目录**:
    ```bash
    cd kuai-da-ai-desktop
    ```
3.  **安装依赖**:
    ```bash
    pnpm install
    ```
4.  **启动服务**:
    ```bash
    pnpm run dev
    ```
    > 一个桌面应用窗口应该会自动弹出。

---

## 📖 使用方法

1.  **启动**: 确保上述三个服务都已成功启动。
2.  **注册**: 在浏览器中访问 Web 前端地址 (`http://localhost:XXXX`)，注册一个新账户。
3.  **双端登录**:
    - 在弹出的**桌面客户端**窗口中，使用您的账户登录。
    - 在您的**手机、平板或备用电脑**的浏览器上，访问 Web 前端地址并登录**同一个账户**。
4.  **开始使用**:
    - **方法一 (推荐 - 文本)**: 在桌面客户端，勾选 **“自动监听剪贴板”**。然后在任何需要解答的地方，用鼠标选中题目文字，按 `Ctrl+C`。
    - **方法二 (图片)**: 按下全局热键 `Ctrl+Alt+S`，程序将自动截取当前的全屏图像。
5.  **查看答案**: 无论使用哪种方法，AI 的解答都会在 **1-3 秒** 内实时显示在您登录的 Web 前端页面上。
6.  **切换模型**: 在桌面客户端运行时，随时可以按下 `Alt+Z` 来切换使用的 AI 模型。

---

## 📦 打包与部署

### **打包桌面客户端为 `.exe`**

```bash
# 在 kuai-da-ai-desktop 目录下
pnpm run build
