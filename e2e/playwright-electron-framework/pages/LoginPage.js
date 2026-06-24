const BasePage = require("./BasePage");

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    // HEALED: selectors updated to match actual Angular HTML (no data-testid in source)
    this.usernameInput = page.getByPlaceholder("Enter username");
    this.passwordInput = page.getByPlaceholder("Enter password");
    this.loginButton = page.getByRole("button", { name: /sign in/i });
    this.userMenuButton = page.locator("button.user-avatar-btn").first();
    this.logoutButton = page.locator("button.popup-row.sign-out");
    this.errorMessage = page.getByText(/invalid credentials|invalid username or password|authentication required/i);
    this.dashboardMarker = page.getByRole("heading", { name: /risk assessments/i });
    this.wizardMarker = page.locator(".wizard-stepper");
  }

  async isLoggedIn() {
    const dashboard = await this.dashboardMarker.first().isVisible({ timeout: 3000 }).catch(() => false);
    const wizard = await this.wizardMarker.first().isVisible({ timeout: 3000 }).catch(() => false);
    return dashboard || wizard;
  }

  async isLoginFormVisible() {
    return this.usernameInput.first().isVisible({ timeout: 3000 }).catch(() => false);
  }

  async login(username, password) {
    // Some runs start on dashboard from a persisted session.
    if (await this.isLoggedIn()) {
      return;
    }

    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }

  async logout() {
    // If we are already on login screen, no-op.
    if (await this.isLoginFormVisible()) {
      return;
    }

    if (await this.userMenuButton.isVisible().catch(() => false)) {
      await this.click(this.userMenuButton);
    }
    await this.click(this.logoutButton);
  }

  async verifyLoginSuccessful() {
    const loggedIn = await this.isLoggedIn();
    if (!loggedIn) {
      await this.expectVisible(this.dashboardMarker);
    }
  }

  async verifyLoginFailed() {
    await this.expectVisible(this.errorMessage);
  }
}

module.exports = LoginPage;
