// preload.js
const { contextBridge, ipcRenderer } = require('electron'); // Add ipcRenderer

// This function will now invoke the main process to get stats
async function getStats() {
  return ipcRenderer.invoke('get-system-stats');
}

contextBridge.exposeInMainWorld('api', {
  getStats
});