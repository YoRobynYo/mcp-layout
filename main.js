const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');
const si = require('systeminformation');
const StoreImport = require('electron-store');
const Store = StoreImport.default || StoreImport;
const store = new Store();
const url = require('url');

let monitorWindow = null;
let isCreatingMonitorWindow = false;
let youtubeWindow = null;
let aiWindow = null;

ipcMain.handle('get-item', (event, key) => store.get(key));
ipcMain.handle('set-item', (event, key, value) => store.set(key, value));

ipcMain.handle('open-youtube-video', async (event, videoUrl) => {
  console.log('�� Opening YouTube in 900x650 container...');
  
  if (youtubeWindow && !youtubeWindow.isDestroyed()) {
    youtubeWindow.focus();
    youtubeWindow.loadURL(videoUrl);
    return;
  }

  // 🎯 EVEN SMALLER: 300x200 for music
  youtubeWindow = new BrowserWindow({
    parent: BrowserWindow.getFocusedWindow(),
    modal: false,
    width: 300,        // 🎯 Much smaller for music
    height: 200,       // 🎯 Much smaller for music
    minWidth: 200,     // 🎯 Allow very small resizing
    minHeight: 150,    // 🎯 Allow very small resizing
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
  });

  // Set user agent to avoid 403 errors
  youtubeWindow.webContents.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  youtubeWindow.loadURL(videoUrl);
  
  youtubeWindow.once('ready-to-show', () => {
    youtubeWindow.show();
    console.log('🎉 YouTube container opened at 300x200!');
  });

  youtubeWindow.on('closed', () => {
    youtubeWindow = null;
    console.log('🔒 YouTube container closed');
  });
});

// Simple preset for a "coming soon" internal view (700x500), stays inside the app
ipcMain.handle('open-coming-soon', async () => {
  try {
    const targetFile = path.join(__dirname, 'mcp-layout', 'streamspace', 'waiting.html');
    const parent = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    const win = new BrowserWindow({
      parent,
      modal: false,
      width: 300,
      height: 300,
      minWidth: 200,
      minHeight: 200,
      title: 'Coming Soon',
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,
        allowRunningInsecureContent: true,
      },
    });

    win.webContents.setWindowOpenHandler(({ url: newUrl }) => {
      const child = new BrowserWindow({
        parent: win,
        modal: false,
        width: 270,
        height: 270,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: false,
          allowRunningInsecureContent: true,
        },
      });
      child.webContents.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      child.loadURL(newUrl);
      child.once('ready-to-show', () => child.show());
      return { action: 'deny' };
    });

    win.loadFile(targetFile);
    win.once('ready-to-show', () => win.show());
    return true;
  } catch (err) {
    console.error('open-coming-soon failed:', err);
    return false;
  }
});

// AI Companion: ensure window exists and is ready
async function ensureAIWindow() {
  const aiPath = path.join(__dirname, 'mcp-layout', 'ai-companion', 'index.html');
  const parent = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
  if (!aiWindow || aiWindow.isDestroyed()) {
    aiWindow = new BrowserWindow({
      parent,
      modal: false,
      width: 360,
      height: 520,
      minWidth: 320,
      minHeight: 420,
      title: 'AI Companion',
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: true,
      },
    });
    aiWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    await aiWindow.loadFile(aiPath);
    await new Promise((resolve) => aiWindow.once('ready-to-show', resolve));
    aiWindow.on('closed', () => { aiWindow = null; });
  }
  if (!aiWindow.isVisible()) aiWindow.show();
  aiWindow.focus();
  return aiWindow;
}

// AI Companion window (animated avatar + speech), opens at 400x400
ipcMain.handle('open-ai-companion', async (_event, text) => {
  try {
    const win = await ensureAIWindow();
    if (typeof text === 'string' && text.length > 0) {
      win.webContents.send('ai-companion-message', text);
    }
    return true;
  } catch (err) {
    console.error('open-ai-companion failed:', err);
    return false;
  }
});

// Send message to AI Companion (ensures window exists first)
ipcMain.handle('ai-companion-send', async (_event, text) => {
  try {
    const win = await ensureAIWindow();
    win.webContents.send('ai-companion-message', text || '');
    return true;
  } catch (e) {
    console.error('ai-companion-send failed:', e);
    return false;
  }
});

