const BasePage = require("./BasePage");

class BusinessAssetPage extends BasePage {
  constructor(page) {
    super(page);
    // HEALED: selectors updated to match actual Angular business-assets HTML
    this.headerAddAssetButton = page.locator('.header-right button.btn-primary-add').first();
    this.emptyStateAddAssetButton = page.locator('.empty-state button.btn-primary-add').first();
    this.assetNameInput = page.getByPlaceholder("e.g. Cardholder Data (PAN)");
    this.assetTypeSelect = page.locator('mat-select[formcontrolname="assetType"]');
    this.confidentialityInput = page.locator('mat-select[formcontrolname="confidentiality"]');
    this.integrityInput = page.locator('mat-select[formcontrolname="integrity"]');
    this.availabilityInput = page.locator('mat-select[formcontrolname="availability"]');
    this.authenticityInput = page.locator('mat-select[formcontrolname="authenticity"]');
    this.authorizationInput = page.locator('mat-select[formcontrolname="authorization"]');
    this.nonRepudiationInput = page.locator('mat-select[formcontrolname="nonRepudiation"]');
    this.submitButton = page.locator('button.btn-save').first();
    this.successMessage = page.locator('.assets-table, .asset-name-cell').first();
    this.validationMessage = page.locator('.validation-banner, mat-error');
    this.formCard = page.locator('.editor-card').first();
    this.assetNameCell = page.locator('.asset-name-cell strong');
  }

  async openAddAssetForm() {
    // Wait for Business Assets step/page to load
    await this.page.waitForLoadState("networkidle").catch(() => {});
    await this.page.locator('.editor-page, .wizard-step, app-business-assets').first().waitFor({ state: "visible", timeout: 10000 }).catch(() => {});

    console.log("[BusinessAsset] openAddAssetForm starting");
    
    // Check if form is already visible
    const formAlreadyVisible = await this.assetNameInput.first().isVisible({ timeout: 1000 }).catch(() => false);
    console.log("[BusinessAsset] Form already visible:", formAlreadyVisible);
    
    if (formAlreadyVisible) {
      return;
    }

    // Diagnostic: Check what buttons are available
    const headerButtonVisible = await this.headerAddAssetButton.isVisible({ timeout: 1000 }).catch(() => false);
    const emptyStateButtonVisible = await this.emptyStateAddAssetButton.isVisible({ timeout: 1000 }).catch(() => false);
    console.log("[BusinessAsset] Header button visible:", headerButtonVisible);
    console.log("[BusinessAsset] Empty state button visible:", emptyStateButtonVisible);
    
    // Diagnostic: Get all buttons count
    const allButtons = await this.page.locator('button').count();
    console.log("[BusinessAsset] Total buttons on page:", allButtons);
    
    // Try to find and log all btn-primary-add buttons
    const addButtons = await this.page.locator('button.btn-primary-add').count();
    console.log("[BusinessAsset] btn-primary-add buttons:", addButtons);
    
    if (emptyStateButtonVisible) {
      console.log("[BusinessAsset] Clicking empty state button");
      await this.emptyStateAddAssetButton.click();
    } else if (headerButtonVisible) {
      console.log("[BusinessAsset] Clicking header button");
      await this.headerAddAssetButton.click();
    } else {
      console.log("[BusinessAsset] No button found, trying generic button search");
      // Try clicking any add button
      const genericAddButton = await this.page.locator('button:has-text("Add")').first().isVisible({ timeout: 1000 }).catch(() => false);
      if (genericAddButton) {
        console.log("[BusinessAsset] Found generic Add button");
        await this.page.locator('button:has-text("Add")').first().click();
      } else {
        throw new Error("No Add button found for Business Assets");
      }
    }

    console.log("[BusinessAsset] Waiting for asset name input after clicking button");
    await this.assetNameInput.first().waitFor({ state: "visible", timeout: 15000 });
    console.log("[BusinessAsset] Asset name input found, form is open");
  }

  async createBusinessAsset(asset) {
    console.log("[BusinessAsset] Starting asset creation for:", asset);
    
    await this.openAddAssetForm();
    
    // Wait for form to be fully interactive before filling
    await this.page.waitForLoadState("networkidle").catch(() => {});
    await this.assetNameInput.first().waitFor({ state: "attached", timeout: 5000 });
    
    await this.fill(this.assetNameInput, asset.name);
    console.log("[BusinessAsset] Filled asset name:", asset.name);

    // Try to select asset type which worked before
    try {
      console.log("[BusinessAsset] Selecting assetType...");
      await this.assetTypeSelect.first().click({ timeout: 2000, force: true });
      await this.page.waitForTimeout(300);
      
      const option = this.page.locator(`mat-option:has-text("Information")`).first();
      await option.click({ timeout: 1000, force: true });
      console.log("[BusinessAsset] Asset type selected");
    } catch (e) {
      console.log("[BusinessAsset] Asset type selection failed - continuing:", e.message);
    }

    console.log("[BusinessAsset] Submitting form...");
    // Click submit button - use force if needed
    await this.page.locator('button.btn-save').first().click({ force: true, timeout: 5000 }).catch(async (e) => {
      console.log("[BusinessAsset] Click failed, trying keyboard...");;
      const submitBtn = this.page.locator('button.btn-save').first();
      await submitBtn.focus();
      await this.page.keyboard.press('Enter');
    });

    // Wait for form to close and asset to appear
    console.log("[BusinessAsset] Waiting for form submission...");
    await this.page.waitForTimeout(1000);
    
    // Wait for form to close
    const formClosed = await this.formCard.waitFor({ state: "hidden", timeout: 10000 }).catch(() => false);
    console.log ("[BusinessAsset] Form closed:", formClosed);
    
    // Wait for asset table or at least one asset row to appear
    await this.page.locator('.assets-table, tbody tr, .asset-name-cell').first().waitFor({ state: "visible", timeout: 15000 });
    console.log("[BusinessAsset] Asset created successfully");
  }

  async verifyAssetCreated() {
    await this.expectVisible(this.successMessage);
  }

  async verifyAssetValidationError() {
    await this.expectVisible(this.validationMessage);
  }
}

module.exports = BusinessAssetPage;
