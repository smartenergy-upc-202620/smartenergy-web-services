import { EnergyMeasurement } from '../../domain/entities/energy-measurement.entity';
import { EnergyMeasurementRepository } from '../../domain/repositories/energy-measurement.repository';
import { GetEnergyConsumptionSummaryUseCase } from './get-energy-consumption-summary.use-case';

const measurement = (id: string, consumptionKwh: number) =>
  EnergyMeasurement.create({
    id,
    deviceId: 'device-001',
    consumptionKwh,
    measuredAt: new Date(),
  });

describe('GetEnergyConsumptionSummaryUseCase', () => {
  const measurements: jest.Mocked<EnergyMeasurementRepository> = {
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
  };
  const useCase = new GetEnergyConsumptionSummaryUseCase(measurements);

  it('computes count, total and average', async () => {
    measurements.findAll.mockResolvedValue(
      [3.75, 4.25, 2.5, 6, 4].map((kwh, i) => measurement(`m-${i}`, kwh)),
    );

    await expect(useCase.execute()).resolves.toEqual({
      totalMeasurements: 5,
      totalConsumptionKwh: 20.5,
      averageConsumptionKwh: 4.1,
    });
  });

  it('rounds floating point noise to 3 decimals', async () => {
    measurements.findAll.mockResolvedValue([
      measurement('a', 0.1),
      measurement('b', 0.2),
    ]);

    const summary = await useCase.execute();

    expect(summary.totalConsumptionKwh).toBe(0.3);
    expect(summary.averageConsumptionKwh).toBe(0.15);
  });

  it('returns zeros when there are no measurements', async () => {
    measurements.findAll.mockResolvedValue([]);

    await expect(useCase.execute({ deviceId: 'none' })).resolves.toEqual({
      totalMeasurements: 0,
      totalConsumptionKwh: 0,
      averageConsumptionKwh: 0,
    });
    expect(measurements.findAll).toHaveBeenCalledWith({ deviceId: 'none' });
  });
});
