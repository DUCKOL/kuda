<!-- 
=================================================================
快答AI - 桌面客户端 - 渲染进程 (Vue 应用)
文件: src/App.vue (最终本地文件方案 + 严格验证)
=================================================================
-->
<template>
  <div class="container">
    <!-- 顶部登录区 -->
    <div class="login-section card">
      <div class="title-bar">
        <span class="feather-icon">✒️</span>
        <h3>截图工具</h3>
      </div>
      <div class="form-group">
        <label for="email">邮箱:</label>
        <input type="email" id="email" v-model="email" :disabled="userStore.isLoggedIn" />
      </div>
      <div class="form-group">
        <label for="password">密码:</label>
        <input type="password" id="password" v-model="password" :disabled="userStore.isLoggedIn" />
      </div>
      <button class="login-btn" @click="handleLogin" :disabled="userStore.isLoggedIn">
        {{ userStore.isLoggedIn ? '已登录' : '登录' }}
      </button>
    </div>

    <!-- 中部状态与设置区 -->
    <div class="settings-section card">
      <div class="version-info">版本: 11.0 (本地文件稳定版)</div>
      <div class="status-line">
        <span>WebSocket状态:</span>
        <span :class="websocketStore.isConnected ? 'status-connected' : 'status-disconnected'">
          {{ websocketStore.isConnected ? '已连接' : '未连接' }}
        </span>
        <button class="disconnect-btn" @click="handleLogout" :disabled="!userStore.isLoggedIn">断开连接</button>
      </div>
      <div class="prompt-section">
        <label>提示词 <small>(可根据需要自行修改):</small></label>
        <textarea v-model="prompt"></textarea>
      </div>
      <div class="current-model-display">
        当前模型: <strong>{{ currentModel }}</strong>
      </div>
    </div>

    <!-- 底部功能区 (静态部分) -->
    <div class="actions-section card">
      <div class="screenshot-actions">
        <button disabled>手动截图</button>
        <div class="checkbox-group">
          <input type="checkbox" id="clipboard-listener" />
          <label for="clipboard-listener">自动监听剪贴板</label>
        </div>
      </div>
      <div class="hotkey-info">
        <h4>截图热键</h4>
        <p><strong>Ctrl+Alt+S:</strong> 全屏截图</p>
        <p><strong>Alt+Z:</strong> 切换AI模型 (Flash/Pro)</p>
        <p><strong>Alt+A:</strong> 切换不同的题型提示词</p>
        <p><strong>局部截图:</strong> 长按鼠标3秒选择起点，再长按3秒选择终点</p>
      </div>
    </div>
    
    <!-- 最底部状态栏 -->
    <div class="footer-bar">
      <span>使用状态: {{ userStore.isLoggedIn ? '已就绪' : '就绪，请登录' }}</span>
      <span>用户名: {{ userStore.email || '未登录' }}</span>
      <div>
        <button class="footer-btn">充值</button>
        <button class="footer-btn">使用教程</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from './stores/user';
import { useWebsocketStore } from './stores/websocket';

// !! 核心改动：引入 Node.js 的 fs (文件系统) 模块 !!
// @ts-ignore
const fs = require('fs');
// @ts-ignore
const { ipcRenderer } = require('electron');

const userStore = useUserStore();
const websocketStore = useWebsocketStore();

const email = ref('');
const password = ref('');
const prompt = ref('请整理当前这张图片中的问题，并且回答问题给出答案。');
const models = ['gemini-2.5-flash', 'gemini-2.5-pro'];
const currentModelIndex = ref(0);
const currentModel = ref(models[0]);

const handleLogin = async () => {
  const success = await userStore.login(email.value, password.value);
  if (success && userStore.token) {
    websocketStore.connect(userStore.token);
  }
};

const handleLogout = () => {
  websocketStore.disconnect();
  userStore.logout();
};

/**
 * 核心函数：处理主进程发送过来的截图文件路径
 * @param filePath - 截图文件在本地的绝对路径
 */
