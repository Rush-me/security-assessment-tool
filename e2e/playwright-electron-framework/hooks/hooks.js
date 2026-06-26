const path = require("path");
const fs = require("fs");
const http = require("http");
const {
  BeforeAll,
  AfterAll,
  Before,
  After,
  Status,
  setDefaultTimeout
} = require("@cucumber/cucumber");
const env = require("../config/env");
const ElectronWindowManager = require("../electron/ElectronWindowManager");
const ElectronAppManager = require("../electron/ElectronAppManager");
const SelfHealingUtils = require("../utils/SelfHealingUtils");

setDefaultTimeout(Number(process.env.STEP_TIMEOUT || 90000));

/** POST JSON to a URL, resolve with response body string. */
function httpPost(url, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const opts = new URL(url);
    const req = http.request(
      { hostname: opts.hostname, port: Number(opts.port), path: opts.pathname,
        method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } },
      (res) => { let data = ""; res.on("data", c => { data += c; }); res.on("end", () => resolve(data)); }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

BeforeAll(async function () {
  const app = await ElectronAppManager.launch();
  const page = await ElectronWindowManager.discoverMainWindow(app);
  global.__electronApp = app;
  global.__mainWindow = page;

  // Discover dynamic backend port from Electron preload
  try {
    const port = await page.evaluate(() => {
      return window.electronAPI && typeof window.electronAPI.getApiPort === "function"
        ? window.electronAPI.getApiPort()
        : null;
    });
    if (port) {
      env.backendBaseUrl = `http://127.0.0.1:${port}`;
      global.__backendPort = port;
    }
  } catch (_e) { /* fallback to env default */ }

  // Register test user (ignore conflict if already exists)
  const baseUrl = env.backendBaseUrl;
  try {
    await httpPost(`${baseUrl}/api/auth/register`, {
      username: "testuser",
      email: "testuser@isra.test",
      password: "TestPass123!"
    });
  } catch (_e) { /* user may already exist */ }
});

Before(async function () {
  let electronApp = global.__electronApp || (await ElectronAppManager.launch());
  let page;

  try {
    page = await ElectronWindowManager.recoverWithRetry(electronApp, 1);
  } catch (_err) {
    electronApp = await ElectronAppManager.restart();
    ElectronWindowManager.reset();
    page = await ElectronWindowManager.recoverWithRetry(electronApp, 2);
    global.__electronApp = electronApp;
  }

  await page.setViewportSize({ width: 1600, height: 1000 });
  this.bindElectron(electronApp, page);
  this.healing = new SelfHealingUtils(page);
});

After(async function ({ pickle, result }) {
  if (result && result.status === Status.FAILED) {
    const safeName = pickle.name.replace(/[^a-zA-Z0-9-_]/g, "_");
    const ts = Date.now();
    const shot = path.join(env.screenshotDir, `${safeName}-${ts}.png`);
    const tracePath = path.join(env.traceDir, `${safeName}-${ts}.zip`);

    fs.mkdirSync(env.screenshotDir, { recursive: true });
    fs.mkdirSync(env.traceDir, { recursive: true });

    if (this.page) {
      await this.page.screenshot({ path: shot, fullPage: true });
      this.attach(`Screenshot: ${shot}`);
      this.attach(`Trace placeholder: ${tracePath}`);
    }
  }
});

AfterAll(async function () {
  try {
    await ElectronAppManager.close();
  } catch (_err) {
    // Ignore teardown instability so functional scenario outcome is preserved.
  }
});
