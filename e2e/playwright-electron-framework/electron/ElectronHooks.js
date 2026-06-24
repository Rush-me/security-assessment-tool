const { BeforeAll, AfterAll } = require("@cucumber/cucumber");
const lifecycle = require("./ElectronLifecycleManager");

BeforeAll(async function () {
  const { app, window } = await lifecycle.start();
  global.__electronApp = app;
  global.__mainWindow = window;
});

AfterAll(async function () {
  await lifecycle.stop();
});
