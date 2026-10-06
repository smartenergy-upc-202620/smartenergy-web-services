# Sprint 1 specification (planned). These scenarios are NOT implemented yet.
# Bounded Context: Identity & Access (apps/user-service)
@sprint-1 @planned
Feature: Authentication
  As a SmartEnergy user
  I want to register and log in
  So that I can access my own energy data securely

  Scenario: Register a new user
    Given no user is registered with the email "user@example.com"
    When the client sends "POST /auth/register" with valid registration data
    Then the user account is created
    And the response does not include the password

  Scenario: Log in with valid credentials
    Given a registered user
    When the client sends "POST /auth/login" with valid credentials
    Then the response contains an access token

  Scenario: Get the authenticated user
    Given an authenticated user
    When the client sends "GET /users/me"
    Then the response contains the profile of the authenticated user
