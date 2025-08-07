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
let youtubeVideoWindow = null;

ipcMain.handle('get-item', (event, key) => store.get(key));
ipcMain.handle('set-item', (event, key, value) => store.set(key, value));

ipcMain.handle('open-youtube-video', async (event, videoUrl) => {
  try {
    const urlToOpen = new URL(videoUrl);
    await shell.openExternal(urlToOpen.href);
    console.log(`Opened ${urlToOpen.href} in default browser.`);
  } catch (error) {
    console.error(`Failed to open URL: ${videoUrl}`, error);
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
    const wifi = await si.wifiConnections();
    if (wifi.length > 0) {
      return wifi[0]; // Return details of the first connected Wi-Fi network
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
    width: 600,
    height: 400,
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // Allow local file access and other permissions
      preload: path.join(__dirname, 'preload.js'), // Attach preload script
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