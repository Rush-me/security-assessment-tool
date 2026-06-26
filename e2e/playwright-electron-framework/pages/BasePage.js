const { expect } = require("@playwright/test");

class BasePage {
  constructor(page) {
    this.page = page;
  }

  async click(locator, { force = false } = {}) {
    if (!force) {
      await locator.waitFor({ state: "visible", timeout: 10000 });
    }
    await locator.click({ force });
  }

  async fill(locator, value) {
    await locator.waitFor({ state: "visible", timeout: 10000 });
    await locator.fill(String(value));
  }

  async text(locator) {
    await locator.waitFor({ state: "visible", timeout: 10000 });
    return locator.textContent();
  }

  async expectVisible(locator) {
    await expect(locator).toBeVisible();
  }

  async expectContainsText(locator, value) {
    await expect(locator).toContainText(value);
  }

  locatorCandidates(testId, role, label, text, css, xpath) {
    return [
      testId ? { type: "testId", value: testId } : null,
      role ? { type: "role", role: role.name, options: role.options || {} } : null,
      label ? { type: "label", value: label } : null,
      text ? { type: "text", value: text } : null,
      css ? { type: "css", value: css } : null,
      xpath ? { type: "xpath", value: xpath } : null
    ].filter(Boolean);
  }
}

module.exports = BasePage;
