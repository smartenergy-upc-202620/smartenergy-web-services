# Sprint 1 specification (planned). These scenarios are NOT implemented yet.
# Bounded Context: Alerting (apps/alert-service)
@sprint-1 @planned
Feature: Alerts
  As a SmartEnergy user
  I want to define alert rules and review the alerts raised
  So that I can react to abnormal energy consumption

  Scenario: Create an alert rule
    Given an authenticated user
    When the client sends "POST /alert-rules" with a deviceId and a consumption threshold
    Then the alert rule is stored

  Scenario: List alerts
    Given alerts have been raised
    When the client sends "GET /alerts"
    Then the response contains the raised alerts

  Scenario: Get an alert by id
    Given an alert that has been raised
    When the client sends "GET /alerts/:id" with its id
    Then the response contains that alert
