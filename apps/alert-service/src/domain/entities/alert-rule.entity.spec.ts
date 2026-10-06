import { InvalidAlertRuleException } from '../exceptions/invalid-alert-rule.exception';
import { AlertRule } from './alert-rule.entity';

describe('AlertRule', () => {
  const validProps = { id: 'rule-1', deviceId: 'device-1', thresholdKwh: 5 };

  it('is created from valid data', () => {
    const rule = AlertRule.create(validProps);

    expect(rule.id).toBe('rule-1');
    expect(rule.deviceId).toBe('device-1');
    expect(rule.thresholdKwh).toBe(5);
  });

  it('rejects a non-positive threshold', () => {
    expect(() => AlertRule.create({ ...validProps, thresholdKwh: 0 })).toThrow(
      InvalidAlertRuleException,
    );
  });

  it('rejects an empty device id', () => {
    expect(() => AlertRule.create({ ...validProps, deviceId: '' })).toThrow(
      InvalidAlertRuleException,
    );
  });
});
