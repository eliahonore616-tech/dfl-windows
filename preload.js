const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('dflDesktop', {
  read: name => ipcRenderer.invoke('dfl:read', name),
  write: (name, txt) => ipcRenderer.invoke('dfl:write', name, txt),
  where: () => ipcRenderer.invoke('dfl:where'),
  open: () => ipcRenderer.invoke('dfl:open')
});
