const BasePage = require("./BasePage");

class ReportPage extends BasePage {
  constructor(page) {
    super(page);
    // HEALED: selectors updated to match actual Angular reports HTML
    this.finalizeButton = page.locator("button.btn-continue"); // wizard Finish button
    this.generateHtmlButton = page.locator("button.btn-primary-export"); // Export button
    this.downloadPdfButton = page.getByRole("menuitem", { name: /full assessment json/i });
    this.exportCsvButton = page.getByRole("menuitem", { name: /risks csv/i });
    this.successMessage = page.locator('.reports-container, .kpi-row').first();
    this.validationMessage = page.locator('.validation-banner');
  }

  async finalizeAssessment() {
    await this.click(this.finalizeButton);
  }

  async generateHtml() {
    await this.click(this.generateHtmlButton);
  }

  async downloadPdf() {
    await this.click(this.downloadPdfButton);
  }

  async exportRiskRegisterCsv() {
    await this.click(this.exportCsvButton);
  }

  async verifySuccess() {
    await this.expectVisible(this.successMessage);
  }

  async verifyValidationError() {
    await this.expectVisible(this.validationMessage);
  }
}

module.exports = ReportPage;
