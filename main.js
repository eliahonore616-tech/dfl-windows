const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

if (!app.requestSingleInstanceLock()) { app.quit(); }

const dataDir = () => path.join(app.getPath('userData'), 'dfl');
const safeName = n => path.basename(String(n || '')).replace(/[^\w.\-]/g, '_');

let win = null;
function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 900, minHeight: 600,
    backgroundColor: '#EEF4FF', title: 'DFL – Gestion des agents',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, 'index.html'));
  win.on('closed', () => { win = null; });
}

/* Base de données : un fichier sur le disque de l'ordinateur */
ipcMain.handle('dfl:read', async (_e, name) => {
  try { return await fs.promises.readFile(path.join(dataDir(), safeName(name)), 'utf8'); } catch (e) { return null; }
});
ipcMain.handle('dfl:write', async (_e, name, txt) => {
  await fs.promises.mkdir(dataDir(), { recursive: true });
  const f = path.join(dataDir(), safeName(name)), tmp = f + '.tmp';
  await fs.promises.writeFile(tmp, String(txt), 'utf8');
  await fs.promises.rename(tmp, f);
  return true;
});
ipcMain.handle('dfl:where', () => dataDir());
ipcMain.handle('dfl:open', async () => { await fs.promises.mkdir(dataDir(), { recursive: true }); return shell.openPath(dataDir()); });

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
