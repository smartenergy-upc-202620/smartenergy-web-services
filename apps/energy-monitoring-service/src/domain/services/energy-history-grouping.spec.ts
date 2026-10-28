
import { EnergyMeasurement } from '../entities/energy-measurement.entity';
import { groupEnergyMeasurements } from './energy-history-grouping';

function measurement(
  id: string,
  measuredAt: string,
  consumptionKwh: number,
): EnergyMeasurement {
  return EnergyMeasurement.create({
    id,
    deviceId: 'device-001',
    measuredAt: new Date(measuredAt),
    consumptionKwh,
  });
}

describe('Energy history grouping - US04', () => {
  it('groups measurements by day', () => {
    const records = [
      measurement('m1', '2026-10-26T10:00:00Z', 3.75),
      measurement('m2', '2026-10-26T15:00:00Z', 4.25),
      measurement('m3', '2026-10-27T09:00:00Z', 4),
    ];

    expect(
      groupEnergyMeasurements(records, 'day'),
    ).toEqual([
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
    ]);
  });

  it('groups weeks starting on Monday', () => {
    const records = [
      measurement('m1', '2026-10-04T10:00:00Z', 2),
      measurement('m2', '2026-10-05T10:00:00Z', 3),
      measurement('m3', '2026-10-06T10:00:00Z', 4),
    ];

    expect(
      groupEnergyMeasurements(records, 'week'),
    ).toEqual([
      {
        period: '2026-09-28',
        totalMeasurements: 1,
        totalConsumptionKwh: 2,
      },
      {
        period: '2026-10-05',
        totalMeasurements: 2,
        totalConsumptionKwh: 7,
      },
    ]);
  });

  it('groups measurements by month', () => {
    const records = [
      measurement('m1', '2026-09-30T12:00:00Z', 5),
      measurement('m2', '2026-10-01T12:00:00Z', 6),
      measurement('m3', '2026-10-26T12:00:00Z', 4),
    ];

    expect(
      groupEnergyMeasurements(records, 'month'),
    ).toEqual([
      {
        period: '2026-09',
        totalMeasurements: 1,
        totalConsumptionKwh: 5,
      },
      {
        period: '2026-10',
        totalMeasurements: 2,
        totalConsumptionKwh: 10,
      },
    ]);
  });

  it('returns an empty array without measurements', () => {
    expect(
      groupEnergyMeasurements([], 'day'),
    ).toEqual([]);
  });

  it('rounds floating point totals to three decimals', () => {
    const records = [
      measurement('m1', '2026-10-26T10:00:00Z', 0.1),
      measurement('m2', '2026-10-26T11:00:00Z', 0.2),
    ];

    expect(
      groupEnergyMeasurements(records, 'day'),
    ).toEqual([
      {
        period: '2026-10-26',
        totalMeasurements: 2,
        totalConsumptionKwh: 0.3,
      },
    ]);
  });
});