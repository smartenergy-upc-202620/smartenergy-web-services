import { AlertRule } from '../entities/alert-rule.entity';

/** Consumption reading evaluated against the alert rules. */
export interface ConsumptionReading {
  deviceId: string;
  consumptionKwh: number;
}

/**
 * Strategy that decides whether a reading violates a rule. New kinds of rules
 * (e.g. daily accumulated consumption) add a new implementation.
 */
export interface AlertEvaluationStrategy {
  /** Returns the alert message when the rule is violated, otherwise `null`. */
  evaluate(rule: AlertRule, reading: ConsumptionReading): string | null;
}

export const ALERT_EVALUATION_STRATEGY = Symbol('ALERT_EVALUATION_STRATEGY');
