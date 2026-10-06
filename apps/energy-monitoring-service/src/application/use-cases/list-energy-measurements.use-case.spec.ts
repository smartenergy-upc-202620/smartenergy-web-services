import { EnergyMeasurement } from '../../domain/entities/energy-measurement.entity';
import { EnergyMeasurementRepository } from '../../domain/repositories/energy-measurement.repository';
import { ListEnergyMeasurementsUseCase } from './list-energy-measurements.use-case';

describe('ListEnergyMeasurementsUseCase', () => {
  const stored = [
    EnergyMeasurement.create({
      id: 'm-1',
      deviceId: 'device-001',
      consumptionKwh: 2,
      measuredAt: new Date(),
    }),
  ];
  const measurements: jest.Mocked<EnergyMeasurementRepository> = {
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn().mockResolvedValue(stored),
  };
  const useCase = new ListEnergyMeasurementsUseCase(measurements);

  it('lists every measurement when no filter is given', async () => {
    await expect(useCase.execute()).resolves.toBe(stored);
    expect(measurements.findAll).toHaveBeenCalledWith({});
  });

  it('passes the device filter to the repository', async () => {
    await useCase.execute({ deviceId: 'device-001' });

    expect(measurements.findAll).toHaveBeenCalledWith({
      deviceId: 'device-001',
    });
  });
});
