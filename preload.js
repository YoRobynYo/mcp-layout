const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getItem: (key) => ipcRenderer.invoke('get-item', key),
  setItem: (key, value) => ipcRenderer.invoke('set-item', key, value),
});