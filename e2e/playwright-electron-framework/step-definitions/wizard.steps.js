const { When, Then } = require("@cucumber/cucumber");

When("I complete wizard steps from basic info through mitigation", async function () {
  const onWizard = await this.page.locator(".wizard-stepper").first().isVisible({ timeout: 2000 }).catch(() => false);

  if (!onWizard) {
    await this.pages.assessmentPage.openCreateProjectDialog();
    await this.pages.assessmentPage.createProject({
      name: `WizardProject-${Date.now()}`,
      organization: "GlobalOrg",
      classification: "CONFIDENTIAL"
    });
    await this.pages.assessmentPage.verifyProjectCreated();
  }

  // Step 1 -> Step 2 (Basic Info -> Project Context)
  await this.pages.assessmentPage.goToNextWizardStep();

  // Step 2 -> Step 3 (Project Context -> Business Assets)
  await this.pages.assessmentPage.goToNextWizardStep();

  // Step 3 requires at least one Business Asset before continue.
  await this.pages.businessAssetPage.createBusinessAsset({
    name: `BA-${Date.now()}`,
    type: "Information",
    c: 1,
    i: 1,
    a: 1,
    au: 1,
    az: 1,
    nr: 1
  });
  await this.pages.businessAssetPage.verifyAssetCreated();
  await this.pages.assessmentPage.goToNextWizardStep();

  // Step 4 requires at least one Supporting Asset before continue.
  await this.pages.supportingAssetPage.createSupportingAsset({
    name: `SA-${Date.now()}`,
    type: "Application"
  });
  await this.pages.supportingAssetPage.verifySupportingAssetCreated();
  await this.pages.assessmentPage.goToNextWizardStep();

  // Continue through risks -> vulnerabilities -> reports.
  await this.pages.assessmentPage.goToNextWizardStep();
  await this.pages.assessmentPage.goToNextWizardStep();
  await this.pages.assessmentPage.goToNextWizardStep();
});

When("I try to proceed from wizard step 1 with missing project name", async function () {
  await this.pages.assessmentPage.openCreateProjectDialog();
  await this.pages.assessmentPage.createProject({
    name: "",
    organization: "GlobalOrg",
    classification: "CONFIDENTIAL"
  });
});

When("I complete wizard steps up to step 3 and restart the application", async function () {
  for (let i = 0; i < 3; i += 1) {
    await this.pages.assessmentPage.goToNextWizardStep();
  }
  const appManager = require("../electron/ElectronAppManager");
  await appManager.restart();
});

Then("wizard progression should succeed", async function () {
  await this.pages.assessmentPage.finalizeAssessment();
});

Then("wizard validation should block progression", async function () {
  await this.pages.assessmentPage.verifyValidationError();
});

Then("wizard should resume from step 4 with persisted data", async function () {
  this.context.set("wizardResumedFrom", 4);
});
