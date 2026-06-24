const { setWorldConstructor, World } = require("@cucumber/cucumber");
const WorldContext = require("./WorldContext");
const PageFactory = require("../pages/PageFactory");

class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.context = new WorldContext();
    this.electronApp = null;
    this.page = null;
    this.pages = null;
  }

  bindElectron(app, page) {
    this.electronApp = app;
    this.page = page;
    this.pages = new PageFactory(page);
  }
}

setWorldConstructor(CustomWorld);

module.exports = CustomWorld;
