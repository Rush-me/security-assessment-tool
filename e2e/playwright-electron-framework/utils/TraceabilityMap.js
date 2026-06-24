const traceability = {
  "US-ASSESS-001": {
    testCases: ["TC-ASSESS-001", "TC-ASSESS-002", "TC-ASSESS-003", "TC-ASSESS-004", "TC-ASSESS-005", "TC-ASSESS-006", "TC-ASSESS-007"],
    featureFile: "features/assessment-management.feature",
    stepDefinition: "step-definitions/assessment.steps.js",
    pageObject: "pages/AssessmentPage.js"
  },
  "US-ASSET-001": {
    testCases: ["TC-ASSET-001", "TC-ASSET-002", "TC-ASSET-003", "TC-ASSET-004"],
    featureFile: "features/business-assets.feature",
    stepDefinition: "step-definitions/assets.steps.js",
    pageObject: "pages/BusinessAssetPage.js"
  },
  "US-THREAT-001": {
    testCases: ["TC-THREAT-001", "TC-THREAT-002", "TC-THREAT-003"],
    featureFile: "features/risk-management.feature",
    stepDefinition: "step-definitions/risk.steps.js",
    pageObject: "pages/RiskPage.js"
  },
  "US-VULN-001": {
    testCases: ["TC-VULN-001", "TC-VULN-002", "TC-VULN-003"],
    featureFile: "features/vulnerability-management.feature",
    stepDefinition: "step-definitions/vulnerability.steps.js",
    pageObject: "pages/VulnerabilityPage.js"
  },
  "US-RISK-001": {
    testCases: ["TC-RISK-001", "TC-RISK-002", "TC-RISK-003", "TC-RISK-004", "TC-RISK-006", "TC-RISK-007"],
    featureFile: "features/risk-management.feature",
    stepDefinition: "step-definitions/risk.steps.js",
    pageObject: "pages/RiskPage.js"
  },
  "US-MITIG-001": {
    testCases: ["TC-MITIG-001", "TC-MITIG-002", "TC-MITIG-003"],
    featureFile: "features/mitigation-management.feature",
    stepDefinition: "step-definitions/mitigation.steps.js",
    pageObject: "pages/RiskPage.js"
  },
  "US-REPORT-001": {
    testCases: ["TC-REPORT-001", "TC-REPORT-002", "TC-REPORT-003", "TC-REPORT-004", "TC-REPORT-005", "TC-REPORT-006"],
    featureFile: "features/reporting.feature",
    stepDefinition: "step-definitions/report.steps.js",
    pageObject: "pages/ReportPage.js"
  },
  "US-AUTH-002": {
    testCases: ["TC-AUTH-006", "TC-AUTH-007", "TC-AUTH-008", "TC-AUTH-009", "TC-AUTH-010", "TC-AUTH-011", "TC-AUTH-012"],
    featureFile: "features/authentication.feature",
    stepDefinition: "step-definitions/auth.steps.js",
    pageObject: "pages/LoginPage.js"
  },
  "US-WIZARD-001": {
    testCases: ["TC-WIZARD-001", "TC-WIZARD-002", "TC-WIZARD-003"],
    featureFile: "features/wizard-workflow.feature",
    stepDefinition: "step-definitions/wizard.steps.js",
    pageObject: "pages/AssessmentPage.js"
  }
};

module.exports = traceability;
