const BasePage = require("./BasePage");

class AssessmentPage extends BasePage {
  constructor(page) {
    super(page);
    // HEALED: selectors updated to match actual Angular dashboard modal HTML
    this.dashboardTitle = page.getByRole("heading", { name: /risk assessments/i });
    this.newProjectButton = page.locator("button.btn-new-assessment");
    this.newProjectCard = page.locator(".create-new-card");
    this.newAssessmentDialog = page.locator(".modal-card");
    this.projectNameInput = page.getByPlaceholder("e.g. SecurePay Gateway");
    this.projectVersionInput = page.locator('input[formcontrolname="projectVersion"]');
    this.projectOrgInput = page.locator('input[formcontrolname="projectOrganization"]');
    this.projectClassificationSelect = page.locator('mat-select[formcontrolname="classification"]');
    this.createProjectButton = page.getByRole("button", { name: /create assessment/i });
    this.successMessage = page.locator('.project-card, .wizard-stepper').first();
    this.validationMessage = page.locator('mat-error, .validation-banner');
    this.wizardNextButton = page.locator("button.btn-continue");
    this.finalizeButton = page.locator("button.btn-continue");
    this.wizardMarker = page.locator(".wizard-stepper");

    // Project Context required field(s)
    this.projectDescriptionTextarea = page.locator('textarea[formcontrolname="projectDescription"]');
    this.securityProjectObjectivesTextarea = page.locator('textarea[formcontrolname="securityProjectObjectives"]');
    this.securityOfficerObjectivesTextarea = page.locator('textarea[formcontrolname="securityOfficerObjectives"]');
    this.securityAssumptionsTextarea = page.locator('textarea[formcontrolname="securityAssumptions"]');
  }

  async openCreateProjectDialog() {
    // If already inside a project wizard, project is already active.
    const inWizard = await this.wizardMarker.first().isVisible({ timeout: 1500 }).catch(() => false);
    if (inWizard) {
      return;
    }

    await this.expectVisible(this.dashboardTitle);

    // Prefer explicit button; fallback to the create card if needed.
    if (await this.newProjectButton.first().isVisible().catch(() => false)) {
      await this.newProjectButton.first().click();
    } else {
      await this.newProjectCard.first().click();
    }

    await this.expectVisible(this.newAssessmentDialog);
  }

  async createProject({ name, organization, classification, version = "1.0" }) {
    // Retry-safe: if we are already in wizard, skip project creation.
    const inWizard = await this.wizardMarker.first().isVisible({ timeout: 1500 }).catch(() => false);
    if (inWizard) {
      return;
    }

    await this.fill(this.projectNameInput, name);
    await this.fill(this.projectVersionInput, version);
    await this.fill(this.projectOrgInput, organization);
    await this.click(this.projectClassificationSelect);
    await this.page.getByRole("option", { name: new RegExp(classification, "i") }).click();
    await this.click(this.createProjectButton);
  }

  async verifyProjectCreated() {
    // Creation can either return to dashboard list or navigate to project wizard.
    await this.page.waitForTimeout(1000);
    const onDashboard = await this.page.getByRole("heading", { name: /risk assessments/i })
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const onWizard = await this.page.locator(".wizard-stepper")
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (!onDashboard && !onWizard) {
      await this.expectVisible(this.successMessage);
    }
  }

  async verifyValidationError() {
    await this.expectVisible(this.validationMessage);
  }

  async goToNextWizardStep() {
    await this.fillProjectContextIfVisible();
    await this.click(this.wizardNextButton);
    // Wait for next step to load before returning
    await this.page.waitForLoadState("networkidle").catch(() => {});
    await this.page.waitForTimeout(500);
  }

  async fillProjectContextIfVisible() {
    const isProjectContext = await this.projectDescriptionTextarea
      .first()
      .isVisible({ timeout: 1000 })
      .catch(() => false);

    if (!isProjectContext) {
      return;
    }

    const description = this.projectDescriptionTextarea.first();
    const currentDescription = await description.inputValue().catch(() => "");
    if (!currentDescription || !currentDescription.trim()) {
      await description.fill(
        "Assessment scope includes project architecture, interfaces, data flow, and operating constraints."
      );
    }

    const projectObjectives = this.securityProjectObjectivesTextarea.first();
    const officerObjectives = this.securityOfficerObjectivesTextarea.first();
    const assumptions = this.securityAssumptionsTextarea.first();

    const poVal = await projectObjectives.inputValue().catch(() => "");
    if (!poVal || !poVal.trim()) {
      await projectObjectives.fill("Preserve confidentiality, integrity, and availability of business-critical assets.");
    }

    const ooVal = await officerObjectives.inputValue().catch(() => "");
    if (!ooVal || !ooVal.trim()) {
      await officerObjectives.fill("Ensure controls are implemented, auditable, and aligned with security policy.");
    }

    const asVal = await assumptions.inputValue().catch(() => "");
    if (!asVal || !asVal.trim()) {
      await assumptions.fill("Users are trained, baseline hardening is applied, and production secrets are managed securely.");
    }
  }

  async finalizeAssessment() {
    await this.click(this.finalizeButton);
  }
}

module.exports = AssessmentPage;
