const { Given, When, Then } = require("@cucumber/cucumber");

Given("a risk exists for mitigation planning", async function () {
  await this.pages.riskPage.createRisk({
    asset: "DatabaseServer",
    threat: "HACKER",
    vulnerability: "SQL Injection",
    threatFactor: 7,
    occurrence: 3,
    c: 8,
    i: 6,
    a: 9
  });
});

When("I create a mitigation with type {string} and reduction {string}", async function (type, reduction) {
  await this.pages.riskPage.createMitigation({
    description: "Deploy WAF",
    type,
    reduction
  });
});

Then("mitigation creation should succeed", async function () {
  await this.pages.riskPage.verifySuccess();
});

Then("mitigation validation behavior should be {string}", async function (result) {
  if (result === "accepted") {
    await this.pages.riskPage.verifySuccess();
  } else {
    await this.pages.riskPage.verifyValidationError();
  }
});
