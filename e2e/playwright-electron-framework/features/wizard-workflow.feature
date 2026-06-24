@smoke @regression @p0 @Wizard
Feature: End-to-End Wizard Workflow
  As a Security Manager
  I want to complete the assessment wizard
  So that the assessment lifecycle reaches a finalized state

  Background:
    Given the Electron ISRA application is running
    And I am logged in with valid credentials

  @TC-WIZARD-001 @Automated
  Scenario: Complete full wizard progression
    When I complete wizard steps from basic info through mitigation
    Then wizard progression should succeed

  @TC-WIZARD-002 @Automated
  Scenario: Prevent moving next with missing mandatory fields
    When I try to proceed from wizard step 1 with missing project name
    Then wizard validation should block progression

  @TC-WIZARD-003 @Automated
  Scenario: Persist wizard progress across app restart
    When I complete wizard steps up to step 3 and restart the application
    Then wizard should resume from step 4 with persisted data
