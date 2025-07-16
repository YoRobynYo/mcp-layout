// // main.js
// const { app, BrowserWindow, ipcMain } = require('electron');
// const path = require('path');
// const si = require('systeminformation'); // Keep systeminformation for CPU

// function createWindow() {
//   const win = new BrowserWindow({
//     width: 1200,
//     height: 900,
//     webPreferences: {
//       preload: path.join(__dirname, 'ai-dashboard-mcp', 'src/js/preload.js'),
//       contextIsolation: true,
//       nodeIntegration: false
//     }
//   });

//   console.log('Loading file:', path.join(__dirname, 'ai-dashboard-mcp', 'index.html'));
//   win.loadFile('ai-dashboard-mcp/index.html');

//   // IPC: Handle request from renderer to get system stats
//   ipcMain.handle('get-system-stats', async () => {
//     let cpu = 0;
//     let fan = 0;

//     try {
//       const cpuLoad = await si.currentLoad();
//       cpu = cpuLoad.currentLoad; // This is a percentage from 0-100
//     } catch (error) {
//       console.error('Main Process: Error getting CPU load with systeminformation:', error);
//       cpu = 0; // Default to 0 if CPU fails
//     }

//     // --- Even Calmer Fan Simulation ---
//     const minFanRpm = 1000;  // Increased minimum RPM
//     const maxFanRpm = 1500; // Decreased maximum RPM (very narrow range)
//     const cpuInfluence = 0.1; // Drastically reduced CPU influence (almost static base)
//     const randomNoise = 0.01;  // Almost no random variation

//     // Calculate base fan speed based on CPU load
//     let baseFan = minFanRpm + (cpu / 100) * (maxFanRpm - minFanRpm) * cpuInfluence;

//     // Add some very slow, subtle random noise
//     // Increased divisor for Math.sin for extremely slow oscillation
//     const timeBasedNoise = Math.sin(Date.now() / 5000) * (maxFanRpm - minFanRpm) * randomNoise; // Much slower oscillation and tiny magnitude

//     let simulatedFan = baseFan + timeBasedNoise;

//     // Ensure fan speed stays within the defined min/max range
//     simulatedFan = Math.max(minFanRpm, Math.min(maxFanRpm, simulatedFan));

//     fan = Math.round(simulatedFan); // Round to integer RPM

//     console.log('Main Process: Fetched CPU:', cpu, 'Simulated Fan:', fan);
//     return { cpu, fan };
//   });
// }

// app.whenReady().then(createWindow);

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') app.quit();
// });

// app.on('activate', () => {
//   if (BrowserWindow.getAllWindows().length === 0) createWindow();
// });

const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'mcp-layout', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});