// Open AI Companion with an image and custom size (e.g., 736x1177)
ipcMain.handle('open-ai-companion-image', async (_event, payload) => {
  try {
    const { src, width = 736, height = 1177 } = payload || {};
    if (!src) throw new Error('open-ai-companion-image: missing src');
    const win = await ensureAIWindow();
    // Resize window to requested dimensions (with some sane limits)
    const clampedW = Math.max(300, Math.min(1400, Math.round(width)));
    const clampedH = Math.max(300, Math.min(1800, Math.round(height)));
    win.setMinimumSize(300, 300);
    win.setSize(clampedW, clampedH);
    win.webContents.send('ai-set-image', { src, width: clampedW, height: clampedH });
    return true;
  } catch (e) {
    console.error('open-ai-companion-image failed:', e);
    return false;
  }
});

// Generic content opener for LRBF faces (keeps everything inside the app)
ipcMain.handle('open-content', async (event, payload) => {
  try {
    const {
      kind = 'url',              // 'url' | 'file'
      target,                    // string URL or absolute/relative file path
      width = 800,
      height = 600,
      minWidth = 300,
      minHeight = 200,
      title = 'Content',
      reuseKey                   // optional key to reuse same window instance
    } = payload || {};

    // Optional reuse: store windows by key
    if (!global.__contentWindows) global.__contentWindows = {};
    if (reuseKey && global.__contentWindows[reuseKey] && !global.__contentWindows[reuseKey].isDestroyed()) {
      const win = global.__contentWindows[reuseKey];
      win.setSize(width, height);
      win.focus();
      if (kind === 'url') win.loadURL(target);
      else if (kind === 'file') win.loadFile(target);
      return true;
    }

    const parent = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    const win = new BrowserWindow({
      parent,
      modal: false,
      width,
      height,
      minWidth,
      minHeight,
      title,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,
        allowRunningInsecureContent: true,
      },
    });

    // Keep all window.open/_blank inside Electron as child windows
    win.webContents.setWindowOpenHandler(({ url: newUrl }) => {
      const child = new BrowserWindow({
        parent: win,
        modal: false,
        width: Math.round(width * 0.9),
        height: Math.round(height * 0.9),
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: false,
          allowRunningInsecureContent: true,
        },
      });
      child.webContents.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      child.loadURL(newUrl);
      child.once('ready-to-show', () => child.show());
      return { action: 'deny' };
    });

    // UA spoofing helps with some providers (e.g., YouTube)
    win.webContents.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    if (kind === 'url') win.loadURL(target);
    else if (kind === 'file') win.loadFile(target);

    win.once('ready-to-show', () => win.show());
    win.on('closed', () => {
      if (reuseKey && global.__contentWindows) delete global.__contentWindows[reuseKey];
    });

    if (reuseKey) global.__contentWindows[reuseKey] = win;
    return true;
  } catch (err) {
    console.error('open-content failed:', err);
    return false;
  }
});

ipcMain.handle('get-system-info', async () => {
  const cpuUsage = await getCpuUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const uptime = os.uptime();

  let netStats = { rx_sec: 0, tx_sec: 0 };
  try {
    const network = await si.networkStats();
    if (network.length > 0) {
      // Sum up all network interfaces
      netStats = network.reduce((acc, iface) => {
        acc.rx_sec += iface.rx_sec || 0;
        acc.tx_sec += iface.tx_sec || 0;
        return acc;
      }, { rx_sec: 0, tx_sec: 0 });
    }
  } catch (e) {
    console.error("Error getting network stats:", e);
  }

  let fsSize = { size: 0, used: 0 };
  try {
    const disks = await si.fsSize();
    if (disks.length > 0) {
      // For simplicity, sum up all disks or take the first one
      fsSize = disks.reduce((acc, disk) => {
        acc.size += disk.size || 0;
        acc.used += disk.used || 0;
        return acc;
      }, { size: 0, used: 0 });
    }
  } catch (e) {
    console.error("Error getting disk size:", e);
  }

  return {
    cpuUsage: cpuUsage,
    cpuLoad: os.loadavg()[0], // Add CPU load
    cpuTemp: 0, // CPU temp not available on macOS by default
    totalRam: totalMem,
    freeRam: freeMem,
    uptime: uptime,
    netRx: netStats.rx_sec,
    netTx: netStats.tx_sec,
    diskTotal: fsSize.size,
    diskUsed: fsSize.used
  };
});

