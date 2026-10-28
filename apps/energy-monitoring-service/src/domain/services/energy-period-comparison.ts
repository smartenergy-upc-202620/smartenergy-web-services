import { EnergyMeasurement } from '../entities/energy-measurement.entity';

export type ConsumptionTrend =
  | 'increase'
  | 'decrease'
  | 'no_change'
  | 'insufficient_data';

export interface PeriodConsumption {
  from: string;
  to: string;
  totalMeasurements: number;
  totalConsumptionKwh: number | null;
  hasData: boolean;
}

export interface EnergyPeriodComparison {
  deviceId: string;
  baseline: PeriodConsumption;
  comparison: PeriodConsumption;
  hasSufficientData: boolean;
  differenceKwh: number | null;
  percentageChange: number | null;
  trend: ConsumptionTrend;
  message: string;
}

const round3 = (value: number) => Math.round((value + Number.EPSILON) * 1000) / 1000;
const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

function summarize(
  records: readonly EnergyMeasurement[],
  from: Date,
  to: Date,
): PeriodConsumption {
  const hasData = records.length > 0;
  return {
    from: from.toISOString(),
    to: to.toISOString(),
    totalMeasurements: records.length,
    // Null, NOT zero, if the time range has no measurements.
    totalConsumptionKwh: hasData
      ? round3(records.reduce((sum, item) => sum + item.consumptionKwh, 0))
      : null,
    hasData,
  };
}

/** Pure domain function: compare two measured, non-overlapping periods. */
export function compareEnergyPeriods(
  deviceId: string,
  baselineRecords: readonly EnergyMeasurement[],
  comparisonRecords: readonly EnergyMeasurement[],
  baselineRange: { from: Date; to: Date },
  comparisonRange: { from: Date; to: Date },
): EnergyPeriodComparison {
  const baseline = summarize(baselineRecords, baselineRange.from, baselineRange.to);
  const comparison = summarize(comparisonRecords, comparisonRange.from, comparisonRange.to);

  if (!baseline.hasData || !comparison.hasData) {
    return {
      deviceId,
      baseline,
      comparison,
      hasSufficientData: false,
      differenceKwh: null,
      percentageChange: null,
      trend: 'insufficient_data',
      message: 'Not enough measurements to compare both periods.',
    };
  }

  const previous = baseline.totalConsumptionKwh!;
  const current = comparison.totalConsumptionKwh!;
  const differenceKwh = round3(current - previous);
  const trend: ConsumptionTrend =
    differenceKwh > 0 ? 'increase' : differenceKwh < 0 ? 'decrease' : 'no_change';

  return {
    deviceId,
    baseline,
    comparison,
    hasSufficientData: true,
    differenceKwh,
    percentageChange: previous === 0 ? null : round2((differenceKwh / previous) * 100),
    trend,
    message:
      previous === 0
        ? 'Percentage change is undefined when baseline consumption is zero.'
        : trend === 'increase'
          ? 'Energy consumption increased.'
          : trend === 'decrease'
            ? 'Energy consumption decreased.'
            : 'Energy consumption remained unchanged.',
  };
}