function handleScreenshotFile(filePath: string) {
  console.log(`[Renderer Process] 收到截图文件路径: ${filePath}`);
  try {
    // 1. 验证文件是否存在
    if (!fs.existsSync(filePath)) {
      console.error(`[Renderer Process] 错误：文件 ${filePath} 不存在！`);
      return;
    }

    // 2. 同步读取文件内容为一个 Buffer 对象
    const imageBuffer = fs.readFileSync(filePath);
    
    // 3. 将 Buffer 对象转换为 Base64 编码的字符串
    const imgBase64 = imageBuffer.toString('base64');

    // 4. 增加一个严格验证，确保 Base64 字符串是有效的
    if (!imgBase64 || imgBase64.length < 100) { // 小于100个字符的 Base64 不可能是有效的图片
      console.error('[Renderer Process] 错误：读取文件后得到的 Base64 字符串为空或过短！');
      return;
    }

    console.log(`[Renderer Process] 文件读取并编码成功 (Base64 长度: ${imgBase64.length})，准备发送...`);

    // 5. 检查状态并通过 WebSocket 发送数据
    if (!userStore.isLoggedIn || !websocketStore.isConnected) {
      alert('请先登录并确保 WebSocket 已连接！');
      return;
    }
    if (websocketStore.socket && userStore.userId) {
      websocketStore.socket.emit('submitQuestion', {
        userId: userStore.userId,
        image: imgBase64,
        prompt: prompt.value,
        model: currentModel.value,
      });
      console.log('[Renderer Process] 问题数据已通过 WebSocket 发送！');
    }
  } catch (error) {
    console.error('[Renderer Process] 处理截图文件失败:', error);
  } finally {
    // 6. 无论成功与否，最后都尝试删除这个临时文件
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[Renderer Process] 临时文件 ${filePath} 已成功删除。`);
      }
    } catch (deleteError) {
      console.error(`[Renderer Process] 删除临时文件 ${filePath} 失败:`, deleteError);
    }
  }
}

onMounted(() => {
  console.log('[Renderer Process] 正在设置 ipcRenderer 监听器...');
  
  // 监听主进程发送过来的“截图已保存”事件和文件路径
  ipcRenderer.on('screenshot-saved', (event: any, filePath: string) => {
    handleScreenshotFile(filePath);
  });

  // 监听模型切换事件
  ipcRenderer.on('toggle-model', () => {
    currentModelIndex.value = (currentModelIndex.value + 1) % models.length;
    currentModel.value = models[currentModelIndex.value];
    console.log(`[Renderer Process] 模型已切换为: ${currentModel.value}`);
  });
});
</script>

<style>
/* 样式代码保持不变 */
* { box-sizing: border-box; margin: 0; padding: 0; }
body, html { font-family: 'Microsoft YaHei', sans-serif; font-size: 14px; background-color: #f0f0f0; color: #333; padding: 10px; height: 100%; }
button { font-family: inherit; padding: 5px 10px; border: 1px solid #ccc; border-radius: 3px; background-color: #f7f7f7; cursor: pointer; }
button:hover { background-color: #e8e8e8; }
button:disabled { cursor: not-allowed; opacity: 0.6; }
input[type="email"], input[type="password"], textarea { width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 3px; }
.card { background-color: #ffffff; border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin-bottom: 10px; }
.container { display: flex; flex-direction: column; height: 100vh; }
.login-section .title-bar { display: flex; align-items: center; margin-bottom: 15px; }
.login-section .feather-icon { font-size: 18px; margin-right: 8px; }
.form-group { display: flex; align-items: center; margin-bottom: 10px; }
.form-group label { width: 50px; flex-shrink: 0; }
.login-btn { display: block; width: 100%; margin-top: 5px; padding: 8px; }
.settings-section { position: relative; }
.version-info { position: absolute; top: 10px; right: 10px; font-size: 12px; color: #888; }
.status-line { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
.status-connected { color: green; font-weight: bold; }
.status-disconnected { color: red; font-weight: bold; }
.disconnect-btn { padding: 2px 8px; }
.prompt-section label { display: block; margin-bottom: 5px; }
.prompt-section textarea { height: 80px; resize: vertical; }
.actions-section { flex-grow: 1; }
.screenshot-actions { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
.checkbox-group { display: flex; align-items: center; gap: 5px; }
.hotkey-info { border-top: 1px solid #eee; padding-top: 15px; }
.hotkey-info h4 { margin-bottom: 10px; }
.hotkey-info p { margin-bottom: 5px; font-size: 13px; color: #555; }
.footer-bar { display: flex; justify-content: space-between; align-items: center; padding: 10px; background-color: #e9e9e9; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; color: #666; }
.footer-btn { margin-left: 10px; }
.current-model-display { margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee; text-align: right; font-size: 12px; color: #555; }
</style>