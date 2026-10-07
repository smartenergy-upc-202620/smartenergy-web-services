import { EnergyMeasurement } from '../../domain/entities/energy-measurement.entity';
import { EnergyMeasurementRepository } from '../../domain/repositories/energy-measurement.repository';
import { EnergyMeasurementNotFoundException } from '../exceptions/energy-measurement-not-found.exception';
import { GetEnergyMeasurementByIdUseCase } from './get-energy-measurement-by-id.use-case';

describe('GetEnergyMeasurementByIdUseCase', () => {
  const measurements: jest.Mocked<EnergyMeasurementRepository> = {
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
  };
  const useCase = new GetEnergyMeasurementByIdUseCase(measurements);

  it('returns the stored measurement', async () => {
    const measurement = EnergyMeasurement.create({
      id: 'm-1',
      deviceId: 'device-001',
      consumptionKwh: 1,
      measuredAt: new Date(),
    });
    measurements.findById.mockResolvedValue(measurement);

    await expect(useCase.execute('m-1')).resolves.toBe(measurement);
  });

  it('fails when it does not exist', async () => {
    measurements.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toThrow(
      EnergyMeasurementNotFoundException,
    );
  });
});
