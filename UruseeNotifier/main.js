const { app, Tray, Menu, nativeImage, screen, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const WebSocket = require('ws');

let tray = null;
let serverProcess = null;
let wsClient = null;
let notificationWindows = [];

// サーバー起動
function startServer() {
  const serverPath = path.join(__dirname, 'server.js');
  serverProcess = fork(serverPath);
  console.log('Server started');

  // サーバー起動後、クライアント接続
  setTimeout(() => {
    connectWebSocket();
  }, 1000);
}

// WebSocket接続
function connectWebSocket() {
  try {
    wsClient = new WebSocket('ws://localhost:5555');

    wsClient.on('open', () => {
      console.log('WebSocket connected');
    });

    wsClient.on('message', (data) => {
      console.log('Received:', data.toString());
      showNotification(data.toString());
    });

    wsClient.on('close', () => {
      console.log('WebSocket disconnected');
      wsClient = null;
      setTimeout(connectWebSocket, 3000);
    });

    wsClient.on('error', (err) => {
      console.error('WebSocket error:', err);
    });
  } catch (err) {
    console.error('Failed to connect:', err);
    wsClient = null;
  }
}

// メッセージ送信
function sendMessage() {
  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    wsClient.send('うるせぇ！');
    console.log('Message sent');
  } else {
    console.log('WebSocket not connected');
  }
}

// 通知表示
function showNotification(message) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const windowWidth = 250;
  const windowHeight = 120;
  const x = Math.floor(Math.random() * (width - windowWidth));
  const y = Math.floor(Math.random() * (height - windowHeight));

  const notificationWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: x,
    y: y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
  });

  const emojis = ['💢', '😤', '🔥', '⚡', '💥', '😠', '🗯️'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Yu Gothic', 'Meiryo', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: transparent;
    }
    .bubble {
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
      border: 3px solid white;
      border-radius: 20px;
      padding: 20px 30px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
      animation: pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      text-align: center;
    }
    .message {
      font-size: 24px;
      font-weight: bold;
      color: white;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      margin: 0;
    }
    .emoji {
      font-size: 32px;
      margin-right: 10px;
    }
    @keyframes pop {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
  </style>
</head>
<body>
  <div class="bubble">
    <p class="message"><span class="emoji">${emoji}</span>${message}</p>
  </div>
</body>
</html>`;

  notificationWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  notificationWindow.setIgnoreMouseEvents(true);

  notificationWindows.push(notificationWindow);

  setTimeout(() => {
    if (!notificationWindow.isDestroyed()) {
      notificationWindow.close();
      notificationWindows = notificationWindows.filter(win => win !== notificationWindow);
    }
  }, 3000);
}

// トレイアイコン作成
function createTray() {
  // シンプルな赤いアイコン
  const iconData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAE5SURBVFiF7Za9SgNBEMd/ZzYXiKJgYWNhYWFhYWFh4RNY+Qx+gI+QR/AFfAILCwsLCwsLCwsLCwsLC0FCCOTu5mwuCQlJ7u52N5L5w8Ltzv5mdnd2ZkDSpEmT/h1GVYGISBBFDeBIRNaq8v8LICIicQgXwJqIXFfl/xeAMfYIWAPaVfl/BzAW2gJrlfl/B7CwB6xX5v8dwBioU6l/AKSISGCA+sr8AwCc8xBwAA2VBQoAnHMQ8IDGygIFAM65GhAAjZUFfgCMsQ2CAo1/AlhrG0QFDP8EsNY2iAo0/gnAWtsgKtD8JwBrbYOoQPOfAKy1DaICrX8CsNY2iAq0/wnAWtsgKtD+JwBrbYOoQOefAKy1DaICvX8CsNY2iAoM/gnAWlsnKjD8J4C1tk5UYPhPAGttnajA6J8Ak+rffgMJkiRJ/pgXuKC5tZe9MvcAAAAASUVORK5CYII=';
  const icon = nativeImage.createFromDataURL(iconData);

  tray = new Tray(icon.resize({ width: 32, height: 32 }));
  tray.setToolTip('UruseeNotifier');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'うるせぇ！を送信',
      click: () => sendMessage()
    },
    { type: 'separator' },
    {
      label: '終了',
      click: () => app.quit()
    }
  ]);

  tray.setContextMenu(contextMenu);
  console.log('Tray icon created');
}

// アプリ起動
app.whenReady().then(() => {
  startServer();
  createTray();
  console.log('App started');
});

// 終了処理
app.on('before-quit', () => {
  if (wsClient) wsClient.close();
  if (serverProcess) serverProcess.kill();
  notificationWindows.forEach(win => {
    if (!win.isDestroyed()) win.close();
  });
});

app.on('window-all-closed', () => {
  // タスクトレイアプリなので終了しない
});
