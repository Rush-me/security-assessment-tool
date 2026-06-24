const LoginPage = require("./LoginPage");
const AssessmentPage = require("./AssessmentPage");
const BusinessAssetPage = require("./BusinessAssetPage");
const SupportingAssetPage = require("./SupportingAssetPage");
const VulnerabilityPage = require("./VulnerabilityPage");
const RiskPage = require("./RiskPage");
const ReportPage = require("./ReportPage");

class PageFactory {
  constructor(page) {
    this.loginPage = new LoginPage(page);
    this.assessmentPage = new AssessmentPage(page);
    this.businessAssetPage = new BusinessAssetPage(page);
    this.supportingAssetPage = new SupportingAssetPage(page);
    this.vulnerabilityPage = new VulnerabilityPage(page);
    this.riskPage = new RiskPage(page);
    this.reportPage = new ReportPage(page);
  }
}

module.exports = PageFactory;
