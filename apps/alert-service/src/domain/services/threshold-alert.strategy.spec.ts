import { AlertRule } from '../entities/alert-rule.entity';
import { ThresholdAlertStrategy } from './threshold-alert.strategy';

describe('ThresholdAlertStrategy', () => {
  const strategy = new ThresholdAlertStrategy();
  const rule = (active = true) =>
    AlertRule.create({
      id: 'rule-1',
      name: 'High consumption',
      thresholdKwh: 5,
      active,
      createdAt: new Date(),
    });

  it('raises an alert when consumption exceeds the threshold', () => {
    expect(
      strategy.evaluate(rule(), {
        deviceId: 'device-001',
        consumptionKwh: 8.2,
      }),
    ).toBe(
      'Device "device-001" consumed 8.2 kWh, exceeding the 5 kWh threshold of rule "High consumption"',
    );
  });

  it('does not raise an alert below the threshold', () => {
    expect(
      strategy.evaluate(rule(), { deviceId: 'device-001', consumptionKwh: 3 }),
    ).toBeNull();
  });

  it('does not raise an alert exactly at the threshold', () => {
    expect(
      strategy.evaluate(rule(), { deviceId: 'device-001', consumptionKwh: 5 }),
    ).toBeNull();
  });

  it('ignores inactive rules', () => {
    expect(
      strategy.evaluate(rule(false), {
        deviceId: 'device-001',
        consumptionKwh: 50,
      }),
    ).toBeNull();
  });
});
