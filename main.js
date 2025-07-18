const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const StoreImport = require('electron-store');
const Store = StoreImport.default || StoreImport;
const store = new Store();

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

app.whenReady().then(createWindow);

ipcMain.handle('get-item', (event, key) => store.get(key));
ipcMain.handle('set-item', (event, key, value) => store.set(key, value));

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
