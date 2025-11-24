const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // Get primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Calendar widget size
  const calendarWidth = 300;
  const calendarHeight = 350;

  // Position in the top-right corner with some padding
  const x = width - calendarWidth - 20;
  const y = 20;

  mainWindow = new BrowserWindow({
    width: calendarWidth,
    height: calendarHeight,
    x: x,
    y: y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    // Windows 11 specific settings
    hasShadow: false,
    roundedCorners: true
  });

  // Set window to be click-through for the transparent areas
  mainWindow.setIgnoreMouseEvents(false);

  // Make window movable by dragging
  mainWindow.setMovable(true);

  mainWindow.loadFile('index.html');

  // Hide from Alt+Tab on Windows
  if (process.platform === 'win32') {
    mainWindow.setSkipTaskbar(true);
  }

  // Optional: Open DevTools for debugging
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
