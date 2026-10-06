import { AlertRule } from '../../../../domain/entities/alert-rule.entity';
import { Alert } from '../../../../domain/entities/alert.entity';
import { AlertRuleOrmEntity } from '../entities/alert-rule.orm-entity';
import { AlertOrmEntity } from '../entities/alert.orm-entity';
import { AlertRuleMapper } from './alert-rule.mapper';
import { AlertMapper } from './alert.mapper';

describe('AlertRuleMapper', () => {
  const rule = AlertRule.create({
    id: 'rule-1',
    name: 'High consumption',
    thresholdKwh: 5,
    active: true,
    createdAt: new Date('2026-10-06T10:00:00.000Z'),
  });

  it('maps a rule to its persistence model and back', () => {
    const entity = AlertRuleMapper.toPersistence(rule);

    expect(entity).toBeInstanceOf(AlertRuleOrmEntity);
    expect(entity).toEqual({
      id: 'rule-1',
      name: 'High consumption',
      thresholdKwh: 5,
      active: true,
      createdAt: rule.createdAt,
    });
    expect(AlertRuleMapper.toDomain(entity)).toEqual(rule);
  });
});

describe('AlertMapper', () => {
  const alert = new Alert({
    id: 'alert-1',
    ruleId: 'rule-1',
    deviceId: 'device-001',
    consumptionKwh: 8.2,
    message: 'exceeded',
    createdAt: new Date('2026-10-06T10:31:00.000Z'),
  });

  it('maps an alert to its persistence model and back', () => {
    const entity = AlertMapper.toPersistence(alert);

    expect(entity).toBeInstanceOf(AlertOrmEntity);
    expect(entity).toEqual({
      id: 'alert-1',
      ruleId: 'rule-1',
      deviceId: 'device-001',
      consumptionKwh: 8.2,
      message: 'exceeded',
      createdAt: alert.createdAt,
    });
    expect(AlertMapper.toDomain(entity)).toEqual(alert);
  });
});
