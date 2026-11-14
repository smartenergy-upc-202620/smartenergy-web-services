export type EnergyReportPeriod = 'week' | 'month';

export interface EnergyReportRange {
  from: Date;
  to: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Resolves the UTC range (inclusive) of the week (Monday-Sunday) or calendar
 * month that contains `referenceDate`.
 */
export function resolveEnergyReportRange(
  period: EnergyReportPeriod,
  referenceDate: Date,
): EnergyReportRange {
  if (!(referenceDate instanceof Date) || !Number.isFinite(referenceDate.getTime())) {
    throw new RangeError('Invalid reference date');
  }

  const year = referenceDate.getUTCFullYear();
  const month = referenceDate.getUTCMonth();

  if (period === 'month') {
    return {
      from: new Date(Date.UTC(year, month, 1)),
      to: new Date(Date.UTC(year, month + 1, 1) - 1),
    };
  }

  if (period === 'week') {
    const day = Date.UTC(year, month, referenceDate.getUTCDate());
    const daysSinceMonday = (referenceDate.getUTCDay() + 6) % 7;
    const from = day - daysSinceMonday * DAY_MS;
    return { from: new Date(from), to: new Date(from + 7 * DAY_MS - 1) };
  }

  throw new RangeError('Unsupported report period');
}
