import { EnergyMeasurement } from '../../../../domain/entities/energy-measurement.entity';
import { EnergyMeasurementOrmEntity } from '../entities/energy-measurement.orm-entity';

export class EnergyMeasurementMapper {
  static toDomain(entity: EnergyMeasurementOrmEntity): EnergyMeasurement {
    return EnergyMeasurement.create({
      id: entity.id,
      deviceId: entity.deviceId,
      consumptionKwh: entity.consumptionKwh,
      measuredAt: entity.measuredAt,
    });
  }

  static toPersistence(
    measurement: EnergyMeasurement,
  ): EnergyMeasurementOrmEntity {
    const entity = new EnergyMeasurementOrmEntity();
    entity.id = measurement.id;
    entity.deviceId = measurement.deviceId;
    entity.consumptionKwh = measurement.consumptionKwh;
    entity.measuredAt = measurement.measuredAt;
    return entity;
  }
}
