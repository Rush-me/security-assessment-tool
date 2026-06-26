@smoke @sanity @regression @p0 @Authentication
Feature: Authentication and Authorization
  As an ISRA user
  I want secure login behavior
  So that only authorized users access protected workflows

  Background:
    Given the Electron ISRA application is running

  @TC-AUTH-006 @Automated
  Scenario: Login with valid credentials
    When I log in with username "testuser" and password "TestPass123!"
    Then login should be successful

  @TC-AUTH-007 @TC-AUTH-008 @Automated
  Scenario Outline: Reject invalid credentials
    When I log in with username "<username>" and password "<password>"
    Then login should fail

    Examples:
      | username        | password       |
      | nonexistentuser | WrongPass123!  |
      | testuser        | WrongPass123!  |

  @TC-AUTH-009 @Automated
  Scenario: Lock account after repeated failed attempts
    When I attempt invalid login 6 times for user "testuser"
    Then login should fail
