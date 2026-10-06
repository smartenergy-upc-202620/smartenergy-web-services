import { Alert } from './alert.entity';

describe('Alert', () => {
  it('exposes the data of the triggered alert', () => {
    const triggeredAt = new Date('2026-01-01T12:00:00Z');
    const alert = new Alert({
      id: 'alert-1',
      alertRuleId: 'rule-1',
      deviceId: 'device-1',
      consumptionKwh: 7.2,
      triggeredAt,
    });

    expect(alert.id).toBe('alert-1');
    expect(alert.alertRuleId).toBe('rule-1');
    expect(alert.deviceId).toBe('device-1');
    expect(alert.consumptionKwh).toBe(7.2);
    expect(alert.triggeredAt).toBe(triggeredAt);
  });
});
