'use strict';
/**
 * main.js — Electron Main Process
 *
 * Responsibilities:
 *  1. Show a splash screen immediately on launch.
 *  2. Find a free TCP port dynamically.
 *  3. Locate the bundled JRE and Spring Boot JAR.
 *  4. Launch the Spring Boot backend with:
 *       -Dserver.port=<dynamicPort>
 *       -Dapp.data.dir=<userDataPath>
 *  5. Poll the backend until it is ready.
 *  6. Create a BrowserWindow and load the Angular frontend.
 *  7. Close the splash and show the main window once it's ready.
 *  8. Handle backend crashes and graceful shutdown.
 *  9. Respond to IPC queries from the preload script.
 */

const { app, BrowserWindow, dialog, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const net = require('net');
const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

// ── Logging ──────────────────────────────────────────────────────────────────
const log = require('electron-log');

function setupLogging(userDataPath) {
  const logDir = path.join(userDataPath, 'logs');
  fs.mkdirSync(logDir, { recursive: true });
  log.transports.file.resolvePathFn = () => path.join(logDir, 'electron.log');
  log.transports.file.level = 'debug';
  log.transports.console.level = 'debug';
  log.info('=== Thales ISRA Desktop Starting ===');
  log.info(`Electron version : ${process.versions.electron}`);
  log.info(`Node version     : ${process.versions.node}`);
  log.info(`Platform         : ${process.platform} ${process.arch}`);
  log.info(`userData path    : ${userDataPath}`);
}

// ── Dynamic Port ──────────────────────────────────────────────────────────────
function findFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

// ── Path Resolution ────────────────────────────────────────────────────────────
function resolveResourcePath(...segments) {
  if (app.isPackaged) {
    // In production: resources/ is next to the app.asar
    return path.join(process.resourcesPath, ...segments);
  }
  // In dev: resources are relative to the electron/ directory
  return path.join(__dirname, '..', ...segments);
}

function resolveJavaBinary() {
  const jreBase = resolveResourcePath('jre');
  const bin = process.platform === 'win32' ? 'java.exe' : 'java';

  // Temurin layout: jre/<version>/bin/java
  if (fs.existsSync(jreBase)) {
    const entries = fs.readdirSync(jreBase);
    for (const entry of entries) {
      const candidate = path.join(jreBase, entry, 'bin', bin);
      if (fs.existsSync(candidate)) {
        log.info(`Using bundled JRE: ${candidate}`);
        return candidate;
      }
    }
    // Flat layout fallback: jre/bin/java
    const flat = path.join(jreBase, 'bin', bin);
    if (fs.existsSync(flat)) return flat;
  }

  // Last resort — system Java
  log.warn('Bundled JRE not found; falling back to system java');
  return 'java';
}

function resolveJar() {
  let jar;
  if (app.isPackaged) {
    jar = resolveResourcePath('backend', 'security-risk-assessment-tool.jar');
  } else {
    // Dev: read straight from Maven's actual build output
    jar = path.join(__dirname, '..', 'backend', 'target', 'security-risk-assessment-tool.jar');
  }
  log.info(`Spring Boot JAR : ${jar}`);
  if (!fs.existsSync(jar)) {
    throw new Error(`Backend JAR not found at: ${jar}\nRun "cd backend && mvn clean package" first.`);
  }
  return jar;
}
function showAboutDialog() {
  dialog.showMessageBox({
    type: 'info',
    title: 'About Thales ISRA',
    message: 'Thales ISRA — Security Risk Assessment Tool',
    detail: `Version ${app.getVersion()}\n\nA desktop application for security risk assessment.`,
    buttons: ['OK'],
  });
}

function getUserGuidePath() {
  return resolveResourcePath('documents', 'ISRA_User_Guide.pdf');
}

async function showUserGuideSaveDialog() {
  const userGuidePath = getUserGuidePath();

  if (!fs.existsSync(userGuidePath)) {
    dialog.showErrorBox('User Guide Not Found', `Could not locate the user guide at:\n${userGuidePath}`);
    return;
  }

  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Save ISRA User Guide',
    defaultPath: path.join(app.getPath('downloads'), 'ISRA_User_Guide.pdf'),
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });

  if (canceled || !filePath) {
    return;
  }

  try {
    await fs.promises.copyFile(userGuidePath, filePath);
    const result = await shell.openPath(filePath);
    if (result) {
      log.warn(`Unable to open saved user guide: ${result}`);
    }
  } catch (err) {
    dialog.showErrorBox('Save Failed', `Could not save the user guide:\n${err.message}`);
  }
}

