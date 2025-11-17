const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage, dialog, shell } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const fs = require('fs');

let tray = null;
let settingsWindow = null;
let serverProcess = null;
let notificationWindows = [];
let connectionCount = 0;

// エラーログを書き込む関数
function writeErrorLog(error) {
  try {
    const logDir = app.getPath('userData');
    const logFile = path.join(logDir, 'error.log');
    const timestamp = new Date().toISOString();
    const logEntry = `\n[${timestamp}] ${error.stack || error.message || error}\n`;

    fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(logFile, logEntry, 'utf8');
    console.error('Error logged to:', logFile);
  } catch (logErr) {
    console.error('Failed to write error log:', logErr);
  }
}

// グローバルエラーハンドラー
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  writeErrorLog(error);

  dialog.showErrorBox(
    'UruseeNotifier - 予期しないエラー',
    `アプリケーションでエラーが発生しました:\n\n${error.message}\n\nログファイル: ${path.join(app.getPath('userData'), 'error.log')}`
  );
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  writeErrorLog(new Error(`Unhandled Rejection: ${reason}`));
});

// デフォルトアイコンを作成（Base64エンコードされたPNG）
function createDefaultIcon() {
  // 32x32の赤いアイコン（Base64エンコード）
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAE5SURBVFiF7Za9SgNBEMd/ZzYXiKJgYWNhYWFhYWFh4RNY+Qx+gI+QR/AFfAILCwsLCwsLCwsLCwsLC0FCCOTu5mwuCQlJ7u52N5L5w8Ltzv5mdnd2ZkDSpEmT/h1GVYGISBBFDeBIRNaq8v8LICIicQgXwJqIXFfl/xeAMfYIWAPaVfl/BzAW2gJrlfl/B7CwB6xX5v8dwBioU6l/AKSISGCA+sr8AwCc8xBwAA2VBQoAnHMQ8IDGygIFAM65GhAAjZUFfgCMsQ2CAo1/AlhrG0QFDP8EsNY2iAo0/gnAWtsgKtD8JwBrbYOoQPOfAKy1DaICrX8CsNY2iAq0/wnAWtsgKtD+JwBrbYOoQOefAKy1DaICvX8CsNY2iAoM/gnAWlsnKjD8J4C1tk5UYPhPAGttnajA6J8Ak+rffgMJkiRJ/pgXuKC5tZe9MvcAAAAASUVORK5CYII=';
}

// サーバープロセスを起動
function startServer() {
  const serverPath = path.join(__dirname, 'server.js');
  console.log('Starting server from:', serverPath);

  try {
    // サーバーファイルが存在するか確認
    if (!fs.existsSync(serverPath)) {
      throw new Error(`Server file not found: ${serverPath}`);
    }

    serverProcess = fork(serverPath);

    serverProcess.on('error', (err) => {
      console.error('Server error:', err);
      writeErrorLog(err);
    });

    serverProcess.on('exit', (code) => {
      console.log('Server exited with code:', code);
      if (code !== 0 && code !== null) {
        console.error('Server exited with error code:', code);
      }
    });

    console.log('Server started successfully');
  } catch (err) {
    console.error('Failed to start server:', err);
    writeErrorLog(err);

    // サーバー起動失敗は致命的ではないので、警告のみ表示
    dialog.showMessageBox({
      type: 'warning',
      title: 'UruseeNotifier - サーバー起動警告',
      message: 'WebSocketサーバーの起動に失敗しました',
      detail: `通知の送受信ができない可能性があります。\n\nエラー: ${err.message}`,
      buttons: ['OK']
    });
  }
}

