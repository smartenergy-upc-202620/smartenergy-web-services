@sprint-3 @us06 @energy-monitoring
Feature: Energy consumption reports
  As a SmartEnergy user
  I want to consult energy consumption reports
  So that I can analyze my energy usage

  Background:
    Given the API Gateway is running

  Scenario: Generate a weekly report
    Given device "device-001" has four measurements
    And their total consumption is 18.5 kWh
    When the client requests a weekly report for "device-001"
    Then the response status is 200
    And the total consumption is 18.5 kWh
    And the average consumption is 4.625 kWh
    And hasData is true

  Scenario: Generate a monthly report
    Given measurements exist in the selected month
    When the client requests a monthly energy report
    Then the response status is 200
    And the report covers the selected calendar month

  Scenario: Report without measurements
    Given no measurements exist for the selected period
    When the client requests an energy report
    Then the response status is 200
    And hasData is false
    And the average consumption is null

  Scenario: Reject invalid report period
    When the client requests a report with period "year"
    Then the response status is 400