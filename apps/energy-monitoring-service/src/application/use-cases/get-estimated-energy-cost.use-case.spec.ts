
import { EnergyMeasurement } from '../../domain/entities/energy-measurement.entity';
import { EnergyMeasurementRepository } from '../../domain/repositories/energy-measurement.repository';
import { GetEstimatedEnergyCostUseCase } from './get-estimated-energy-cost.use-case';

const measurement = (id: string, consumptionKwh: number) =>
  EnergyMeasurement.create({
    id,
    deviceId: 'device-001',
    consumptionKwh,
    measuredAt: new Date('2026-10-26T12:00:00.000Z'),
  });

describe('GetEstimatedEnergyCostUseCase - US03', () => {
  const repository: jest.Mocked<EnergyMeasurementRepository> = {
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
  };

  const useCase = new GetEstimatedEnergyCostUseCase(repository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates the cost using registered measurements', async () => {
    repository.findAll.mockResolvedValue([
      measurement('m-1', 3.75),
      measurement('m-2', 4.25),
    ]);

    await expect(
      useCase.execute(0.7, { deviceId: 'device-001' }),
    ).resolves.toEqual({
      totalMeasurements: 2,
      totalConsumptionKwh: 8,
      tariffPerKwh: 0.7,
      estimatedCost: 5.6,
      currency: 'PEN',
    });

    expect(repository.findAll).toHaveBeenCalledWith({
      deviceId: 'device-001',
    });
  });

  it('returns zero cost when there are no measurements', async () => {
    repository.findAll.mockResolvedValue([]);

    await expect(useCase.execute(0.7)).resolves.toEqual({
      totalMeasurements: 0,
      totalConsumptionKwh: 0,
      tariffPerKwh: 0.7,
      estimatedCost: 0,
      currency: 'PEN',
    });
  });

  it('rejects invalid tariffs before querying the repository', async () => {
    await expect(useCase.execute(-0.5)).rejects.toThrow(
      RangeError,
    );

    expect(repository.findAll).not.toHaveBeenCalled();
  });
});
