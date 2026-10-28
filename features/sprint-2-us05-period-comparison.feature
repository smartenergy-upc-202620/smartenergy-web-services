@sprint-2 @us05 @energy-monitoring
Feature: Compare energy consumption between periods
  As a SmartEnergy user
  I want to compare two consumption periods
  So that I can see increases, reductions and insufficient data

  Scenario: A period shows lower consumption than the previous period
    Given device-001 consumed 120 kWh in the baseline period
    And device-001 consumed 90 kWh in the comparison period
    When I compare the periods
    Then the result shows 120 kWh for the baseline period
    And the result shows 90 kWh for the comparison period
    And the difference is -30 kWh
    And the percentage change is -25 percent
    And the trend is decrease

  Scenario: Insufficient information in one period
    Given the baseline period has no measurements
    And the comparison period has a 5 kWh reading
    When I compare the periods
    Then the result indicates insufficient_data
    And the baseline consumption is null, not zero
    And the percentage change is null

  Scenario: Baseline measurements sum to zero
    Given a baseline measurement exists with 0 kWh
    And the comparison period has a 5 kWh reading
    When I compare the periods
    Then the difference is 5 kWh
    And the percentage change is null

  Scenario: Invalid overlapping periods
    Given the baseline overlaps with the comparison period
    When I request the comparison through the API
    Then the response has HTTP status 400