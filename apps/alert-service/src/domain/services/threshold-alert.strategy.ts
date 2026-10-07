import { AlertRule } from '../entities/alert-rule.entity';
import {
  AlertEvaluationStrategy,
  ConsumptionReading,
} from './alert-evaluation.strategy';

/** Fires when an active rule's threshold is strictly exceeded. */
export class ThresholdAlertStrategy implements AlertEvaluationStrategy {
  evaluate(rule: AlertRule, reading: ConsumptionReading): string | null {
    if (!rule.active || reading.consumptionKwh <= rule.thresholdKwh) {
      return null;
    }
    return (
      `Device "${reading.deviceId}" consumed ${reading.consumptionKwh} kWh, ` +
      `exceeding the ${rule.thresholdKwh} kWh threshold of rule "${rule.name}"`
    );
  }
}
