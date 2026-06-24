@sanity @regression @p0 @MitigationManagement
Feature: Mitigation Management
  As a Risk Owner
  I want to add mitigations and validate reduction boundaries
  So that residual risk is measured correctly

  Background:
    Given the Electron ISRA application is running
    And I am logged in with valid credentials
    And a risk exists for mitigation planning

  @TC-MITIG-001 @Automated
  Scenario: Create mitigation for risk
    When I create a mitigation with type "PREVENTIVE" and reduction "60"
    Then mitigation creation should succeed

  @TC-MITIG-002 @Automated
  Scenario Outline: Validate mitigation reduction boundaries
    When I create a mitigation with type "PREVENTIVE" and reduction "<reduction>"
    Then mitigation validation behavior should be "<result>"

    Examples:
      | reduction | result   |
      | 0         | accepted |
      | 100       | accepted |
      | -1        | rejected |
      | 101       | rejected |
