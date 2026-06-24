@smoke @sanity @regression @p0 @AssessmentManagement 
Feature: Assessment Management
  As a Security Manager
  I want to create and validate assessment projects
  So that I can initiate ISO 27005 assessments reliably

  Background:
    Given the Electron ISRA application is running
    And I am logged in with valid credentials

  @TC-ASSESS-001 @US-ASSESS-001 @Automated
  Scenario: Create project successfully with required fields
    When I create a project with name "TestProject001" organization "GlobalOrg" and classification "CONFIDENTIAL"
    Then the project should be created successfully

  @TC-ASSESS-002 @TC-ASSESS-003 @Automated
  Scenario Outline: Validate project creation failures
    When I attempt to create a project with name "<name>" organization "<organization>" and classification "<classification>"
    Then project validation or duplicate error should be shown

    Examples:
      | name           | organization | classification |
      |                |              | PUBLIC         |
      | TestProject001 | GlobalOrg    | SECRET         |

  @TC-ASSESS-004 @Automated
  Scenario Outline: Validate project name boundaries
    When I attempt to create a project with name "<name>" organization "GlobalOrg" and classification "CONFIDENTIAL"
    Then project boundary behavior should be "<result>"

    Examples:
      | name                                                                                                                                                                                                                                                           | result  |
      | A                                                                                                                                                                                                                                                              | accepted |
      | ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTU | accepted |
      | ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUV | rejected |