// 設定ウィンドウを作成
function createSettingsWindow() {
  try {
    console.log('createSettingsWindow called');

    // 既存のウィンドウがある場合
    if (settingsWindow) {
      console.log('Settings window exists, checking if destroyed...');
      if (!settingsWindow.isDestroyed()) {
        console.log('Settings window is active, focusing...');
        settingsWindow.focus();
        return;
      } else {
        console.log('Settings window was destroyed, creating new one...');
        settingsWindow = null;
      }
    }

    console.log('Creating new settings window...');

    settingsWindow = new BrowserWindow({
      width: 500,
      height: 600,
      show: false,
      frame: true,
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    console.log('Settings window object created');

    // シンプルな設定画面HTML（外部依存なし）
    const settingsHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>UruseeNotifier</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Yu Gothic', 'Meiryo', sans-serif;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      color: white;
      padding: 30px;
      height: 100vh;
      overflow-y: auto;
    }
    h1 {
      color: #ff6b6b;
      margin-bottom: 20px;
      font-size: 28px;
      text-align: center;
    }
    .section {
      background: #2d2d2d;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    }
    .section h2 {
      color: #ff8787;
      font-size: 18px;
      margin-bottom: 15px;
      border-bottom: 2px solid #ff6b6b;
      padding-bottom: 10px;
    }
    button {
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      box-shadow: 0 4px 10px rgba(255, 107, 107, 0.3);
      transition: all 0.3s;
      width: 100%;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(255, 107, 107, 0.5);
    }
    .send-button {
      padding: 20px;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .status {
      text-align: center;
      padding: 15px;
      background: #1a1a1a;
      border-radius: 8px;
      font-size: 14px;
    }
    .status-online { color: #4caf50; }
    .status-offline { color: #ff6b6b; }
    .info {
      background: #1a1a1a;
      padding: 15px;
      border-radius: 8px;
      font-size: 12px;
      color: #aaa;
      line-height: 1.6;
    }
    .info p { margin-bottom: 8px; }
  </style>
</head>
<body>
  <h1>💢 UruseeNotifier</h1>

  <button class="send-button" onclick="sendMsg()">うるせぇ！を送信</button>

  <div class="section">
    <h2>接続状態</h2>
    <div class="status">
      <div id="status" class="status-offline">WebSocketサーバー: 接続中...</div>
    </div>
  </div>

  <div class="section">
    <h2>使い方</h2>
    <div class="info">
      <p>📍 タスクトレイのアイコンを右クリックでメニューを表示</p>
      <p>📍 上のボタンで匿名メッセージを送信</p>
      <p>📍 同じネットワーク内の他のユーザーに通知が届きます</p>
    </div>
  </div>

  <script>
    const WebSocket = require('ws');
    let ws = null;

    function connect() {
      try {
        ws = new WebSocket('ws://localhost:5555');
        ws.on('open', () => {
          document.getElementById('status').textContent = 'WebSocketサーバー: 接続成功 ✓';
          document.getElementById('status').className = 'status-online';
        });
        ws.on('close', () => {
          document.getElementById('status').textContent = 'WebSocketサーバー: 切断';
          document.getElementById('status').className = 'status-offline';
          setTimeout(connect, 3000);
        });
        ws.on('error', () => {
          document.getElementById('status').textContent = 'WebSocketサーバー: エラー';
          document.getElementById('status').className = 'status-offline';
        });
      } catch (e) {
        document.getElementById('status').textContent = 'WebSocketサーバー: 接続失敗';
        document.getElementById('status').className = 'status-offline';
      }
    }

    function sendMsg() {
      if (ws && ws.readyState === 1) {
        ws.send('うるせぇ！');
        alert('送信しました！');
      } else {
        alert('WebSocketサーバーに接続していません');
      }
    }

    connect();
  </script>
</body>
</html>`;

    console.log('Loading HTML content...');
    settingsWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(settingsHTML));

    settingsWindow.once('ready-to-show', () => {
      console.log('Settings window ready to show');
      settingsWindow.show();
    });

    settingsWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Settings window load failed:', errorCode, errorDescription);
    });

    settingsWindow.webContents.on('did-finish-load', () => {
      console.log('Settings window finished loading');
    });

    settingsWindow.on('closed', () => {
      console.log('Settings window closed by user');
      settingsWindow = null;
    });

    console.log('Settings window setup complete');

  } catch (error) {
    console.error('CRITICAL: Failed to create settings window:', error);
    writeErrorLog(error);

    // 確実にクリーンアップ
    if (settingsWindow) {
      try {
        if (!settingsWindow.isDestroyed()) {
          settingsWindow.destroy();
        }
      } catch (e) {
        console.error('Failed to destroy window:', e);
      }
      settingsWindow = null;
    }

    // ユーザーに通知
    setTimeout(() => {
      dialog.showMessageBox({
        type: 'error',
        title: 'エラー',
        message: '設定ウィンドウを開けませんでした',
        detail: error.message,
        buttons: ['OK']
      });
    }, 100);
  }
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

// コンテキストメニューを更新
function updateContextMenu() {
  if (!tray) {
    console.error('updateContextMenu: tray is null');
    return;
  }

  console.log('Updating context menu with connection count:', connectionCount);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `接続状態: ${connectionCount}人`,
      enabled: false
    },
    { type: 'separator' },
    {
      label: '設定',
      click: () => {
        console.log('Settings menu item clicked');
        createSettingsWindow();
      }
    },
    {
      label: 'ログを表示',
      click: () => {
        console.log('Log menu item clicked');
        // ログファイルを開く
        const logPath = path.join(app.getPath('userData'), 'error.log');
        if (fs.existsSync(logPath)) {
          shell.openPath(logPath);
        } else {
          dialog.showMessageBox({
            type: 'info',
            title: 'ログファイル',
            message: 'ログファイルがまだ作成されていません',
            buttons: ['OK']
          });
        }
      }
    },
    {
      label: 'メッセージを送信',
      click: () => {
        console.log('Send message menu item clicked');
        createSettingsWindow();
      }
    },
    { type: 'separator' },
    {
      label: 'アプリ情報',
      click: () => {
        dialog.showMessageBox({
          type: 'info',
          title: 'UruseeNotifier',
          message: 'UruseeNotifier v1.0.0',
          detail: `タスクトレイ常駐型通知アプリ\n\nApp Path: ${app.getAppPath()}\nUser Data: ${app.getPath('userData')}`,
          buttons: ['OK']
        });
      }
    },
    {
      label: '終了',
      click: () => {
        console.log('Quit menu item clicked');
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  console.log('Context menu updated successfully');
}

// タスクトレイアイコンを作成
function createTray() {
  try {
    let icon;
    const iconPath = path.join(__dirname, 'assets', 'icon.png');

    console.log('Checking for icon at:', iconPath);
    console.log('Icon exists:', fs.existsSync(iconPath));

    // アイコンファイルが存在するか確認
    if (fs.existsSync(iconPath)) {
      console.log('Using custom icon from:', iconPath);
      icon = nativeImage.createFromPath(iconPath);

      if (icon.isEmpty()) {
        console.warn('Custom icon is empty, using default icon');
        const dataURL = createDefaultIcon();
        icon = nativeImage.createFromDataURL(dataURL);
      } else {
        // アイコンをリサイズ（16x16または32x32に）
        icon = icon.resize({ width: 32, height: 32 });
      }
    } else {
      // デフォルトアイコンを作成
      console.log('Icon file not found at:', iconPath);
      console.log('Using default built-in icon');
      const dataURL = createDefaultIcon();
      icon = nativeImage.createFromDataURL(dataURL);
    }

    if (icon.isEmpty()) {
      throw new Error('Icon is empty! Cannot create tray without an icon.');
    } else {
      console.log('Icon created successfully. Size:', icon.getSize());
    }

    tray = new Tray(icon);
    console.log('Tray object created successfully');

    // コンテキストメニューを設定
    updateContextMenu();

    tray.setToolTip('UruseeNotifier - 右クリックでメニューを表示');

    // 左クリックで設定ウィンドウを開く
    tray.on('click', () => {
      console.log('Tray icon LEFT clicked');
      createSettingsWindow();
    });

    // ダブルクリックでも開く
    tray.on('double-click', () => {
      console.log('Tray icon DOUBLE clicked');
      createSettingsWindow();
    });

    // Windowsでは setContextMenu() が自動的に右クリックメニューを表示する
    // 明示的な right-click イベントハンドラーは不要（むしろ問題を引き起こす）

    console.log('Tray icon created successfully');
    console.log('Registered events: click, double-click');
    console.log('Context menu will be shown automatically on right-click');

  } catch (error) {
    console.error('Failed to create tray icon:', error);
    writeErrorLog(error);

    dialog.showErrorBox(
      'UruseeNotifier - トレイアイコン作成エラー',
      `トレイアイコンの作成に失敗しました:\n\n${error.message}\n\nログファイル: ${path.join(app.getPath('userData'), 'error.log')}`
    );

    throw error;
  }
}

// 接続状態を更新
ipcMain.on('update-connection-count', (event, count) => {
  connectionCount = count;
  updateContextMenu();
});

// 通知を受信した時の処理
ipcMain.on('show-notification', (event, message) => {
  createNotificationWindow(message);
});

// アプリを再起動
ipcMain.on('restart-app', () => {
  app.relaunch();
  app.exit();
});

// アプリケーション起動時の処理
app.whenReady().then(() => {
  try {
    console.log('='.repeat(60));
    console.log('UruseeNotifier starting...');
    console.log('App path:', app.getAppPath());
    console.log('User data path:', app.getPath('userData'));
    console.log('__dirname:', __dirname);
    console.log('='.repeat(60));

    // スタートアップ確認ダイアログを表示（デバッグ用）
    if (process.argv.includes('--debug')) {
      dialog.showMessageBox({
        type: 'info',
        title: 'UruseeNotifier',
        message: '起動中...',
        detail: `App Path: ${app.getAppPath()}\nUser Data: ${app.getPath('userData')}`,
        buttons: ['OK']
      });
    }

    startServer();

    console.log('Creating tray icon...');
    createTray();
    console.log('Tray icon created!');

    // Windowsではdockを非表示にする代わりに、ウィンドウを作成しない
    if (app.dock) {
      app.dock.hide();
    }

    console.log('UruseeNotifier started successfully!');

    // 起動成功を通知（初回起動のみ）
    const firstRunFile = path.join(app.getPath('userData'), 'first_run.txt');
    if (!fs.existsSync(firstRunFile)) {
      fs.writeFileSync(firstRunFile, new Date().toISOString(), 'utf8');

      // トレイアイコンが作成されたことを確認するダイアログ
      setTimeout(() => {
        dialog.showMessageBox({
          type: 'info',
          title: 'UruseeNotifier',
          message: '起動しました！',
          detail: 'タスクトレイのアイコンを右クリックして設定を開いてください。\n\n（このメッセージは初回起動時のみ表示されます）',
          buttons: ['OK']
        });
      }, 1000);
    }

  } catch (error) {
    console.error('Error during startup:', error);
    writeErrorLog(error);

    dialog.showErrorBox(
      'UruseeNotifier - 起動エラー',
      `アプリケーションの起動に失敗しました:\n\n${error.message}\n\nログファイル: ${path.join(app.getPath('userData'), 'error.log')}`
    );

    app.quit();
  }
}).catch((error) => {
  console.error('Failed to start app:', error);
  writeErrorLog(error);

  dialog.showErrorBox(
    'UruseeNotifier - 致命的エラー',
    `アプリケーションを起動できませんでした:\n\n${error.message}`
  );

  app.quit();
});

// すべてのウィンドウが閉じられた時の処理（タスクトレイアプリなので終了しない）
app.on('window-all-closed', () => {
  // タスクトレイアプリなので、何もしない（終了しない）
  console.log('All windows closed, but staying in tray');
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
