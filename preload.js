const { contextBridge, ipcRenderer } = require('electron');

// Conditionally expose APIs based on contextIsolation
// For windows with contextIsolation: true (like the main window)
if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electronAPI', {
    getItem: (key) => ipcRenderer.invoke('get-item', key),
    setItem: (key, value) => ipcRenderer.invoke('set-item', key, value),
    openYoutubeVideo: (videoUrl) => ipcRenderer.invoke('open-youtube-video', videoUrl),
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
    openSystemMonitor: () => ipcRenderer.invoke('open-system-monitor'),
  });
} else {
  // For windows with contextIsolation: false (like the System Monitor window)
  window.electronAPI = {
    getItem: (key) => ipcRenderer.invoke('get-item', key),
    setItem: (key, value) => ipcRenderer.invoke('set-item', key, value),
    openYoutubeVideo: (videoUrl) => ipcRenderer.invoke('open-youtube-video', videoUrl),
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
    openSystemMonitor: () => ipcRenderer.invoke('open-system-monitor'),
  };
}