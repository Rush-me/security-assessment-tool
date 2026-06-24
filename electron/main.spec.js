'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Electron Main Process - Lifecycle and IPC Mappings', async () => {
  const testUserDataPath = path.join(__dirname, 'mock-user-data');
  fs.mkdirSync(testUserDataPath, { recursive: true });

  const mockElectron = {
    app: {
      isPackaged: false,
      getPath: (name) => {
        if (name === 'appData') return testUserDataPath;
        return __dirname;
      },
      getVersion: () => '2.0.0',
      quit: () => {},
      on: () => {},
      whenReady: () => Promise.resolve()
    },
    BrowserWindow: class MockBrowserWindow {
      constructor() {
        this.webContents = {
          on: () => {},
          openDevTools: () => {}
        };
      }
      static getAllWindows() { return []; }
      isDestroyed() { return false; }
      loadFile() {}
      loadURL() {}
      once(event, cb) { if (event === 'ready-to-show') cb(); }
      on() {}
      show() {}
      close() {}
    },
    dialog: {
      showErrorBox: () => {}
    },
    ipcMain: {
      handlers: {},
      on: function(channel, cb) {
        this.handlers[channel] = cb;
      }
    }
  };

  const mockElectronLog = {
    transports: {
      file: { resolvePathFn: () => {} },
      console: {}
    },
    info: () => {},
    warn: () => {},
    error: () => {}
  };

  const Module = require('module');
  const originalRequire = Module.prototype.require;
  Module.prototype.require = function(id) {
    if (id === 'electron') return mockElectron;
    if (id === 'electron-log') return mockElectronLog;
    return originalRequire.apply(this, arguments);
  };

  // Load the script under test
  require('./main.js');

  // Verify IPC Event Registrations
  assert.ok(mockElectron.ipcMain.handlers['get-api-port'], 'get-api-port should be registered');
  assert.ok(mockElectron.ipcMain.handlers['get-app-version'], 'get-app-version should be registered');
  assert.ok(mockElectron.ipcMain.handlers['renderer-log'], 'renderer-log should be registered');

  // Clean up
  Module.prototype.require = originalRequire;
  delete require.cache[require.resolve('./main.js')];
  
  try {
    fs.rmSync(testUserDataPath, { recursive: true, force: true });
  } catch (e) {}
});
