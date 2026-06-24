'use strict';

const test = require('node:test');
const assert = require('node:assert');
const Module = require('module');

test('scripts/build.js - dev mode workflow', async () => {
  const originalArgv = process.argv;
  const originalExit = process.exit;

  // Set up process.argv for dev mode
  process.argv = ['node', 'build.js', '--dev'];

  let exitCode = null;
  process.exit = (code) => {
    exitCode = code;
  };

  let spawnCalled = false;
  let spawnCmd = null;
  let spawnArgs = null;

  const mockChildProcess = {
    execSync: () => {},
    spawn: (cmd, args, opts) => {
      spawnCalled = true;
      spawnCmd = cmd;
      spawnArgs = args;
      return {
        on: (event, cb) => {
          if (event === 'exit') {
            process.nextTick(() => cb(0));
          }
        }
      };
    }
  };

  // Mock require('electron') to prevent resolution errors
  const mockElectronPath = 'mock-electron-path';

  const originalRequire = Module.prototype.require;
  Module.prototype.require = function (id) {
    if (id === 'child_process') return mockChildProcess;
    if (id === 'electron') return mockElectronPath;
    return originalRequire.apply(this, arguments);
  };

  try {
    // Clear build.js cache and load it to run the script
    delete require.cache[require.resolve('./build.js')];
    require('./build.js');
    // Wait for the async IIFE to execute fully with our mocks in place
    await new Promise(resolve => setTimeout(resolve, 50));
  } catch (err) {
    // Fallback catch
  } finally {
    // Restore
    process.argv = originalArgv;
    process.exit = originalExit;
    Module.prototype.require = originalRequire;
  }

  assert.ok(spawnCalled, 'spawn should be called in dev mode');
  assert.strictEqual(spawnCmd, 'mock-electron-path', 'should launch the mocked electron');
  assert.deepStrictEqual(spawnArgs, ['.'], 'should run electron with "."');
  assert.strictEqual(exitCode, 0, 'should exit with code 0 on dev termination');
});

test('scripts/build.js - prod mode pipeline', async () => {
  const originalArgv = process.argv;
  const originalExit = process.exit;

  // Set up process.argv for prod mode
  process.argv = ['node', 'build.js', '--prod'];

  let exitCode = null;
  process.exit = (code) => {
    exitCode = code;
  };

  const executedCommands = [];
  const mockChildProcess = {
    execSync: (cmd) => {
      executedCommands.push(cmd);
    },
    spawn: () => {
      throw new Error('spawn should not be called in prod mode');
    }
  };

  const originalRequire = Module.prototype.require;
  Module.prototype.require = function (id) {
    if (id === 'child_process') return mockChildProcess;
    return originalRequire.apply(this, arguments);
  };

  try {
    delete require.cache[require.resolve('./build.js')];
    require('./build.js');
    // Wait for the async IIFE to execute fully with our mocks in place
    await new Promise(resolve => setTimeout(resolve, 50));
  } catch (err) {
    // Fallback catch
  } finally {
    process.argv = originalArgv;
    process.exit = originalExit;
    Module.prototype.require = originalRequire;
  }

  // Expecting 4 main build steps executed with execSync:
  // 1. npm run build:electron
  // 2. mvn clean package -DskipTests
  // 3. node scripts/download-jre.js
  // 4. npx electron-builder
  assert.ok(executedCommands.some(c => c.includes('npm run build:electron')), 'should build frontend');
  assert.ok(executedCommands.some(c => c.includes('mvn clean package')), 'should build backend');
  assert.ok(executedCommands.some(c => c.includes('node scripts/download-jre.js')), 'should download jre');
  assert.ok(executedCommands.some(c => c.includes('npx electron-builder')), 'should pack production release');
});

test('scripts/build.js - failure on no mode specified', async () => {
  const originalArgv = process.argv;
  const originalExit = process.exit;

  process.argv = ['node', 'build.js']; // no --dev or --prod

  let exitCode = null;
  process.exit = (code) => {
    exitCode = code;
  };

  const mockChildProcess = {
    execSync: () => {},
    spawn: () => {}
  };

  const originalRequire = Module.prototype.require;
  Module.prototype.require = function (id) {
    if (id === 'child_process') return mockChildProcess;
    return originalRequire.apply(this, arguments);
  };

  try {
    delete require.cache[require.resolve('./build.js')];
    require('./build.js');
    // Wait for the async IIFE to execute fully with our mocks in place
    await new Promise(resolve => setTimeout(resolve, 50));
  } catch (err) {
    // Fallback catch
  } finally {
    process.argv = originalArgv;
    process.exit = originalExit;
    Module.prototype.require = originalRequire;
  }

  assert.strictEqual(exitCode, 1, 'should exit with code 1 if no mode specified');
});
