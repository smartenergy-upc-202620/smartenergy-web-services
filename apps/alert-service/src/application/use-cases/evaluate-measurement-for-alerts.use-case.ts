import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Alert } from '../../domain/entities/alert.entity';
import {
  ALERT_RULE_REPOSITORY,
  AlertRuleRepository,
} from '../../domain/repositories/alert-rule.repository';
import {
  ALERT_REPOSITORY,
  AlertRepository,
} from '../../domain/repositories/alert.repository';
import {
  ALERT_EVALUATION_STRATEGY,
  AlertEvaluationStrategy,
  ConsumptionReading,
} from '../../domain/services/alert-evaluation.strategy';

export interface EvaluationResult {
  evaluatedRules: number;
  alerts: Alert[];
}

/**
 * Evaluates a consumption reading against every active rule and stores the
 * alerts raised. Sprint 1 triggers it explicitly through REST.
 */
@Injectable()
export class EvaluateMeasurementForAlertsUseCase {
  constructor(
    @Inject(ALERT_RULE_REPOSITORY) private readonly rules: AlertRuleRepository,
    @Inject(ALERT_REPOSITORY) private readonly alerts: AlertRepository,
    @Inject(ALERT_EVALUATION_STRATEGY)
    private readonly strategy: AlertEvaluationStrategy,
  ) {}

  async execute(reading: ConsumptionReading): Promise<EvaluationResult> {
    const activeRules = await this.rules.findActive();
    const raised: Alert[] = [];

    for (const rule of activeRules) {
      const message = this.strategy.evaluate(rule, reading);
      if (message === null) continue;

      const alert = new Alert({
        id: randomUUID(),
        ruleId: rule.id,
        deviceId: reading.deviceId,
        consumptionKwh: reading.consumptionKwh,
        message,
        createdAt: new Date(),
      });
      await this.alerts.save(alert);
      raised.push(alert);
    }

    return { evaluatedRules: activeRules.length, alerts: raised };
  }
}
