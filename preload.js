const { contextBridge, ipcRenderer } = require('electron');

// Conditionally expose APIs based on contextIsolation
// For windows with contextIsolation: true (like the main window)
if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electronAPI', {
    getItem: (key) => ipcRenderer.invoke('get-item', key),
    setItem: (key, value) => ipcRenderer.invoke('set-item', key, value),
    openYoutubeVideo: (videoUrl) => ipcRenderer.invoke('open-youtube-video', videoUrl),
    openContent: (payload) => ipcRenderer.invoke('open-content', payload),
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
    openSystemMonitor: () => ipcRenderer.invoke('open-system-monitor'),
    openComingSoon: () => ipcRenderer.invoke('open-coming-soon'),
    openAICompanion: (text) => ipcRenderer.invoke('open-ai-companion', text),
    aiSend: (text) => ipcRenderer.invoke('ai-companion-send', text),
    openAICompanionImage: (payload) => ipcRenderer.invoke('open-ai-companion-image', payload),
    downloadYouTubeVideo: (url, outputPath) => ipcRenderer.invoke('download-youtube-video', url, outputPath),
  });
} else {
  // For windows with contextIsolation: false (like the System Monitor window)
  window.electronAPI = {
    getItem: (key) => ipcRenderer.invoke('get-item', key),
    setItem: (key, value) => ipcRenderer.invoke('set-item', key, value),
    openYoutubeVideo: (videoUrl) => ipcRenderer.invoke('open-youtube-video', videoUrl),
    openContent: (payload) => ipcRenderer.invoke('open-content', payload),
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
    openSystemMonitor: () => ipcRenderer.invoke('open-system-monitor'),
    openComingSoon: () => ipcRenderer.invoke('open-coming-soon'),
    openAICompanion: (text) => ipcRenderer.invoke('open-ai-companion', text),
    aiSend: (text) => ipcRenderer.invoke('ai-companion-send', text),
    openAICompanionImage: (payload) => ipcRenderer.invoke('open-ai-companion-image', payload),
    downloadYouTubeVideo: (url, outputPath) => ipcRenderer.invoke('download-youtube-video', url, outputPath),
  };
}