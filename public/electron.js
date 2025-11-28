const { app, BrowserWindow, Menu, Tray, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const express = require('express');
const cors = require('cors');
const { Client } = require('@notionhq/client');
require('dotenv').config();

let mainWindow;
let tray;
const apiServer = express();

// Electron App setup
app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Create tray icon
  createTray();

  // Start Express backend server
  startBackendServer();
}

function createTray() {
  const trayIcon = path.join(__dirname, 'assets/icon.png');
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Hide',
      click: () => {
        mainWindow.hide();
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

function startBackendServer() {
  apiServer.use(cors());
  apiServer.use(express.json());

  // Initialize Notion client
  const notion = new Client({
    auth: process.env.NOTION_API_KEY
  });

  // Task endpoints
  apiServer.get('/api/tasks', async (req, res) => {
    try {
      const response = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID
      });

      const tasks = response.results.map(page => ({
        id: page.id,
        title: page.properties.Title?.title[0]?.plain_text || '',
        status: page.properties.Status?.status?.name || 'Not started',
        priority: page.properties.Priority?.select?.name || 'Normal',
        dueDate: page.properties['Due Date']?.date?.start || null
      }));

      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });

  apiServer.post('/api/tasks', async (req, res) => {
    try {
      const { title, status, priority, dueDate } = req.body;

      const response = await notion.pages.create({
        parent: {
          database_id: process.env.NOTION_DATABASE_ID
        },
        properties: {
          Title: {
            title: [
              {
                text: {
                  content: title
                }
              }
            ]
          },
          Status: {
            status: {
              name: status || 'Not started'
            }
          },
          Priority: {
            select: {
              name: priority || 'Normal'
            }
          },
          'Due Date': {
            date: {
              start: dueDate || null
            }
          }
        }
      });

      res.json({ id: response.id, title });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  apiServer.put('/api/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, status, priority, dueDate } = req.body;

      await notion.pages.update({
        page_id: id,
        properties: {
          Title: {
            title: [
              {
                text: {
                  content: title
                }
              }
            ]
          },
          Status: {
            status: {
              name: status
            }
          },
          Priority: {
            select: {
              name: priority
            }
          },
          'Due Date': {
            date: {
              start: dueDate || null
            }
          }
        }
      });

      res.json({ id, title });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  });

  apiServer.delete('/api/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;

      await notion.pages.update({
        page_id: id,
        archived: true
      });

      res.json({ id });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  });

  // Health check
  apiServer.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  const PORT = process.env.BACKEND_PORT || 3001;
  apiServer.listen(PORT, () => {
    console.log(`MySecretary Backend running on port ${PORT}`);
  });
}

// IPC handlers for renderer process communication
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
