class ElectronWindowManager {
  constructor() {
    this.mainWindow = null;
    this.currentWindow = null;
  }

  async discoverMainWindow(electronApp) {
    if (!this.mainWindow) {
      // The app creates a splash window first, then the main app window.
      // Wait for a window whose URL is NOT the splash screen.
      let attempts = 0;
      const maxAttempts = 60; // 120s total
      while (attempts < maxAttempts) {
        const windows = electronApp.windows();
        for (const win of windows) {
          try {
            const url = win.url();
            if (!url.includes("splash.html") && url !== "about:blank" && url !== "") {
              await win.waitForLoadState("domcontentloaded", { timeout: 60000 });
              this.mainWindow = win;
              this.currentWindow = win;
              return this.mainWindow;
            }
          } catch (_e) {
            // Window may have closed, continue
          }
        }
        await new Promise((r) => setTimeout(r, 2000));
        attempts++;
      }
      // Final fallback: return whatever first window exists
      this.mainWindow = await electronApp.firstWindow({ timeout: 30000 });
      await this.mainWindow.waitForLoadState("domcontentloaded", { timeout: 60000 });
      this.currentWindow = this.mainWindow;
    }
    return this.mainWindow;
  }

  async waitForWindow(electronApp, predicate, timeout = 20000) {
    const page = await electronApp.waitForEvent("window", {
      predicate,
      timeout
    });
    await page.waitForLoadState("domcontentloaded");
    return page;
  }

  async switchTo(page) {
    this.currentWindow = page;
    return this.currentWindow;
  }

  async recoverLostWindow(electronApp) {
    const windows = electronApp.windows();
    if (windows.length > 0) {
      // Prefer the main app window over the splash screen
      for (const win of windows) {
        try {
          const url = win.url();
          if (!url.includes("splash.html") && url !== "about:blank" && url !== "") {
            this.currentWindow = win;
            if (!this.mainWindow) this.mainWindow = win;
            return this.currentWindow;
          }
        } catch (_e) { /* continue */ }
      }
      // Fallback to first available window
      this.currentWindow = windows[0];
      if (!this.mainWindow) this.mainWindow = windows[0];
      return this.currentWindow;
    }
    return this.discoverMainWindow(electronApp);
  }

  async recoverWithRetry(electronApp, retries = 2) {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await this.recoverLostWindow(electronApp);
      } catch (err) {
        lastError = err;
        if (attempt < retries) {
          this.mainWindow = null;
          this.currentWindow = null;
        }
      }
    }
    throw lastError;
  }

  reset() {
    this.mainWindow = null;
    this.currentWindow = null;
  }

  getCurrentWindow() {
    if (!this.currentWindow) {
      throw new Error("No active Electron window found");
    }
    return this.currentWindow;
  }
}

module.exports = new ElectronWindowManager();
