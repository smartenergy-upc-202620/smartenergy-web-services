import { InvalidEnergyMeasurementException } from '../../domain/exceptions/invalid-energy-measurement.exception';
import { EnergyMeasurementRepository } from '../../domain/repositories/energy-measurement.repository';
import { CreateEnergyMeasurementUseCase } from './create-energy-measurement.use-case';

describe('CreateEnergyMeasurementUseCase', () => {
  const measurements: jest.Mocked<EnergyMeasurementRepository> = {
    save: jest.fn().mockResolvedValue(undefined),
    findById: jest.fn(),
    findAll: jest.fn(),
  };
  const useCase = new CreateEnergyMeasurementUseCase(measurements);

  beforeEach(() => jest.clearAllMocks());

  it('creates a measurement with a generated id and stores it', async () => {
    const measuredAt = new Date('2026-10-06T10:30:00.000Z');

    const measurement = await useCase.execute({
      deviceId: 'device-001',
      consumptionKwh: 3.75,
      measuredAt,
    });

    expect(measurement.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(measurement.deviceId).toBe('device-001');
    expect(measurement.consumptionKwh).toBe(3.75);
    expect(measurement.measuredAt).toEqual(measuredAt);
    expect(measurements.save).toHaveBeenCalledWith(measurement);
  });

  it('does not store an invalid measurement', async () => {
    await expect(
      useCase.execute({
        deviceId: 'device-001',
        consumptionKwh: -1,
        measuredAt: new Date(),
      }),
    ).rejects.toThrow(InvalidEnergyMeasurementException);
    expect(measurements.save).not.toHaveBeenCalled();
  });
});
