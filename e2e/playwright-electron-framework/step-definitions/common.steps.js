const { Given } = require("@cucumber/cucumber");

Given("the Electron ISRA application is running", async function () {
  if (!this.electronApp || !this.page) {
    throw new Error("Electron app context was not initialized");
  }
});
