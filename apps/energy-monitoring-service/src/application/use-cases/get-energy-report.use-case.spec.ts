import { EnergyMeasurement } from '../../domain/entities/energy-measurement.entity';
import { EnergyMeasurementRepository } from '../../domain/repositories/energy-measurement.repository';
import { GetEnergyReportUseCase } from './get-energy-report.use-case';

const measurement = (id: string, consumptionKwh: number, measuredAt: string) =>
  EnergyMeasurement.create({
    id,
    deviceId: 'device-001',
    consumptionKwh,
    measuredAt: new Date(measuredAt),
  });

describe('GetEnergyReportUseCase - US06', () => {
  const repository: jest.Mocked<EnergyMeasurementRepository> = {
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
  };
  const useCase = new GetEnergyReportUseCase(repository);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('builds a weekly report with totals and average', async () => {
    repository.findAll.mockResolvedValue([
      measurement('m1', 4, '2026-11-09T10:00:00Z'),
      measurement('m2', 5.5, '2026-11-10T10:00:00Z'),
      measurement('m3', 3, '2026-11-12T10:00:00Z'),
      measurement('m4', 6, '2026-11-15T20:00:00Z'),
    ]);

    const result = await useCase.execute(
      'week',
      new Date('2026-11-10T00:00:00.000Z'),
      'device-001',
    );

    expect(result).toEqual({
      period: 'week',
      from: '2026-11-09T00:00:00.000Z',
      to: '2026-11-15T23:59:59.999Z',
      deviceId: 'device-001',
      totalMeasurements: 4,
      totalConsumptionKwh: 18.5,
      averageConsumptionKwh: 4.625,
      hasData: true,
    });
  });

  it('builds a monthly report and queries the whole month', async () => {
    repository.findAll.mockResolvedValue([
      measurement('m1', 10, '2026-11-02T10:00:00Z'),
      measurement('m2', 20, '2026-11-28T10:00:00Z'),
    ]);

    const result = await useCase.execute(
      'month',
      new Date('2026-11-14T12:00:00.000Z'),
    );

    expect(repository.findAll).toHaveBeenCalledWith({
      from: new Date('2026-11-01T00:00:00.000Z'),
      to: new Date('2026-11-30T23:59:59.999Z'),
    });
    expect(result).toMatchObject({
      period: 'month',
      from: '2026-11-01T00:00:00.000Z',
      to: '2026-11-30T23:59:59.999Z',
      totalMeasurements: 2,
      totalConsumptionKwh: 30,
      averageConsumptionKwh: 15,
      hasData: true,
    });
    expect(result).not.toHaveProperty('deviceId');
    expect(result).not.toHaveProperty('message');
  });

  it('forwards the deviceId filter to the repository', async () => {
    repository.findAll.mockResolvedValue([]);

    await useCase.execute(
      'week',
      new Date('2026-11-10T00:00:00.000Z'),
      'device-001',
    );

    expect(repository.findAll).toHaveBeenCalledWith({
      deviceId: 'device-001',
      from: new Date('2026-11-09T00:00:00.000Z'),
      to: new Date('2026-11-15T23:59:59.999Z'),
    });
  });

  it('rounds totals and average to three decimals', async () => {
    repository.findAll.mockResolvedValue([
      measurement('m1', 0.1, '2026-11-10T10:00:00Z'),
      measurement('m2', 0.2, '2026-11-10T11:00:00Z'),
      measurement('m3', 0.2, '2026-11-10T12:00:00Z'),
    ]);

    const result = await useCase.execute(
      'week',
      new Date('2026-11-10T00:00:00.000Z'),
    );

    expect(result.totalConsumptionKwh).toBe(0.5);
    expect(result.averageConsumptionKwh).toBe(0.167);
  });

  it('reports an explicit empty period without inventing values', async () => {
    repository.findAll.mockResolvedValue([]);

    const result = await useCase.execute(
      'week',
      new Date('2026-11-10T00:00:00.000Z'),
      'device-001',
    );

    expect(result).toEqual({
      period: 'week',
      from: '2026-11-09T00:00:00.000Z',
      to: '2026-11-15T23:59:59.999Z',
      deviceId: 'device-001',
      totalMeasurements: 0,
      totalConsumptionKwh: 0,
      averageConsumptionKwh: null,
      hasData: false,
      message: 'Not enough data to generate the report.',
    });
  });

  it('rejects an unsupported period or invalid date before querying', async () => {
    await expect(
      useCase.execute('year' as 'week', new Date()),
    ).rejects.toThrow(RangeError);
    await expect(
      useCase.execute('week', new Date('invalid')),
    ).rejects.toThrow(RangeError);

    expect(repository.findAll).not.toHaveBeenCalled();
  });
});
