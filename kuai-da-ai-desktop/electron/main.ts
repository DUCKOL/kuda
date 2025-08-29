import { app, BrowserWindow, globalShortcut } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import screenshot from 'screenshot-desktop';
import os from 'node:os'; // 引入 os 模块来获取系统临时文件夹路径

// ES Module 环境下 __dirname 的替代方案
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vite 开发服务器 URL 的环境变量
process.env.VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    width: 500,
    height: 750,
    webPreferences: {
      // 指定预加载脚本的路径
      preload: path.join(__dirname, 'preload.js'),
      // !! 核心改动：我们需要在 Vue 应用中读写本地文件，所以必须启用 Node.js 集成 !!
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 加载页面
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'));
  }
}

// 当 Electron App 准备就绪时
app.whenReady().then(() => {
  createWindow();

  // --- 注册全局快捷键 ---

  const screenshotShortcut = 'Ctrl+Alt+S';
  if (!globalShortcut.register(screenshotShortcut, async () => {
    console.log(`[Main Process] 热键 ${screenshotShortcut} 按下，准备保存截图到本地...`);
    
    // 生成一个带时间戳的、唯一的临时文件名
    const tempPath = path.join(os.tmpdir(), `kuaida_screenshot_${Date.now()}.png`);

    try {
      // 调用 screenshot-desktop 将高清截图直接保存到指定文件路径
      const finalPath = await screenshot({ filename: tempPath });
      
      console.log(`[Main Process] 截图已成功保存到: ${finalPath}`);
      
      // 将这个临时文件的【绝对路径】发送给渲染进程（Vue 应用）
      win?.webContents.send('screenshot-saved', finalPath);
      
    } catch (error) {
      console.error('[Main Process] 保存截图到文件失败:', error);
    }
  })) {
    console.log(`[Main Process] 快捷键 ${screenshotShortcut} 注册失败`);
  }

  const toggleModelShortcut = 'Alt+Z';
  if (!globalShortcut.register(toggleModelShortcut, () => {
    console.log(`[Main Process] 热键 ${toggleModelShortcut} 按下，通知渲染进程切换模型...`);
    win?.webContents.send('toggle-model');
  })) {
    console.log(`[Main Process] 快捷键 ${toggleModelShortcut} 注册失败`);
  }
});

// --- App 生命周期事件处理 ---
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    globalShortcut.unregisterAll();
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});