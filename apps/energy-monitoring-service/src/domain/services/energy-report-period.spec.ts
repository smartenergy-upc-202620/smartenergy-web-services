import {
  EnergyReportPeriod,
  resolveEnergyReportRange,
} from './energy-report-period';

const range = (period: EnergyReportPeriod, date: string) => {
  const { from, to } = resolveEnergyReportRange(period, new Date(date));
  return { from: from.toISOString(), to: to.toISOString() };
};

describe('Energy report period - US06', () => {
  it('week starting on a Monday UTC', () => {
    expect(range('week', '2026-11-09T00:00:00.000Z')).toEqual({
      from: '2026-11-09T00:00:00.000Z',
      to: '2026-11-15T23:59:59.999Z',
    });
  });

  it('week from a mid-week date', () => {
    expect(range('week', '2026-11-12T15:30:00.000Z')).toEqual({
      from: '2026-11-09T00:00:00.000Z',
      to: '2026-11-15T23:59:59.999Z',
    });
  });

  it('week ending on Sunday belongs to the same week', () => {
    expect(range('week', '2026-11-15T23:59:59.999Z')).toEqual({
      from: '2026-11-09T00:00:00.000Z',
      to: '2026-11-15T23:59:59.999Z',
    });
  });

  it('week crossing a month boundary', () => {
    expect(range('week', '2026-12-01T10:00:00.000Z')).toEqual({
      from: '2026-11-30T00:00:00.000Z',
      to: '2026-12-06T23:59:59.999Z',
    });
  });

  it('month of 30 days', () => {
    expect(range('month', '2026-11-10T08:00:00.000Z')).toEqual({
      from: '2026-11-01T00:00:00.000Z',
      to: '2026-11-30T23:59:59.999Z',
    });
  });

  it('month of 31 days', () => {
    expect(range('month', '2026-12-31T23:59:59.999Z')).toEqual({
      from: '2026-12-01T00:00:00.000Z',
      to: '2026-12-31T23:59:59.999Z',
    });
  });

  it('February in a common year and in a leap year', () => {
    expect(range('month', '2026-02-15T00:00:00.000Z').to).toBe(
      '2026-02-28T23:59:59.999Z',
    );
    expect(range('month', '2028-02-15T00:00:00.000Z').to).toBe(
      '2028-02-29T23:59:59.999Z',
    );
  });

  it('rejects an invalid reference date', () => {
    expect(() =>
      resolveEnergyReportRange('week', new Date('invalid')),
    ).toThrow(RangeError);
  });

  it('rejects an unsupported period at runtime', () => {
    expect(() =>
      resolveEnergyReportRange('year' as EnergyReportPeriod, new Date()),
    ).toThrow(RangeError);
  });
});
