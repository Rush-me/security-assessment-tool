@smoke @sanity @regression @p0 @RiskManagement
Feature: Risk Management
  As a Risk Manager
  I want to create risks and validate inherent risk calculations
  So that decisions are based on ISO 27005 quantification

  Background:
    Given the Electron ISRA application is running
    And I am logged in with valid credentials
    And a project has baseline assets threats and vulnerabilities

  @TC-THREAT-001 @Automated
  Scenario: Create threat with agent verb and motivation
    When I create a threat with agent "HACKER" verb "NETWORK_SCAN" and motivation "Reconnaissance"
    Then threat creation should succeed

  @TC-RISK-001 @TC-RISK-005 @Automated
  Scenario: Create risk with valid threat factor and occurrence
    When I create a risk with threat factor "7" occurrence "3" and CIA "8","6","9"
    Then risk creation should succeed
    And calculated likelihood should be 21
    And calculated impact should be 9

  @TC-RISK-002 @TC-RISK-003 @TC-RISK-004 @Automated
  Scenario Outline: Validate risk scoring boundaries
    When I create a risk with threat factor "<tf>" occurrence "<occurrence>" and CIA "<c>","<i>","<a>"
    Then risk validation behavior should be "<result>"

    Examples:
      | tf   | occurrence | c  | i | a | result   |
      | 0    | 1          | 8  | 6 | 9 | accepted |
      | 10   | 5          | 10 | 9 | 8 | accepted |
      | 10.1 | 3          | 8  | 6 | 9 | rejected |
      | 7    | 0          | 8  | 6 | 9 | rejected |
      | 7    | 6          | 8  | 6 | 9 | rejected |
      | 7    | 3          | 0  | 6 | 9 | rejected |

  @TC-RISK-006
  Scenario: Prevent duplicate risk
    When I create a duplicate risk combination
    Then risk duplicate error should be shown
