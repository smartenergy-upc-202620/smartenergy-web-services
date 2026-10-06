# Sprint 1 specification (planned). These scenarios are NOT implemented yet.
# Bounded Context: Energy Monitoring (apps/energy-monitoring-service)
@sprint-1 @planned
Feature: Energy Monitoring
  As a SmartEnergy user
  I want to record and review my energy measurements
  So that I can understand how much energy my devices consume

  Scenario: Register an energy measurement
    Given an authenticated user
    When the client sends "POST /measurements" with a deviceId, consumptionKwh and measuredAt
    Then the energy measurement is stored

  Scenario: List energy measurements
    Given stored energy measurements
    When the client sends "GET /measurements"
    Then the response contains the stored measurements

  Scenario: Get an energy measurement by id
    Given a stored energy measurement
    When the client sends "GET /measurements/:id" with its id
    Then the response contains that measurement

  Scenario: Get a consumption summary
    Given stored energy measurements
    When the client sends "GET /measurements/summary"
    Then the response contains a summary of the consumption
