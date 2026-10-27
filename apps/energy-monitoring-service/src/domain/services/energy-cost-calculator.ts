
export function calculateEstimatedCost(
  consumptionKwh: number,
  tariffPerKwh: number,
): number {
  if (!Number.isFinite(consumptionKwh) || consumptionKwh < 0) {
    throw new RangeError(
      'consumptionKwh must be a non-negative finite number',
    );
  }

  if (!Number.isFinite(tariffPerKwh) || tariffPerKwh <= 0) {
    throw new RangeError(
      'tariffPerKwh must be a positive finite number',
    );
  }

  const estimatedCost = consumptionKwh * tariffPerKwh;

  return Math.round((estimatedCost + Number.EPSILON) * 100) / 100;
}