ipcMain.handle('get-wifi-info', async () => {
  try {
    // Get WiFi connections
    const wifiConnections = await si.wifiConnections();
    
    // Get network interfaces for additional info
    const networkInterfaces = await si.networkInterfaces();
    
    // Get default gateway
    const defaultGateway = await si.networkGatewayDefault();
    
    if (wifiConnections.length > 0) {
      const wifi = wifiConnections[0];
      
      // Find the corresponding network interface
      const wifiInterface = networkInterfaces.find(iface => 
        iface.iface === wifi.iface || iface.iface === 'en0' || iface.iface === 'en1'
      );
      
      const result = {
        ssid: wifi.ssid || 'Unknown',
        signal: wifi.signalLevel || -50, // Signal strength in dBm
        ip: wifiInterface?.ip4 || 'Unknown', // IP from network interface
        mac: wifiInterface?.mac || 'Unknown', // MAC from network interface
        speed: wifi.txRate || 'Unknown', // Transmission rate in Mbps
        frequency: (wifi.frequency / 1000).toFixed(1) || '2.4', // Convert MHz to GHz
        security: Array.isArray(wifi.security) ? wifi.security.join(', ') : 'Unknown',
        gateway: defaultGateway || 'Unknown',
        dns: '8.8.8.8, 8.8.4.4', // Default DNS servers
        iface: wifi.iface || 'Unknown'
      };
      
      return result;
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error getting Wi-Fi info:", e);
    return null;
  }
});

ipcMain.handle('get-battery-info', async () => {
  try {
    const battery = await si.battery();
    return battery;
  } catch (e) {
    console.error("Error getting battery info:", e);
    return null;
  }
});

ipcMain.handle('open-system-monitor', () => {
  if (monitorWindow && !monitorWindow.isDestroyed()) {
    monitorWindow.focus();
    console.log('Main process: System Monitor window already open, focusing existing instance.');
    return;
  }

  if (isCreatingMonitorWindow) {
    console.log('Main process: System Monitor window creation already in progress.');
    return;
  }

  isCreatingMonitorWindow = true;
  console.log('Main process: Attempting to create System Monitor window.');
  monitorWindow = new BrowserWindow({
    parent: BrowserWindow.getFocusedWindow(), // 🎯 This makes it stay within the browser
    modal: false,
    width: 700,
    height: 500,
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // Allow local file access and other permissions
      // Removed preload script since contextIsolation is false
    },
  });

  const monitorPath = path.join(__dirname, 'mcp-layout', 'system-monitor', 'index.html');
  console.log('Main process: Loading System Monitor from path:', monitorPath);
  monitorWindow.loadFile(monitorPath);

  monitorWindow.once('ready-to-show', () => {
    monitorWindow.show();
    isCreatingMonitorWindow = false; // Reset flag when window is shown
    console.log('Main process: System Monitor window ready and shown.');
  });

  monitorWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`Main process: System Monitor window failed to load: ${errorDescription} (${errorCode}) for URL: ${validatedURL}`);
    isCreatingMonitorWindow = false; // Reset flag on load failure
  });

  monitorWindow.on('closed', () => {
    monitorWindow = null;
    isCreatingMonitorWindow = false; // Reset flag when window is closed
    console.log('Main process: System Monitor window closed, reference cleared.');
  });

  console.log('Main process: System Monitor window creation initiated.');
});

// Helper function to calculate CPU usage
let lastCpuInfo;
async function getCpuUsage() {
  return new Promise(resolve => {
    const cpus = os.cpus();
    let totalIdle = 0, totalTick = 0;

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    }

    if (lastCpuInfo) {
      const idleDifference = totalIdle - lastCpuInfo.totalIdle;
      const totalDifference = totalTick - lastCpuInfo.totalTick;
      const usage = 100 - ~~(100 * idleDifference / totalDifference);
      resolve(usage);
    } else {
      resolve(0); // First call, no previous data to compare
    }
    lastCpuInfo = { totalIdle, totalTick };
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'mcp-layout', 'index.html'));

  // Ensure links stay inside the app from the main window too
  mainWindow.webContents.setWindowOpenHandler(({ url: newUrl }) => {
    const child = new BrowserWindow({
      parent: mainWindow,
      modal: false,
      width: 900,
      height: 650,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,
        allowRunningInsecureContent: true,
      },
    });
    child.webContents.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    child.loadURL(newUrl);
    child.once('ready-to-show', () => child.show());
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});