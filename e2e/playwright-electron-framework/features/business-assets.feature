@sanity @regression @p0 @BusinessAssetManagement
Feature: Business Asset Management
  As a Security Analyst
  I want to manage business assets with CIA attributes
  So that risk computation uses accurate impact values

  Background:
    Given the Electron ISRA application is running
    And I am logged in with valid credentials
    And a project exists for asset onboarding

  @TC-ASSET-001 @Automated
  Scenario: Create business asset with valid CIA scores
    When I create a business asset with valid CIA values
    Then the business asset should be created successfully

  @TC-ASSET-002 @TC-ASSET-003 @TC-ASSET-004 @Automated
  Scenario Outline: Validate CIA and criticality boundaries
    When I create a business asset with criticality "<criticality>" and CIA "<c>","<i>","<a>"
    Then business asset validation behavior should be "<result>"

    Examples:
      | criticality | c  | i | a | result   |
      | 4           | 8  | 7 | 9 | accepted |
      | 0           | 8  | 7 | 9 | rejected |
      | 6           | 8  | 7 | 9 | rejected |
      | 4           | 0  | 7 | 9 | rejected |
      | 4           | 11 | 7 | 9 | rejected |
