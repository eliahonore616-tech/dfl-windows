/*
 * Gestion des agents DSFL — Copyright © 2026 Elia Kilu Honore. Tous droits réservés.
 * Logiciel propriétaire : copie, modification, diffusion et décompilation interdites
 * sans autorisation écrite de l'auteur. Voir LICENSE.txt.
 */
const { app, BrowserWindow, ipcMain, shell, Menu, dialog } = require('electron');
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
    icon: path.join(__dirname, process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  Menu.setApplicationMenu(null);
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https:\/\//i.test(url)) shell.openExternal(url); return { action: 'deny' }; });
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
/* Enregistrer la page affichée en PDF (A4 paysage, numéros de page) */
ipcMain.handle('dfl:pdf', async (_e, name) => {
  if (!win) return false;
  const r = await dialog.showSaveDialog(win, { defaultPath: safeName(name || 'document') + '.pdf', filters: [{ name: 'PDF', extensions: ['pdf'] }] });
  if (r.canceled || !r.filePath) return false;
  const buf = await win.webContents.printToPDF({
    landscape: true, pageSize: 'A4', printBackground: true, displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: '<div style="font-size:9px;width:100%;text-align:center;font-family:Arial,sans-serif;color:#444">Direction de Suivi des Finances Locales — Page <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    margins: { marginType: 'custom', top: 0.4, bottom: 0.6, left: 0.4, right: 0.4 }
  });
  await fs.promises.writeFile(r.filePath, buf);
  return true;
});
ipcMain.handle('dfl:where', () => dataDir());
ipcMain.handle('dfl:open', async () => { await fs.promises.mkdir(dataDir(), { recursive: true }); return shell.openPath(dataDir()); });

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
