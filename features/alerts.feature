# Bounded Context: Alerting (apps/alert-service)
# Entry point: API Gateway (http://localhost:3000/api/v1)
# Automated coverage: apps/alert-service/src/**/*.spec.ts
# Sprint 1 evaluates consumption explicitly through REST (no message broker).
@sprint-1 @alerting
Feature: Alerts
  As a SmartEnergy user
  I want to define alert rules and be alerted about high consumption
  So that I can react to abnormal energy consumption

  Background:
    Given the API Gateway is running

  Scenario: Create an alert rule
    When the client sends "POST /alert-rules" with:
      | name             | thresholdKwh |
      | High consumption | 5.0          |
    Then the response status is 201
    And the alert rule is stored as active with a threshold of 5 kWh

  Scenario: List alert rules
    Given an alert rule "High consumption" exists
    When the client sends "GET /alert-rules"
    Then the response status is 200
    And the response contains the rule "High consumption"

  Scenario: Generate an alert when consumption exceeds threshold
    Given an active alert rule "High consumption" with a threshold of 5 kWh
    When the client sends "POST /alerts/evaluate" with:
      | deviceId   | consumptionKwh |
      | device-001 | 8.2            |
    Then the response status is 200
    And the response contains 1 generated alert
    And the alert references the rule "High consumption", the device "device-001" and 8.2 kWh

  Scenario Outline: Do not generate an alert when consumption is below threshold
    Given an active alert rule "High consumption" with a threshold of 5 kWh
    When the client sends "POST /alerts/evaluate" for "device-001" with <consumptionKwh> kWh
    Then the response status is 200
    And no alert is generated

    Examples:
      | consumptionKwh |
      | 3.0            |
      | 5.0            |

  Scenario: Inactive rules are not evaluated
    Given an inactive alert rule with a threshold of 1 kWh
    And no active alert rules
    When the client sends "POST /alerts/evaluate" for "device-001" with 50 kWh
    Then no alert is generated

  Scenario: List alerts
    Given an alert has been generated
    When the client sends "GET /alerts"
    Then the response status is 200
    And the response contains the generated alert, the most recent first

  Scenario: Get an alert by id
    Given an alert has been generated
    When the client sends "GET /alerts/:id" with its id
    Then the response status is 200
    And the response contains that alert

  Scenario: Get an unknown alert
    When the client sends "GET /alerts/00000000-0000-4000-8000-000000000000"
    Then the response status is 404
