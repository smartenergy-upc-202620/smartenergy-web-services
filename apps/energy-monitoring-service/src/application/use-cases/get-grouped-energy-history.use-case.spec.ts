
import { EnergyMeasurement } from '../../domain/entities/energy-measurement.entity';

import { EnergyMeasurementRepository } from '../../domain/repositories/energy-measurement.repository';

import { GetGroupedEnergyHistoryUseCase } from './get-grouped-energy-history.use-case';

const measurement = (
  id: string,
  consumptionKwh: number,
  measuredAt: string,
): EnergyMeasurement =>
  EnergyMeasurement.create({
    id,
    deviceId: 'device-001',
    consumptionKwh,
    measuredAt: new Date(measuredAt),
  });

describe('GetGroupedEnergyHistoryUseCase - US04', () => {
  const repository: jest.Mocked<EnergyMeasurementRepository> = {
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
  };

  const useCase = new GetGroupedEnergyHistoryUseCase(repository);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('groups consumption history by day', async () => {
    repository.findAll.mockResolvedValue([
      measurement('m1', 3.75, '2026-10-26T10:00:00Z'),
      measurement('m2', 4.25, '2026-10-26T15:00:00Z'),
      measurement('m3', 4, '2026-10-27T09:00:00Z'),
    ]);

    const result = await useCase.execute('day');

    expect(result).toEqual({
      granularity: 'day',
      totalMeasurements: 3,
      totalConsumptionKwh: 12,
      hasData: true,
      periods: [
        {
          period: '2026-10-26',
          totalMeasurements: 2,
          totalConsumptionKwh: 8,
        },
        {
          period: '2026-10-27',
          totalMeasurements: 1,
          totalConsumptionKwh: 4,
        },
      ],
    });
  });

  it('returns an explicit empty history', async () => {
    repository.findAll.mockResolvedValue([]);

    const result = await useCase.execute('month');

    expect(result).toEqual({
      granularity: 'month',
      totalMeasurements: 0,
      totalConsumptionKwh: 0,
      hasData: false,
      periods: [],
    });
  });

  it('forwards device and date filters to the repository', async () => {
    repository.findAll.mockResolvedValue([]);

    const filter = {
      deviceId: 'device-001',
      from: new Date('2026-10-01T00:00:00.000Z'),
      to: new Date('2026-10-31T23:59:59.999Z'),
    };

    await useCase.execute('week', filter);

    expect(repository.findAll).toHaveBeenCalledWith(filter);
  });

  it('rejects an unsupported granularity', async () => {
    await expect(
      useCase.execute('year' as 'day'),
    ).rejects.toThrow(RangeError);

    expect(repository.findAll).not.toHaveBeenCalled();
  });
});