'use strict';
/**
 * preload.js
 *
 * Runs in a privileged context (Node access) but exposes only a narrow
 * safe surface to the Angular renderer via contextBridge.
 *
 * contextIsolation: true   (main.js)
 * nodeIntegration:  false  (main.js)
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Returns the dynamic backend port chosen by main.js.
   * Angular services call this via (window as any).electronAPI.getApiPort()
   */
  getApiPort: () => ipcRenderer.sendSync('get-api-port'),

  /**
   * Returns the application version from package.json
   */
  getAppVersion: () => ipcRenderer.sendSync('get-app-version'),

  /**
   * Sends log messages from the Angular renderer to the main process
   * so they can be written to the persistent log file.
   */
  logFromRenderer: (level, message) =>
    ipcRenderer.send('renderer-log', { level, message }),
});
