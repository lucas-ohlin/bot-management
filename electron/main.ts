import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { exec } from 'child_process'; 
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'fs'; 

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let win: BrowserWindow | null;

const DATA_FILE = path.join(app.getPath('userData'), './applications.json');
const SETTINGS_FILE = path.join(app.getPath('userData'), './settings.json');

function readApplications() {
  try {
    console.log(DATA_FILE);
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read data file:', error);
    return []; 
  }
}

function writeApplications(applications: any[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(applications, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write data file:', error);
  }
}

function readSettings() {
  try {
    console.log(SETTINGS_FILE);
    const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read settings file:', error);
    return {}; 
  }
}

function writeSettings(settings: any) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write settings file:', error);
  }
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    // frame: false,
    minWidth: 700, 
    minHeight: 500, 
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  // win.setMenu(null);

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date()).toLocaleString());
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Event Listeners
ipcMain.on('window-minimize', () => {
  win?.minimize();
});

ipcMain.on('window-maximize', () => {
  if (win?.isMaximized()) {
    win?.restore();
  } else {
    win?.maximize();
  }
});

ipcMain.on('window-close', () => {
  win?.close();
});

ipcMain.on('open-folder-dialog', (event) => {
  if (win) {
    dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    }).then(result => {
      if (!result.canceled && result.filePaths.length > 0) {
        console.log("Sending path to renderer:", result.filePaths[0]);
        event.reply('selected-directory', result.filePaths[0]);
      }
    }).catch(err => {
      console.error('Failed to open folder dialog:', err);
    });
  }
});

ipcMain.handle('read-applications', async () => {
  return readApplications();
});

ipcMain.on('write-applications', (event, applications) => {
  writeApplications(applications);
});

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile']
  });
  return result.filePaths;
});

ipcMain.on('open-ide', (event, idePath, botPath) => {
  exec(`"${idePath}" "${botPath}"`, (error) => {
    if (error) {
      console.error(`Error opening IDE: ${error.message}`);
    }
  });
});

ipcMain.handle('read-settings', async () => {
  return readSettings();
});

ipcMain.on('write-settings', (event, settings) => {
  writeSettings(settings);
});