const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const fs = require('fs');

let tray = null;
let settingsWindow = null;
let serverProcess = null;
let notificationWindows = [];

// デフォルトアイコンを作成（Base64エンコードされたPNG）
function createDefaultIcon() {
  // 16x16の赤いアイコン（Base64エンコード）
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABvSURBVDiN7ZKxDYAwDAS/JRmBEViBNdgANmEeRmAFVvBjUKQIiYIUfOlky7rTyTYAVJXsHhGx+gMRQVXJ7gCklMjuqCpSSn0BIoKZ0RdgZhAR+gLMDCJCX4CIYGZ0BVQVZoaqkhUYY1BVsgLGGADwARdBJR+BKkKVAAAAAElFTkSuQmCC';
}

// サーバープロセスを起動
function startServer() {
  serverProcess = fork(path.join(__dirname, 'server.js'));
  serverProcess.on('error', (err) => {
    console.error('Server error:', err);
  });
}

// 設定ウィンドウを作成
function createSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 500,
    height: 600,
    show: false,
    frame: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 開発環境とプロダクション環境で異なるパスを読み込む
  if (process.env.NODE_ENV === 'development') {
    settingsWindow.loadURL('http://localhost:3000');
  } else {
    settingsWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
  }

  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

// 吹き出しウィンドウを作成
function createNotificationWindow(message) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // ランダムな位置を計算
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
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 吹き出し用のHTMLを作成
  const emojis = ['💢', '😤', '🔥', '⚡', '💥', '😠', '🗯️'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
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
          position: relative;
          text-align: center;
        }
        .bubble::after {
          content: '';
          position: absolute;
          bottom: -15px;
          left: 30px;
          width: 0;
          height: 0;
          border-left: 15px solid transparent;
          border-right: 15px solid transparent;
          border-top: 15px solid white;
        }
        .bubble::before {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 33px;
          width: 0;
          height: 0;
          border-left: 12px solid transparent;
          border-right: 12px solid transparent;
          border-top: 12px solid #ff8787;
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
    </html>
  `;

  notificationWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  notificationWindow.setIgnoreMouseEvents(true);

  notificationWindows.push(notificationWindow);

  // 3秒後に閉じる
  setTimeout(() => {
    if (!notificationWindow.isDestroyed()) {
      notificationWindow.close();
      notificationWindows = notificationWindows.filter(win => win !== notificationWindow);
    }
  }, 3000);
}

// タスクトレイアイコンを作成
function createTray() {
  let icon;
  const iconPath = path.join(__dirname, 'assets', 'icon.png');

  // アイコンファイルが存在するか確認
  if (fs.existsSync(iconPath)) {
    icon = nativeImage.createFromPath(iconPath);
  } else {
    // デフォルトアイコンを作成（16x16の赤い四角）
    console.log('Icon file not found, using default icon');
    const canvas = createDefaultIcon();
    icon = nativeImage.createFromDataURL(canvas);
  }

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '接続状態: 0人',
      enabled: false,
      id: 'connection-status'
    },
    { type: 'separator' },
    {
      label: '設定',
      click: () => {
        createSettingsWindow();
      }
    },
    {
      label: 'ログ',
      click: () => {
        // ログビューアを開く（設定ウィンドウ内で表示）
        createSettingsWindow();
      }
    },
    { type: 'separator' },
    {
      label: '終了',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('UruseeNotifier');
  tray.setContextMenu(contextMenu);

  // 左クリックで「うるせぇ！」を送信
  tray.on('click', () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.webContents.send('send-message', 'うるせぇ！');
    }
    // アイコンを一瞬光らせる（視覚フィードバック）
    tray.setTitle('📢');
    setTimeout(() => {
      tray.setTitle('');
    }, 300);
  });
}

// 接続状態を更新
ipcMain.on('update-connection-count', (event, count) => {
  if (tray) {
    const contextMenu = tray.getContextMenu();
    const item = contextMenu.getMenuItemById('connection-status');
    if (item) {
      item.label = `接続状態: ${count}人`;
    }
  }
});

// 通知を受信した時の処理
ipcMain.on('show-notification', (event, message) => {
  createNotificationWindow(message);
});

// アプリケーション起動時の処理
app.whenReady().then(() => {
  startServer();
  createTray();

  // Windowsではdockを非表示にする代わりに、ウィンドウを作成しない
  app.dock?.hide();
});

// すべてのウィンドウが閉じられた時の処理（タスクトレイアプリなので終了しない）
app.on('window-all-closed', (e) => {
  e.preventDefault();
});

// アプリケーション終了時の処理
app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

app.on('will-quit', () => {
  // すべての通知ウィンドウを閉じる
  notificationWindows.forEach(win => {
    if (!win.isDestroyed()) {
      win.close();
    }
  });
});
