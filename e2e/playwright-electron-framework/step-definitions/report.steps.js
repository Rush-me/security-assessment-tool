const { When, Then } = require("@cucumber/cucumber");

When("I finalize the assessment", async function () {
  await this.pages.reportPage.finalizeAssessment();
});

When("I attempt to finalize an incomplete assessment", async function () {
  await this.pages.reportPage.finalizeAssessment();
});

When("I generate an HTML report", async function () {
  await this.pages.reportPage.generateHtml();
});

When("I download a PDF report", async function () {
  await this.pages.reportPage.downloadPdf();
});

When("I export the risk register as CSV", async function () {
  await this.pages.reportPage.exportRiskRegisterCsv();
});

Then("finalization should succeed", async function () {
  await this.pages.reportPage.verifySuccess();
});

Then("report validation error should be shown", async function () {
  await this.pages.reportPage.verifyValidationError();
});

Then("report generation should succeed", async function () {
  await this.pages.reportPage.verifySuccess();
});
