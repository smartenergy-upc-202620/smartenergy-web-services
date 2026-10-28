import { BadRequestException } from '@nestjs/common';
import { EnergyMeasurement } from '../../domain/entities/energy-measurement.entity';
import { EnergyMeasurementRepository } from '../../domain/repositories/energy-measurement.repository';
import {
  CompareEnergyPeriodsRequest,
  CompareEnergyPeriodsUseCase,
} from './compare-energy-periods.use-case';

const request: CompareEnergyPeriodsRequest = {
  deviceId: 'device-001',
  baselineFrom: new Date('2026-10-01T00:00:00.000Z'),
  baselineTo: new Date('2026-10-07T23:59:59.999Z'),
  comparisonFrom: new Date('2026-10-08T00:00:00.000Z'),
  comparisonTo: new Date('2026-10-14T23:59:59.999Z'),
};

function reading(id: string, kwh: number, measuredAt: Date): EnergyMeasurement {
  return EnergyMeasurement.create({ id, deviceId: 'device-001', consumptionKwh: kwh, measuredAt });
}

describe('CompareEnergyPeriodsUseCase - US05', () => {
  const repo: jest.Mocked<EnergyMeasurementRepository> = {
    save: jest.fn(), findById: jest.fn(), findAll: jest.fn(),
  };
  const useCase = new CompareEnergyPeriodsUseCase(repo);

  beforeEach(() => jest.resetAllMocks());

  it('queries both ranges and compares measured totals', async () => {
    repo.findAll
      .mockResolvedValueOnce([reading('p', 120, request.baselineFrom)])
      .mockResolvedValueOnce([reading('c', 90, request.comparisonFrom)]);

    const result = await useCase.execute(request);
    expect(result.trend).toBe('decrease');
    expect(result.differenceKwh).toBe(-30);
    expect(result.percentageChange).toBe(-25);
    expect(repo.findAll).toHaveBeenNthCalledWith(1, {
      deviceId: 'device-001', from: request.baselineFrom, to: request.baselineTo,
    });
    expect(repo.findAll).toHaveBeenNthCalledWith(2, {
      deviceId: 'device-001', from: request.comparisonFrom, to: request.comparisonTo,
    });
  });

  it('returns insufficient data when a range has no measurements', async () => {
    repo.findAll.mockResolvedValueOnce([]).mockResolvedValueOnce([
      reading('c', 5, request.comparisonFrom),
    ]);
    const result = await useCase.execute(request);
    expect(result.hasSufficientData).toBe(false);
    expect(result.percentageChange).toBeNull();
    expect(result.baseline.totalConsumptionKwh).toBeNull();
  });

  it('rejects inverted periods, overlaps, and invalid dates before querying', async () => {
    await expect(useCase.execute({ ...request, baselineTo: new Date('2026-09-30') }))
      .rejects.toThrow(BadRequestException);
    await expect(useCase.execute({ ...request, comparisonFrom: new Date('2026-10-07') }))
      .rejects.toThrow(BadRequestException);
    await expect(useCase.execute({ ...request, comparisonTo: new Date('invalid') }))
      .rejects.toThrow(BadRequestException);
    expect(repo.findAll).not.toHaveBeenCalled();
  });
});
