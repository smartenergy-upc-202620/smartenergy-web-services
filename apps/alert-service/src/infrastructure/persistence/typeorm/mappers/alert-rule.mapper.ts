import { AlertRule } from '../../../../domain/entities/alert-rule.entity';
import { AlertRuleOrmEntity } from '../entities/alert-rule.orm-entity';

export class AlertRuleMapper {
  static toDomain(entity: AlertRuleOrmEntity): AlertRule {
    return AlertRule.create({
      id: entity.id,
      name: entity.name,
      thresholdKwh: entity.thresholdKwh,
      active: entity.active,
      createdAt: entity.createdAt,
    });
  }

  static toPersistence(rule: AlertRule): AlertRuleOrmEntity {
    const entity = new AlertRuleOrmEntity();
    entity.id = rule.id;
    entity.name = rule.name;
    entity.thresholdKwh = rule.thresholdKwh;
    entity.active = rule.active;
    entity.createdAt = rule.createdAt;
    return entity;
  }
}
