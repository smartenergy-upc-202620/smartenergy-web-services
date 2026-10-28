import { EnergyMeasurement } from '../entities/energy-measurement.entity';
import { compareEnergyPeriods } from './energy-period-comparison';

const baseline = {
  from: new Date('2026-10-01T00:00:00.000Z'),
  to: new Date('2026-10-07T23:59:59.999Z'),
};
const comparison = {
  from: new Date('2026-10-08T00:00:00.000Z'),
  to: new Date('2026-10-14T23:59:59.999Z'),
};
function reading(id: string, consumptionKwh: number, at: string): EnergyMeasurement {
  return EnergyMeasurement.create({
    id, deviceId: 'device-001', consumptionKwh, measuredAt: new Date(at),
  });
}
const a = (n: number) => [reading('baseline', n, '2026-10-03T12:00:00.000Z')];
const b = (n: number) => [reading('comparison', n, '2026-10-10T12:00:00.000Z')];

describe('Compare energy periods - US05 (domain)', () => {
  it('identifies a 25% reduction and a -30 kWh difference', () => {
    const result = compareEnergyPeriods('device-001', a(120), b(90), baseline, comparison);
    expect(result).toMatchObject({
      hasSufficientData: true, differenceKwh: -30, percentageChange: -25,
      trend: 'decrease',
      baseline: { totalMeasurements: 1, totalConsumptionKwh: 120 },
      comparison: { totalMeasurements: 1, totalConsumptionKwh: 90 },
    });
  });

  it('detects an increase and an unchanged consumption', () => {
    expect(compareEnergyPeriods('d', a(10), b(15), baseline, comparison)).toMatchObject({
      differenceKwh: 5, percentageChange: 50, trend: 'increase',
    });
    expect(compareEnergyPeriods('d', a(10), b(10), baseline, comparison)).toMatchObject({
      differenceKwh: 0, percentageChange: 0, trend: 'no_change',
    });
  });

  it('reports missing measurements without inventing zero consumption', () => {
    const result = compareEnergyPeriods('d', [], b(5), baseline, comparison);
    expect(result).toMatchObject({
      hasSufficientData: false, differenceKwh: null, percentageChange: null,
      trend: 'insufficient_data', baseline: { totalConsumptionKwh: null, hasData: false },
    });
  });

  it('keeps zero consumption distinct from missing data', () => {
    const result = compareEnergyPeriods('d', a(0), b(5), baseline, comparison);
    expect(result).toMatchObject({
      hasSufficientData: true, differenceKwh: 5, percentageChange: null,
      trend: 'increase', baseline: { totalConsumptionKwh: 0, hasData: true },
    });
  });

  it('does not divide by zero when both measured periods have zero consumption', () => {
    const result = compareEnergyPeriods('d', a(0), b(0), baseline, comparison);
    expect(result).toMatchObject({
      hasSufficientData: true, differenceKwh: 0, percentageChange: null,
      trend: 'no_change',
    });
  });
});
