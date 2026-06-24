const { Given, When, Then } = require("@cucumber/cucumber");

Given("I am logged in with valid credentials", async function () {
  await this.pages.loginPage.login("testuser", "TestPass123!");
  await this.pages.loginPage.verifyLoginSuccessful();
});

When("I log in with username {string} and password {string}", async function (username, password) {
  await this.pages.loginPage.login(username, password);
});

When("I attempt invalid login {int} times for user {string}", async function (times, username) {
  for (let i = 0; i < times; i += 1) {
    await this.pages.loginPage.login(username, "WrongPass123!");
  }
});

Then("login should be successful", async function () {
  await this.pages.loginPage.verifyLoginSuccessful();
});

Then("login should fail", async function () {
  await this.pages.loginPage.verifyLoginFailed();
});
