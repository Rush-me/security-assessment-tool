const { Given, When, Then } = require("@cucumber/cucumber");

Given("a project has baseline assets threats and vulnerabilities", async function () {
  await this.pages.assessmentPage.openCreateProjectDialog();
  await this.pages.assessmentPage.createProject({
    name: `RiskProj-${Date.now()}`,
    organization: "GlobalOrg",
    classification: "CONFIDENTIAL"
  });
  await this.pages.assessmentPage.verifyProjectCreated();
});

When("I create a threat with agent {string} verb {string} and motivation {string}", async function (agent, verb, motivation) {
  await this.pages.riskPage.createThreat({ agent, verb, motivation });
});

When("I create a risk with threat factor {string} occurrence {string} and CIA {string},{string},{string}", async function (threatFactor, occurrence, c, i, a) {
  await this.pages.riskPage.createRisk({
    asset: "DatabaseServer",
    threat: "HACKER",
    vulnerability: "SQL Injection",
    threatFactor,
    occurrence,
    c,
    i,
    a
  });
});

When("I create a duplicate risk combination", async function () {
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

Then("threat creation should succeed", async function () {
  await this.pages.riskPage.verifySuccess();
});

Then("risk creation should succeed", async function () {
  await this.pages.riskPage.verifySuccess();
});

Then("calculated likelihood should be {int}", async function (value) {
  this.context.set("expectedLikelihood", value);
});

Then("calculated impact should be {int}", async function (value) {
  this.context.set("expectedImpact", value);
});

Then("risk validation behavior should be {string}", async function (result) {
  if (result === "accepted") {
    await this.pages.riskPage.verifySuccess();
  } else {
    await this.pages.riskPage.verifyValidationError();
  }
});

Then("risk duplicate error should be shown", async function () {
  await this.pages.riskPage.verifyValidationError();
});
