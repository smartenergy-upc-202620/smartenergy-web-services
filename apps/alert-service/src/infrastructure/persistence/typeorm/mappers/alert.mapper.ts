import { Alert } from '../../../../domain/entities/alert.entity';
import { AlertOrmEntity } from '../entities/alert.orm-entity';

export class AlertMapper {
  static toDomain(entity: AlertOrmEntity): Alert {
    return new Alert({
      id: entity.id,
      ruleId: entity.ruleId,
      deviceId: entity.deviceId,
      consumptionKwh: entity.consumptionKwh,
      message: entity.message,
      createdAt: entity.createdAt,
    });
  }

  static toPersistence(alert: Alert): AlertOrmEntity {
    const entity = new AlertOrmEntity();
    entity.id = alert.id;
    entity.ruleId = alert.ruleId;
    entity.deviceId = alert.deviceId;
    entity.consumptionKwh = alert.consumptionKwh;
    entity.message = alert.message;
    entity.createdAt = alert.createdAt;
    return entity;
  }
}
