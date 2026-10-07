# Bounded Context: Identity & Access (apps/user-service)
# Entry point: API Gateway (http://localhost:3000/api/v1)
# Automated coverage: apps/user-service/src/**/*.spec.ts
@sprint-1 @identity-access
Feature: Authentication
  As a SmartEnergy user
  I want to register and log in
  So that I can access my own energy data securely

  Background:
    Given the API Gateway is running

  Scenario: Register a new user
    Given no user is registered with the email "user@example.com"
    When the client sends "POST /auth/register" with:
      | email            | password          | role      |
      | user@example.com | StrongPassword123 | HOME_USER |
    Then the response status is 201
    And the response contains an "id", the email "user@example.com" and the role "HOME_USER"
    And the response does not include the password nor its hash

  Scenario: Reject a duplicated email
    Given a user is registered with the email "user@example.com"
    When the client sends "POST /auth/register" with the email "user@example.com"
    Then the response status is 409

  Scenario Outline: Reject invalid registration data
    When the client sends "POST /auth/register" with email "<email>" and password "<password>"
    Then the response status is 400

    Examples:
      | email            | password          |
      | not-an-email     | StrongPassword123 |
      | user@example.com | short             |

  Scenario: Login with valid credentials
    Given a user is registered with the email "user@example.com" and the password "StrongPassword123"
    When the client sends "POST /auth/login" with those credentials
    Then the response status is 200
    And the response contains an "accessToken"
    And the response contains the user with the role "HOME_USER"

  Scenario: Reject invalid credentials
    Given a user is registered with the email "user@example.com" and the password "StrongPassword123"
    When the client sends "POST /auth/login" with the password "WrongPassword123"
    Then the response status is 401
    And the error message is "Invalid email or password"

  Scenario: Get the authenticated user
    Given the client has logged in and stored the "accessToken"
    When the client sends "GET /users/me" with the header "Authorization: Bearer <accessToken>"
    Then the response status is 200
    And the response contains the profile of the authenticated user

  Scenario: Reject a request to /users/me without a valid token
    When the client sends "GET /users/me" without an Authorization header
    Then the response status is 401
