import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'fs';
import pidusage from 'pidusage';

const require = createRequire(import.meta.url);
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let win: BrowserWindow | null;
let botProcess: ChildProcess | null = null;
let usageInterval: NodeJS.Timeout | null = null;

const DATA_FILE = path.join(app.getPath('userData'), './applications.json');
const SETTINGS_FILE = path.join(app.getPath('userData'), './settings.json');
const TOKENS_FILE = path.join(app.getPath('userData'), './tokens.json');
const BOT_STATS_FILE = path.join(app.getPath('userData'), './bot_stats.json');

interface Application {
  name: string;
  path: string;
}

interface Settings {
  selectedIDEPath: string;
}

interface Token {
  name: string;
  value: string;
  botPath: string;
}

interface BotStatistics {
  totalServers: number;
  totalMembers: number;
}

function readApplications(): Application[] {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read data file:', error);
    return [];
  }
}

function writeApplications(applications: Application[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(applications, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write data file:', error);
  }
}

function readSettings(): Settings {
  try {
    const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read settings file:', error);
    return { selectedIDEPath: '' };
  }
}

function writeSettings(settings: Settings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write settings file:', error);
  }
}

function readTokens(): Token[] {
  try {
    const data = fs.readFileSync(TOKENS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read tokens file:', error);
    return [];
  }
}

function writeTokens(updatedTokens: Token[]) {
  try {
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(updatedTokens, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write tokens file:', error);
  }
}

function readBotStatistics(botPath: string): BotStatistics | null {
  try {
    const data: Record<string, BotStatistics> = JSON.parse(fs.readFileSync(BOT_STATS_FILE, 'utf-8'));
    return data[botPath] || null;
  } catch (error) {
    console.error('Failed to read bot statistics file:', error);
    return null;
  }
}

function writeBotStatistics(botPath: string, stats: BotStatistics) {
  try {
    let data: Record<string, BotStatistics> = {};
    try {
      data = JSON.parse(fs.readFileSync(BOT_STATS_FILE, 'utf-8'));
    } catch (error) {
      console.error('Failed to read bot statistics file:', error);
    }
    data[botPath] = stats;
    fs.writeFileSync(BOT_STATS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write bot statistics file:', error);
  }
}

function deleteTokensByBotPath(botPath: string) {
  const allTokens = readTokens();
  const updatedTokens = allTokens.filter(token => token.botPath !== botPath);
  writeTokens(updatedTokens);
}

function deleteBotStatistics(botPath: string) {
  let data: Record<string, BotStatistics> = {};
  try {
    data = JSON.parse(fs.readFileSync(BOT_STATS_FILE, 'utf-8'));
  } catch (error) {
    console.error('Failed to read bot statistics file:', error);
  }
  delete data[botPath];
  fs.writeFileSync(BOT_STATS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

async function getBotStatistics(token: string): Promise<BotStatistics | false> {
  const client = new Client({
    intents: [
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
    ],
    partials: [
      Partials.Message,
      Partials.Channel,
      Partials.Reaction,
    ],
  });

  return new Promise((resolve) => {
    client.once('ready', async () => {
      try {
        console.log(`Logged in as ${client.user?.tag}`);

        const guilds = client.guilds.cache;
        const totalServers = guilds.size;

        let totalMembers = 0;
        for (const guild of guilds.values()) {
          console.log(`Fetching members for guild: ${guild.name}`);
          totalMembers += guild.memberCount;
        }

        console.log(`Total servers: ${totalServers}, Total members: ${totalMembers}`);

        client.destroy();
        resolve({ totalServers, totalMembers });
      } catch (error) {
        console.error('Error fetching guild data:', error);
        client.destroy();
        resolve(false); 
      }
    });

    client.login(token).catch((loginError: { message: any }) => {
      console.error('Error logging in:', loginError);
      client.destroy();
      resolve(false); 
    });
  });
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    minWidth: 700,
    minHeight: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

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

ipcMain.on('write-applications', (event, applications: Application[]) => {
  const currentApplications = readApplications();
  const currentPaths = currentApplications.map(app => app.path);
  const newPaths = applications.map(app => app.path);
  const removedPaths = currentPaths.filter(path => !newPaths.includes(path));

  removedPaths.forEach(path => {
    deleteTokensByBotPath(path);
    deleteBotStatistics(path);
  });

  writeApplications(applications);
});

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile']
  });
  return result.filePaths;
});

ipcMain.on('open-ide', (event, idePath, botPath) => {
  spawn(idePath, [botPath], { stdio: 'inherit' });
});

ipcMain.handle('read-settings', async () => {
  return readSettings();
});

ipcMain.on('write-settings', (event, settings) => {
  writeSettings(settings);
});

ipcMain.handle('read-tokens', async (event, botPath: string) => {
  const tokens = readTokens();
  return tokens.filter(token => token.botPath === botPath);
});

ipcMain.on('write-tokens', (event, newTokens: Token[]) => {
  const allTokens = readTokens();
  newTokens.forEach(newToken => {
    const existingIndex = allTokens.findIndex(token => token.name === newToken.name && token.botPath === newToken.botPath);
    if (existingIndex !== -1) {
      allTokens[existingIndex] = newToken;
    } else {
      allTokens.push(newToken);
    }
  });
  writeTokens(allTokens);
});

ipcMain.on('remove-token', (event, tokenToRemove: Token) => {
  const allTokens = readTokens();
  const updatedTokens = allTokens.filter(token => !(token.name === tokenToRemove.name && token.botPath === tokenToRemove.botPath));
  writeTokens(updatedTokens);
});

ipcMain.handle('bot-stats', async (event, token: string) => {
  try {
    console.log(token);
    const stats = await getBotStatistics(token);
    return stats;
  } catch (error) {
    console.error('Failed to get bot statistics:', error);
  }
});

ipcMain.handle('read-bot-stats', async (event, botPath: string) => {
  return readBotStatistics(botPath);
});

ipcMain.on('write-bot-stats', (event, botPath: string, stats: BotStatistics) => {
  writeBotStatistics(botPath, stats);
});

ipcMain.on('start-bot', (event, botPath, startCommand) => {
  if (botProcess) {
    botProcess.kill();
  }

  const [command, ...args] = startCommand.split(' ');

  botProcess = spawn(command, args, { cwd: botPath, stdio: ['pipe', 'pipe', 'pipe'] });

  botProcess?.stdout?.on('data', (data) => {
    event.sender.send('bot-log', data.toString());
  });

  botProcess?.stderr?.on('data', (data) => {
    event.sender.send('bot-log', data.toString());
  });

  botProcess?.on('close', (code) => {
    event.sender.send('bot-log', `Bot process exited with code ${code}`);
    botProcess = null;
    if (usageInterval) {
      clearInterval(usageInterval);
      usageInterval = null;
    }
  });

  event.sender.send('bot-log', `Bot started with PID ${botProcess?.pid}`);
  const startTime = Date.now(); 

  if (botProcess?.pid) {
    usageInterval = setInterval(() => {
      pidusage(botProcess?.pid as number)
        .then((stats) => {
          const uptime = ((Date.now() - (startTime || 0)) / 1000).toFixed(0);
          event.sender.send('bot-usage-update', { cpu: stats.cpu, memory: stats.memory / 1024 / 1024, uptime });
        })
        .catch((err) => {
          console.error('Failed to get bot usage stats:', err);
        });
    }, 2000);
  }
});

ipcMain.on('stop-bot', (event) => {
  if (botProcess) {
    botProcess.kill();
    botProcess = null;
    event.sender.send('bot-log', 'Bot process stopped.');
    event.sender.send('bot-usage-update', { cpu: 0, memory: 0, uptime: 0 });
    if (usageInterval) {
      clearInterval(usageInterval);
      usageInterval = null;
    }
  } else {
    event.sender.send('bot-log', 'No bot process is running.');
  }
});