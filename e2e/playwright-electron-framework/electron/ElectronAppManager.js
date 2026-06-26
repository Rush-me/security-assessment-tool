const { _electron: electron } = require("playwright");
const path = require("path");
const env = require("../config/env");

class ElectronAppManager {
  constructor() {
    this.electronApp = null;
  }

  async launch() {
    if (this.electronApp) {
      return this.electronApp;
    }

    const mainPath = path.resolve(env.electronMainPath);
    this.electronApp = await electron.launch({
      args: [mainPath],
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || "test"
      }
    });

    this.electronApp.on("close", () => {
      this.electronApp = null;
    });

    return this.electronApp;
  }

  async restart() {
    await this.close();
    return this.launch();
  }

  async close() {
    if (this.electronApp) {
      // Guard against occasional Electron shutdown hangs during Cucumber AfterAll.
      await Promise.race([
        this.electronApp.close(),
        new Promise((resolve) => setTimeout(resolve, 15000))
      ]);
      this.electronApp = null;
    }
  }

  getApp() {
    if (!this.electronApp) {
      throw new Error("Electron app is not launched");
    }
    return this.electronApp;
  }
}

module.exports = new ElectronAppManager();
