'use strict';

const test = require('node:test');
const assert = require('node:assert');
const Module = require('module');
const EventEmitter = require('events');

test('scripts/download-jre.js - exit immediately if JRE already exists', async () => {
  const originalArgv = process.argv;
  const originalExit = process.exit;

  process.argv = ['node', 'download-jre.js'];

  let exitCode = null;
  process.exit = (code) => {
    exitCode = code;
    throw new Error(`Process exited with ${code}`);
  };

  const mockFs = {
    existsSync: (path) => {
      if (path.includes('jre')) return true;
      return false;
    },
    readdirSync: (path) => {
      if (path.includes('jre')) return ['bin', 'lib'];
      return [];
    }
  };

  const originalRequire = Module.prototype.require;
  Module.prototype.require = function (id) {
    if (id === 'fs') return mockFs;
    return originalRequire.apply(this, arguments);
  };

  try {
    delete require.cache[require.resolve('./download-jre.js')];
    require('./download-jre.js');
  } catch (err) {
    // Expected throw
  } finally {
    process.argv = originalArgv;
    process.exit = originalExit;
    Module.prototype.require = originalRequire;
  }

  assert.strictEqual(exitCode, 0, 'should exit with code 0 since JRE already exists');
});

test('scripts/download-jre.js - full download and extraction pipeline', async () => {
  const originalArgv = process.argv;
  const originalExit = process.exit;

  process.argv = ['node', 'download-jre.js', '--platform', 'win32', '--arch', 'x64'];

  let exitCode = null;
  process.exit = (code) => {
    exitCode = code;
    throw new Error(`Process exited with ${code}`);
  };

  const mockFs = {
    existsSync: () => false,
    readdirSync: () => ['extracted_files'],
    mkdirSync: () => {},
    createWriteStream: () => {
      const stream = new EventEmitter();
      stream.close = () => {};
      return stream;
    },
    unlinkSync: () => {}
  };

  const mockHttps = {
    get: (url, opts, cb) => {
      const callback = typeof opts === 'function' ? opts : cb;
      const res = new EventEmitter();
      res.statusCode = 200;
      res.headers = { 'content-length': '100' };
      res.pipe = (dest) => {
        // Emit data and then finish writing to the mocked writeStream
        process.nextTick(() => {
          res.emit('data', Buffer.from('chunk'));
          process.nextTick(() => {
            dest.emit('finish');
          });
        });
      };
      process.nextTick(() => {
        callback(res);
      });
      return new EventEmitter();
    }
  };

  let execSyncCmd = null;
  const mockChildProcess = {
    execSync: (cmd) => {
      execSyncCmd = cmd;
    }
  };

  const originalRequire = Module.prototype.require;
  Module.prototype.require = function (id) {
    if (id === 'fs') return mockFs;
    if (id === 'https') return mockHttps;
    if (id === 'child_process') return mockChildProcess;
    return originalRequire.apply(this, arguments);
  };

  try {
    delete require.cache[require.resolve('./download-jre.js')];
    require('./download-jre.js');
    
    // Wait for async task inside the script to run
    await new Promise(resolve => setTimeout(resolve, 50));
  } catch (err) {
    // Expect complete execution
  } finally {
    process.argv = originalArgv;
    process.exit = originalExit;
    Module.prototype.require = originalRequire;
  }

  assert.ok(execSyncCmd, 'execSync should be called to extract JRE');
  assert.ok(execSyncCmd.includes('unzip'), 'should run unzip command for win32 zip archive');
});
