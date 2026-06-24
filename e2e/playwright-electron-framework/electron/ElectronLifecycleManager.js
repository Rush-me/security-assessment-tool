const ElectronAppManager = require("./ElectronAppManager");
const ElectronWindowManager = require("./ElectronWindowManager");

class ElectronLifecycleManager {
  async start() {
    const app = await ElectronAppManager.launch();
    const window = await ElectronWindowManager.discoverMainWindow(app);
    return { app, window };
  }

  async restart() {
    const app = await ElectronAppManager.restart();
    const window = await ElectronWindowManager.discoverMainWindow(app);
    return { app, window };
  }

  async stop() {
    await ElectronAppManager.close();
  }
}

module.exports = new ElectronLifecycleManager();
