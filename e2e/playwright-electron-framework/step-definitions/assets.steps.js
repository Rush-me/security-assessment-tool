const { When, Then } = require("@cucumber/cucumber");

When("I create a business asset with valid CIA values", async function () {
  await this.pages.businessAssetPage.createBusinessAsset({
    name: `Asset-${Date.now()}`,
    type: "SYSTEM",
    criticality: 4,
    c: 8,
    i: 7,
    a: 9
  });
});

When("I create a business asset with criticality {string} and CIA {string},{string},{string}", async function (criticality, c, i, a) {
  await this.pages.businessAssetPage.createBusinessAsset({
    name: `Asset-${Date.now()}`,
    type: "SYSTEM",
    criticality,
    c,
    i,
    a
  });
});

Then("the business asset should be created successfully", async function () {
  await this.pages.businessAssetPage.verifyAssetCreated();
});

Then("business asset validation behavior should be {string}", async function (result) {
  if (result === "accepted") {
    await this.pages.businessAssetPage.verifyAssetCreated();
  } else {
    await this.pages.businessAssetPage.verifyAssetValidationError();
  }
});
