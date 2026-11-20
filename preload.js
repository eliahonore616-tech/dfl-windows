/*
 * Gestion des agents DSFL — Copyright © 2026 DSFL. Tous droits réservés.
 * Logiciel propriétaire : copie, modification, diffusion et décompilation interdites
 * sans autorisation écrite de l'auteur. Voir LICENSE.txt.
 */
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('dflDesktop', {
  read: name => ipcRenderer.invoke('dfl:read', name),
  write: (name, txt) => ipcRenderer.invoke('dfl:write', name, txt),
  where: () => ipcRenderer.invoke('dfl:where'),
  open: () => ipcRenderer.invoke('dfl:open'),
  pdf: name => ipcRenderer.invoke('dfl:pdf', name)
});
