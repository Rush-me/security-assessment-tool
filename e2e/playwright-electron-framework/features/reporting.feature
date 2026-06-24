@smoke @regression @p0 @Reporting
Feature: Reporting and Finalization
  As a Security Manager
  I want to finalize assessments and generate reports
  So that stakeholders receive auditable outputs

  Background:
    Given the Electron ISRA application is running
    And I am logged in with valid credentials

  @TC-REPORT-001 @Automated
  Scenario: Finalize assessment successfully
    When I finalize the assessment
    Then finalization should succeed

  @TC-REPORT-002 @Automated
  Scenario: Prevent finalization with incomplete data
    When I attempt to finalize an incomplete assessment
    Then report validation error should be shown

  @TC-REPORT-003 @TC-REPORT-005 @TC-REPORT-006 @Automated
  Scenario: Generate HTML PDF and CSV reports
    When I generate an HTML report
    And I download a PDF report
    And I export the risk register as CSV
    Then report generation should succeed
