const BasePage = require("./BasePage");

class SupportingAssetPage extends BasePage {
  constructor(page) {
    super(page);
    // HEALED: selectors updated to match actual Angular supporting-assets HTML
    this.addSupportingAssetButton = page.locator('button.btn-primary-add').first();
    this.nameInput = page.getByPlaceholder("e.g. Authentication API Gateway");
    this.typeSelect = page.locator('mat-select[formcontrolname="assetType"]');
    this.submitButton = page.locator('button.btn-save');
    this.successMessage = page.locator('.assets-table, .asset-name-cell').first();
  }

  async createSupportingAsset({ name, type }) {
    // Wait for page to load
    await this.page.waitForLoadState("networkidle").catch(() => {});
    
    await this.click(this.addSupportingAssetButton);
    
    // Wait for form to appear
    await this.nameInput.first().waitFor({ state: "visible", timeout: 10000 });
    
    await this.fill(this.nameInput, name);
    await this.typeSelect.first().waitFor({ state: "visible", timeout: 5000 });
    await this.click(this.typeSelect);
    await this.page.getByRole("option", { name: new RegExp(type, "i") }).first().click();
    await this.click(this.submitButton);
    
    // Wait for success
    await this.successMessage.waitFor({ state: "visible", timeout: 15000 });
  }

  async verifySupportingAssetCreated() {
    await this.expectVisible(this.successMessage);
  }
}

module.exports = SupportingAssetPage;
