
import { calculateEstimatedCost } from './energy-cost-calculator';

describe('calculateEstimatedCost - US03', () => {
  it('calculates the estimated cost in PEN', () => {
    expect(calculateEstimatedCost(15, 0.7)).toBe(10.5);
  });

  it('returns zero when consumption is zero', () => {
    expect(calculateEstimatedCost(0, 0.7)).toBe(0);
  });

  it('rejects negative consumption', () => {
    expect(() => calculateEstimatedCost(-5, 0.7)).toThrow(
      RangeError,
    );
  });

  it('rejects an invalid tariff', () => {
    expect(() => calculateEstimatedCost(10, 0)).toThrow(
      RangeError,
    );
  });

  it('rejects non-finite values', () => {
    expect(() => calculateEstimatedCost(NaN, 0.7)).toThrow(
      RangeError,
    );
    expect(() => calculateEstimatedCost(10, Infinity)).toThrow(
      RangeError,
    );
  });
});
