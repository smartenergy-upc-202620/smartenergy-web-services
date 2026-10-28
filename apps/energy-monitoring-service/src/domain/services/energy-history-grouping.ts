
import { EnergyMeasurement } from '../entities/energy-measurement.entity';

export type EnergyHistoryGranularity =
  | 'day'
  | 'week'
  | 'month';

export interface EnergyHistoryPeriod {
  period: string;
  totalMeasurements: number;
  totalConsumptionKwh: number;
}

const round = (value: number): number =>
  Math.round(value * 1000) / 1000;

function getPeriodKey(
  date: Date,
  granularity: EnergyHistoryGranularity,
): string {
  // Use UTC to avoid timezone-related grouping errors.
  const utcDate = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ),
  );

  if (granularity === 'day') {
    return utcDate.toISOString().slice(0, 10);
  }

  if (granularity === 'month') {
    return utcDate.toISOString().slice(0, 7);
  }

  // ISO-style weeks begin on Monday.
  const daysSinceMonday =
    (utcDate.getUTCDay() + 6) % 7;

  utcDate.setUTCDate(
    utcDate.getUTCDate() - daysSinceMonday,
  );

  return utcDate.toISOString().slice(0, 10);
}

export function groupEnergyMeasurements(
  measurements: readonly EnergyMeasurement[],
  granularity: EnergyHistoryGranularity,
): EnergyHistoryPeriod[] {
  const groups = new Map<
    string,
    {
      count: number;
      consumption: number;
    }
  >();

  for (const measurement of measurements) {
    const period = getPeriodKey(
      measurement.measuredAt,
      granularity,
    );

    const current = groups.get(period) ?? {
      count: 0,
      consumption: 0,
    };

    current.count += 1;
    current.consumption += measurement.consumptionKwh;

    groups.set(period, current);
  }

  return [...groups.entries()]
    .sort(([periodA], [periodB]) =>
      periodA.localeCompare(periodB),
    )
    .map(([period, values]) => ({
      period,
      totalMeasurements: values.count,
      totalConsumptionKwh: round(
        values.consumption,
      ),
    }));
}