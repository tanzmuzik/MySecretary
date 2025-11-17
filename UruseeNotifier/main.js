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
  // 32x32の赤いアイコン（Base64エンコード）
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAE5SURBVFiF7Za9SgNBEMd/ZzYXiKJgYWNhYWFhYWFh4RNY+Qx+gI+QR/AFfAILCwsLCwsLCwsLCwsLC0FCCOTu5mwuCQlJ7u52N5L5w8Ltzv5mdnd2ZkDSpEmT/h1GVYGISBBFDeBIRNaq8v8LICIicQgXwJqIXFfl/xeAMfYIWAPaVfl/BzAW2gJrlfl/B7CwB6xX5v8dwBioU6l/AKSISGCA+sr8AwCc8xBwAA2VBQoAnHMQ8IDGygIFAM65GhAAjZUFfgCMsQ2CAo1/AlhrG0QFDP8EsNY2iAo0/gnAWtsgKtD8JwBrbYOoQPOfAKy1DaICrX8CsNY2iAq0/wnAWtsgKtD+JwBrbYOoQOefAKy1DaICvX8CsNY2iAoM/gnAWlsnKjD8J4C1tk5UYPhPAGttnajA6J8Ak+rffgMJkiRJ/pgXuKC5tZe9MvcAAAAASUVORK5CYII=';
}

// サーバープロセスを起動
function startServer() {
  const serverPath = path.join(__dirname, 'server.js');
  console.log('Starting server from:', serverPath);

  try {
    serverProcess = fork(serverPath);
    serverProcess.on('error', (err) => {
      console.error('Server error:', err);
    });
    serverProcess.on('exit', (code) => {
      console.log('Server exited with code:', code);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
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

  // 開発者ツールを開く（デバッグモードのみ）
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--debug')) {
    settingsWindow.webContents.openDevTools();
  }

  // HTMLファイルを読み込む - パッケージ化後も動作するようにapp.getAppPath()を使用
  const appPath = app.getAppPath();
  const htmlPath = path.join(appPath, 'build', 'index.html');
  console.log('App path:', appPath);
  console.log('Loading HTML from:', htmlPath);
  console.log('File exists:', require('fs').existsSync(htmlPath));

  settingsWindow.loadFile(htmlPath).catch(err => {
    console.error('Failed to load HTML:', err);

    // 代替パスを試す
    const altPath = path.join(__dirname, 'build', 'index.html');
    console.log('Trying alternative path:', altPath);
    console.log('Alt file exists:', require('fs').existsSync(altPath));

    settingsWindow.loadFile(altPath).catch(err2 => {
      console.error('Alternative path also failed:', err2);

      // フォールバック：エラーメッセージを表示
      settingsWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Yu Gothic', 'Meiryo', sans-serif;
              padding: 40px;
              background: #1a1a1a;
              color: white;
            }
            h1 { color: #ff6b6b; }
            pre {
              background: #2d2d2d;
              padding: 20px;
              border-radius: 5px;
              overflow: auto;
              font-size: 12px;
            }
            button {
              padding: 10px 20px;
              background: #ff6b6b;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <h1>⚠️ エラー: UIファイルが見つかりません</h1>
          <p>アプリケーションファイルが正しくビルドされていない可能性があります。</p>
          <h3>試したパス:</h3>
          <pre>1. ${htmlPath}
2. ${altPath}

__dirname: ${__dirname}
app.getAppPath(): ${appPath}
process.resourcesPath: ${process.resourcesPath || 'N/A'}

エラー1: ${err.message}
エラー2: ${err2.message}</pre>
          <h3>解決方法:</h3>
          <ol>
            <li>アプリを完全にアンインストール</li>
            <li>最新版を再ダウンロード</li>
            <li>再インストール</li>
          </ol>
          <button onclick="require('electron').ipcRenderer.send('restart-app')">アプリを再起動</button>
        </body>
        </html>
      `)}`);
    });
  });

  settingsWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load page:', errorCode, errorDescription);
  });

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

  console.log('Checking for icon at:', iconPath);
  console.log('Icon exists:', fs.existsSync(iconPath));

  // アイコンファイルが存在するか確認
  if (fs.existsSync(iconPath)) {
    console.log('Using custom icon from:', iconPath);
    icon = nativeImage.createFromPath(iconPath);
    // アイコンをリサイズ（16x16または32x32に）
    icon = icon.resize({ width: 32, height: 32 });
  } else {
    // デフォルトアイコンを作成
    console.log('Icon file not found at:', iconPath);
    console.log('Using default built-in icon');
    const dataURL = createDefaultIcon();
    icon = nativeImage.createFromDataURL(dataURL);
  }

  if (icon.isEmpty()) {
    console.error('ERROR: Icon is empty! This will cause problems.');
  } else {
    console.log('Icon created successfully. Size:', icon.getSize());
  }

  try {
    tray = new Tray(icon);
    console.log('Tray object created successfully');
  } catch (err) {
    console.error('ERROR creating tray:', err);
    throw err;
  }

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

  tray.setToolTip('UruseeNotifier - クリックで設定を開く');
  tray.setContextMenu(contextMenu);

  // 左クリックで設定ウィンドウを開く（Windowsでは動作しないことがある）
  tray.on('click', () => {
    console.log('Tray icon LEFT clicked');
    createSettingsWindow();
  });

  // ダブルクリックでも開く
  tray.on('double-click', () => {
    console.log('Tray icon DOUBLE clicked');
    createSettingsWindow();
  });

  // 右クリックでもメニューを表示（Windows用）
  tray.on('right-click', () => {
    console.log('Tray icon RIGHT clicked');
    tray.popUpContextMenu();
  });

  console.log('Tray icon created successfully');
  console.log('Registered events: click, double-click, right-click');
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

// アプリを再起動
ipcMain.on('restart-app', () => {
  app.relaunch();
  app.exit();
});

// アプリケーション起動時の処理
app.whenReady().then(() => {
  console.log('='.repeat(60));
  console.log('UruseeNotifier starting...');
  console.log('App path:', app.getAppPath());
  console.log('User data path:', app.getPath('userData'));
  console.log('__dirname:', __dirname);
  console.log('='.repeat(60));

  startServer();
  createTray();

  // Windowsではdockを非表示にする代わりに、ウィンドウを作成しない
  if (app.dock) {
    app.dock.hide();
  }

  console.log('UruseeNotifier started successfully!');
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
