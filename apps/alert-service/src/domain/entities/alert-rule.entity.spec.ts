import { InvalidAlertRuleException } from '../exceptions/invalid-alert-rule.exception';
import { AlertRule } from './alert-rule.entity';

describe('AlertRule', () => {
  const validProps = {
    id: 'rule-1',
    name: 'High consumption',
    thresholdKwh: 5,
    active: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
  };

  it('is created from valid data', () => {
    const rule = AlertRule.create(validProps);

    expect(rule.id).toBe('rule-1');
    expect(rule.name).toBe('High consumption');
    expect(rule.thresholdKwh).toBe(5);
    expect(rule.active).toBe(true);
    expect(rule.createdAt).toEqual(validProps.createdAt);
  });

  it('rejects a non-positive threshold', () => {
    expect(() => AlertRule.create({ ...validProps, thresholdKwh: 0 })).toThrow(
      InvalidAlertRuleException,
    );
  });

  it('rejects an empty name', () => {
    expect(() => AlertRule.create({ ...validProps, name: '  ' })).toThrow(
      InvalidAlertRuleException,
    );
  });

  it('trims the name', () => {
    expect(AlertRule.create({ ...validProps, name: ' Peak ' }).name).toBe(
      'Peak',
    );
  });
});
