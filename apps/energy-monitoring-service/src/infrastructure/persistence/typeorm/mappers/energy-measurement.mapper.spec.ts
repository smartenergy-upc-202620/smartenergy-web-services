import { EnergyMeasurement } from '../../../../domain/entities/energy-measurement.entity';
import { InvalidEnergyMeasurementException } from '../../../../domain/exceptions/invalid-energy-measurement.exception';
import { EnergyMeasurementOrmEntity } from '../entities/energy-measurement.orm-entity';
import { EnergyMeasurementMapper } from './energy-measurement.mapper';

describe('EnergyMeasurementMapper', () => {
  const measurement = EnergyMeasurement.create({
    id: '6b0f4a52-1d3e-4c8a-9b8e-0c5a7d2f9e31',
    deviceId: 'device-001',
    consumptionKwh: 3.75,
    measuredAt: new Date('2026-10-06T10:30:00.000Z'),
  });

  it('maps a domain measurement to its persistence model', () => {
    const entity = EnergyMeasurementMapper.toPersistence(measurement);

    expect(entity).toBeInstanceOf(EnergyMeasurementOrmEntity);
    expect(entity).toEqual({
      id: measurement.id,
      deviceId: 'device-001',
      consumptionKwh: 3.75,
      measuredAt: measurement.measuredAt,
    });
  });

  it('maps the persistence model back to the domain', () => {
    const restored = EnergyMeasurementMapper.toDomain(
      EnergyMeasurementMapper.toPersistence(measurement),
    );

    expect(restored).toBeInstanceOf(EnergyMeasurement);
    expect(restored).toEqual(measurement);
  });

  it('applies the domain invariants when reading corrupted rows', () => {
    const entity = EnergyMeasurementMapper.toPersistence(measurement);
    entity.consumptionKwh = -5;

    expect(() => EnergyMeasurementMapper.toDomain(entity)).toThrow(
      InvalidEnergyMeasurementException,
    );
  });
});
