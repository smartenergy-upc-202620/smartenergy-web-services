import { InvalidEnergyMeasurementException } from '../exceptions/invalid-energy-measurement.exception';
import { EnergyMeasurement } from './energy-measurement.entity';

describe('EnergyMeasurement', () => {
  const validProps = {
    id: 'measurement-1',
    deviceId: 'device-1',
    consumptionKwh: 1.5,
    measuredAt: new Date('2026-01-01T10:00:00Z'),
  };

  it('is created from valid data', () => {
    const measurement = EnergyMeasurement.create(validProps);

    expect(measurement.id).toBe('measurement-1');
    expect(measurement.deviceId).toBe('device-1');
    expect(measurement.consumptionKwh).toBe(1.5);
    expect(measurement.measuredAt).toEqual(validProps.measuredAt);
  });

  it('rejects a negative consumption', () => {
    expect(() =>
      EnergyMeasurement.create({ ...validProps, consumptionKwh: -1 }),
    ).toThrow(InvalidEnergyMeasurementException);
  });

  it('rejects an empty device id', () => {
    expect(() =>
      EnergyMeasurement.create({ ...validProps, deviceId: '  ' }),
    ).toThrow(InvalidEnergyMeasurementException);
  });

  it('rejects an invalid measurement date', () => {
    expect(() =>
      EnergyMeasurement.create({ ...validProps, measuredAt: new Date('x') }),
    ).toThrow(InvalidEnergyMeasurementException);
  });
});