function setupAppMenu() {
  const template = [
    ...(process.platform === 'darwin'
      ? [{
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' },
          ],
        }]
      : []),
    {
      label: 'File',
      submenu: [process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' }],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(process.platform === 'darwin'
          ? [
              { role: 'pasteAndMatchStyle' },
              { role: 'delete' },
              { role: 'selectAll' },
              { type: 'separator' },
              {
                label: 'Speech',
                submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
              },
            ]
          : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: process.platform === 'darwin'
        ? [
            { role: 'minimize' },
            { role: 'zoom' },
            { type: 'separator' },
            { role: 'front' },
          ]
        : [
            { role: 'minimize' },
            { role: 'close' },
          ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'User Guide',
          click: showUserGuideSaveDialog,
        },
        { type: 'separator' },
        {
          label: 'About',
          click: showAboutDialog,
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
// ── Backend Process ────────────────────────────────────────────────────────────
let backendProcess = null;

function startBackend(port, userDataPath) {
  return new Promise((resolve, reject) => {
    const javaBin = resolveJavaBinary();
    const jar = resolveJar();
    const logDir = path.join(userDataPath, 'logs');
    fs.mkdirSync(logDir, { recursive: true });

    const jvmArgs = [
      `-Dserver.port=${port}`,
      `-Dapp.data.dir=${userDataPath}`,
      `-Djava.io.tmpdir=${path.join(userDataPath, 'tmp')}`,
      '-Xms128m',
      '-Xmx512m',
      '-jar', jar
    ];

    log.info(`Launching backend: ${javaBin} ${jvmArgs.join(' ')}`);

    backendProcess = spawn(javaBin, jvmArgs, {
      cwd: userDataPath,
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // Stream backend logs to file
    const backendLogStream = fs.createWriteStream(
      path.join(logDir, 'backend.log'), { flags: 'a' }
    );

    let started = false;
    const READY_SIGNAL = 'Started IsraBackendApplication';

    backendProcess.stdout.on('data', (data) => {
      const text = data.toString();
      backendLogStream.write(text);
      if (!started && text.includes(READY_SIGNAL)) {
        started = true;
        log.info(`Backend ready on port ${port}`);
        resolve(port);
      }
    });

    backendProcess.stderr.on('data', (data) => {
      const text = data.toString();
      backendLogStream.write(`[ERR] ${text}`);
      log.warn(`[Backend STDERR] ${text.trim()}`);
    });

    backendProcess.on('exit', (code, signal) => {
      log.warn(`Backend exited: code=${code} signal=${signal}`);
      backendLogStream.end();
      if (!started) {
        reject(new Error(`Backend process exited before becoming ready (code=${code})`));
      }
    });

    backendProcess.on('error', (err) => {
      log.error(`Failed to start backend: ${err.message}`);
      reject(err);
    });

    // Timeout safety net — if Spring Boot log line never fires, poll HTTP
    setTimeout(() => {
      if (!started) {
        log.info('Ready-signal timeout reached; switching to HTTP polling...');
        pollBackend(port, 60, 2000)
          .then(() => { started = true; resolve(port); })
          .catch(reject);
      }
    }, 45000);
  });
}

/** Poll GET /api/projects until the backend responds or we give up. */
function pollBackend(port, retries, delayMs) {
  return new Promise((resolve, reject) => {
    let remaining = retries;
    function attempt() {
      http.get(`http://127.0.0.1:${port}/api/projects`, (res) => {
        const ok = res.statusCode && res.statusCode >= 200 && res.statusCode < 300;
        res.resume(); // drain so the socket can close / be reused

        if (ok) {
          log.info(`Backend health check: HTTP ${res.statusCode}`);
          resolve();
          return;
        }

        remaining--;
        if (remaining <= 0) {
          reject(new Error(`Backend did not become available after ${retries} attempts.`));
        } else {
          setTimeout(attempt, delayMs);
        }
      }).on('error', () => {
        remaining--;
        if (remaining <= 0) {
          reject(new Error(`Backend did not become available after ${retries} attempts.`));
        } else {
          setTimeout(attempt, delayMs);
        }
      });
    }
    attempt();
  });
}

// ── Splash Window ──────────────────────────────────────────────────────────────
let splashWindow = null;

function createSplash() {
  splashWindow = new BrowserWindow({
    width: 480,
    height: 360,
    frame: false,
    resizable: false,
    movable: true,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    skipTaskbar: true,
    center: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  splashWindow.once('ready-to-show', () => splashWindow.show());
  splashWindow.on('closed', () => { splashWindow = null; });
}

function closeSplash() {
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.close();
    splashWindow = null;
  }
}

// ── BrowserWindow ──────────────────────────────────────────────────────────────
let mainWindow = null;

function createWindow(backendPort) {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Thales ISRA — Security Risk Assessment Tool',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // required for ipcRenderer in preload
    },
    backgroundColor: '#0f1117',
    show: false,
  });

  // Handle Angular HTML5 deep-link routing in production
  mainWindow.webContents.on('did-fail-load', (_event, _code, _desc, url) => {
    if (url.startsWith('file://') && !url.endsWith('index.html')) {
      const { hash } = new URL(url);
      mainWindow.loadFile(
        resolveResourcePath('frontend', 'index.html'),
        { hash: hash ? hash.replace(/^#/, '') : '/' }
      );
    }
  });

  // Swap splash for main window once Angular has actually rendered
  mainWindow.once('ready-to-show', () => {
    closeSplash();
    mainWindow.show();
  });

  if (app.isPackaged) {
    mainWindow.loadFile(resolveResourcePath('frontend', 'index.html'));
  } else {
    // Development: load from Angular dev server
    mainWindow.loadURL('http://localhost:4200');
    //mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ── State ──────────────────────────────────────────────────────────────────────
let dynamicPort = null;

// ── IPC Handlers ──────────────────────────────────────────────────────────────
ipcMain.on('get-api-port', (event) => {
  event.returnValue = dynamicPort;
});

ipcMain.on('get-app-version', (event) => {
  event.returnValue = app.getVersion();
});

ipcMain.on('renderer-log', (_event, { level, message }) => {
  log[level] ? log[level](`[Renderer] ${message}`) : log.info(`[Renderer] ${message}`);
});

// ── App Lifecycle ──────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  // Use app-specific sub-folder: SecurityRiskAssessmentTool
  const appDataPath = path.join(app.getPath('appData'), 'SecurityRiskAssessmentTool');
  fs.mkdirSync(path.join(appDataPath, 'tmp'), { recursive: true });

  setupLogging(appDataPath);
  setupAppMenu();

  // 0. Show splash immediately — before any backend work begins
  createSplash();

  // 1. Find a free port
  try {
    dynamicPort = await findFreePort();
    log.info(`Allocated dynamic port: ${dynamicPort}`);
  } catch (err) {
    log.error('Failed to find a free port:', err.message);
    closeSplash();
    dialog.showErrorBox('Startup Error', `Could not allocate a port:\n${err.message}`);
    app.quit();
    return;
  }

  // 2. Start Spring Boot
  try {
    await startBackend(dynamicPort, appDataPath);
  } catch (err) {
    log.error('Backend failed to start:', err.message);
    closeSplash();
    dialog.showErrorBox(
      'Backend Startup Failed',
      `The Spring Boot backend could not be started.\n\n${err.message}\n\nCheck logs at:\n${path.join(appDataPath, 'logs', 'backend.log')}`
    );
    app.quit();
    return;
  }

  // 3. Open browser window (splash closes itself on 'ready-to-show')
  createWindow(dynamicPort);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(dynamicPort);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  if (backendProcess && !backendProcess.killed) {
    log.info('Stopping backend process...');
    backendProcess.kill('SIGTERM');
    // Give it 3s then force-kill
    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        backendProcess.kill('SIGKILL');
      }
    }, 3000);
  }
  log.info('=== Thales ISRA Desktop Stopped ===');
});

// Handle unhandled promise rejections in main process
process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection in main process:', reason);
});