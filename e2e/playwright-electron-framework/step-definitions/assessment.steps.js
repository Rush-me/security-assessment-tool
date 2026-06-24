const { Given, When, Then } = require("@cucumber/cucumber");

Given("a project exists for asset onboarding", async function () {
  await this.pages.assessmentPage.openCreateProjectDialog();
  await this.pages.assessmentPage.createProject({
    name: `Project-${Date.now()}`,
    organization: "GlobalOrg",
    classification: "CONFIDENTIAL"
  });
  await this.pages.assessmentPage.verifyProjectCreated();
});

When("I create a project with name {string} organization {string} and classification {string}", async function (name, organization, classification) {
  await this.pages.assessmentPage.openCreateProjectDialog();
  await this.pages.assessmentPage.createProject({ name, organization, classification });
});

When("I attempt to create a project with name {string} organization {string} and classification {string}", async function (name, organization, classification) {
  await this.pages.assessmentPage.openCreateProjectDialog();
  await this.pages.assessmentPage.createProject({ name, organization, classification });
});

Then("the project should be created successfully", async function () {
  await this.pages.assessmentPage.verifyProjectCreated();
});

Then("project validation or duplicate error should be shown", async function () {
  await this.pages.assessmentPage.verifyValidationError();
});

Then("project boundary behavior should be {string}", async function (result) {
  if (result === "accepted") {
    await this.pages.assessmentPage.verifyProjectCreated();
  } else {
    await this.pages.assessmentPage.verifyValidationError();
  }
});
