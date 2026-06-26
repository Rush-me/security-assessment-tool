'use strict';

const test = require('node:test');
const assert = require('node:assert');

test('Electron Preload Process - API Exposure', () => {
  let exposedName = '';
  let exposedApi = null;

  const mockElectron = {
    contextBridge: {
      exposeInMainWorld: (name, api) => {
        exposedName = name;
        exposedApi = api;
      }
    },
    ipcRenderer: {
      sendSync: (channel) => {
        if (channel === 'get-api-port') return 8080;
        if (channel === 'get-app-version') return '1.2.3';
      },
      send: () => {}
    }
  };

  const Module = require('module');
  const originalRequire = Module.prototype.require;
  Module.prototype.require = function(id) {
    if (id === 'electron') return mockElectron;
    return originalRequire.apply(this, arguments);
  };

  // Load the preload script
  require('./preload.js');

  assert.strictEqual(exposedName, 'electronAPI');
  assert.strictEqual(typeof exposedApi.getApiPort, 'function');
  assert.strictEqual(exposedApi.getApiPort(), 8080);
  assert.strictEqual(typeof exposedApi.getAppVersion, 'function');
  assert.strictEqual(exposedApi.getAppVersion(), '1.2.3');
  assert.strictEqual(typeof exposedApi.logFromRenderer, 'function');

  // Clean up cache after test
  Module.prototype.require = originalRequire;
  delete require.cache[require.resolve('./preload.js')];
});
