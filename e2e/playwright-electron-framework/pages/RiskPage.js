const BasePage = require("./BasePage");

class RiskPage extends BasePage {
  constructor(page) {
    super(page);
    // HEALED: selectors updated to match actual Angular risks HTML (no data-testid)
    this.addThreatButton = page.locator("button.btn-primary-add, button.btn-add-mini").first();
    this.threatAgentSelect = page.locator('select[formcontrolname="threatAgent"]');
    this.threatVerbSelect = page.locator('select[formcontrolname="threatVerb"]');
    this.threatMotivationInput = page.locator('textarea[formcontrolname="threatMotivation"], input[formcontrolname="threatMotivation"]');

    this.addRiskButton = page.locator("button.btn-primary-add, button.btn-add-mini").first();
    this.riskAssetSelect = page.locator('select[formcontrolname="businessAssetRefId"], mat-select[formcontrolname="businessAssetRefId"]').first();
    this.riskThreatSelect = page.locator('select[formcontrolname="threatAgent"]');
    this.riskVulnerabilitySelect = page.locator('mat-select[formcontrolname="vulnerabilityRef"]');
    this.threatFactorInput = page.locator('input[formcontrolname="threatFactor"], input[formcontrolname="likelihood"]').first();
    this.occurrenceSelect = page.locator('select[formcontrolname="occurrence"], mat-select[formcontrolname="occurrence"]').first();
    this.cInput = page.locator('mat-select[formcontrolname="c"]');
    this.iInput = page.locator('mat-select[formcontrolname="i"]');
    this.aInput = page.locator('mat-select[formcontrolname="a"]');

    this.submitButton = page.locator('button.btn-save, button[type="submit"]').first();
    this.successMessage = page.locator('.risk-item, .risk-list .risk-item-title').first();
    this.validationMessage = page.locator('.validation-banner, mat-error');

    this.addMitigationButton = page.getByRole("button", { name: /add mitigation/i });
    this.mitigationDescription = page.locator('textarea[formcontrolname="description"]');
    this.mitigationType = page.locator('mat-select[formcontrolname="type"]');
    this.mitigationReduction = page.locator('input[formcontrolname="reduction"]');
  }

  async createThreat({ agent, verb, motivation }) {
    await this.click(this.addThreatButton);
    await this.click(this.threatAgentSelect);
    await this.page.getByRole("option", { name: new RegExp(agent, "i") }).click();
    await this.click(this.threatVerbSelect);
    await this.page.getByRole("option", { name: new RegExp(verb, "i") }).click();
    await this.fill(this.threatMotivationInput, motivation);
    await this.click(this.submitButton);
  }

  async createRisk(data) {
    await this.click(this.addRiskButton);
    await this.click(this.riskAssetSelect);
    await this.page.getByRole("option", { name: new RegExp(data.asset, "i") }).click();
    await this.click(this.riskThreatSelect);
    await this.page.getByRole("option", { name: new RegExp(data.threat, "i") }).click();
    await this.click(this.riskVulnerabilitySelect);
    await this.page.getByRole("option", { name: new RegExp(data.vulnerability, "i") }).click();
    await this.fill(this.threatFactorInput, data.threatFactor);
    await this.click(this.occurrenceSelect);
    await this.page.getByRole("option", { name: new RegExp(String(data.occurrence), "i") }).click();
    await this.fill(this.cInput, data.c);
    await this.fill(this.iInput, data.i);
    await this.fill(this.aInput, data.a);
    await this.click(this.submitButton);
  }

  async createMitigation({ description, type, reduction }) {
    await this.click(this.addMitigationButton);
    await this.fill(this.mitigationDescription, description);
    await this.click(this.mitigationType);
    await this.page.getByRole("option", { name: new RegExp(type, "i") }).click();
    await this.fill(this.mitigationReduction, reduction);
    await this.click(this.submitButton);
  }

  async verifySuccess() {
    await this.expectVisible(this.successMessage);
  }

  async verifyValidationError() {
    await this.expectVisible(this.validationMessage);
  }
}

module.exports = RiskPage;
