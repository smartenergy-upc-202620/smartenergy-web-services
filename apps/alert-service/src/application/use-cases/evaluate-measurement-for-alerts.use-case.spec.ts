import { AlertRule } from '../../domain/entities/alert-rule.entity';
import { AlertRuleRepository } from '../../domain/repositories/alert-rule.repository';
import { AlertRepository } from '../../domain/repositories/alert.repository';
import { ThresholdAlertStrategy } from '../../domain/services/threshold-alert.strategy';
import { EvaluateMeasurementForAlertsUseCase } from './evaluate-measurement-for-alerts.use-case';

const rule = (id: string, thresholdKwh: number) =>
  AlertRule.create({
    id,
    name: `Rule ${id}`,
    thresholdKwh,
    active: true,
    createdAt: new Date(),
  });

describe('EvaluateMeasurementForAlertsUseCase', () => {
  let rules: jest.Mocked<AlertRuleRepository>;
  let alerts: jest.Mocked<AlertRepository>;
  let useCase: EvaluateMeasurementForAlertsUseCase;

  beforeEach(() => {
    rules = {
      save: jest.fn(),
      findAll: jest.fn(),
      findActive: jest
        .fn()
        .mockResolvedValue([rule('low', 5), rule('high', 10)]),
    };
    alerts = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    useCase = new EvaluateMeasurementForAlertsUseCase(
      rules,
      alerts,
      new ThresholdAlertStrategy(),
    );
  });

  it('creates one alert per exceeded active rule', async () => {
    const result = await useCase.execute({
      deviceId: 'device-001',
      consumptionKwh: 8.2,
    });

    expect(result.evaluatedRules).toBe(2);
    expect(result.alerts).toHaveLength(1);
    const [alert] = result.alerts;
    expect(alert.ruleId).toBe('low');
    expect(alert.deviceId).toBe('device-001');
    expect(alert.consumptionKwh).toBe(8.2);
    expect(alert.message).toContain('exceeding the 5 kWh threshold');
    expect(alerts.save).toHaveBeenCalledWith(alert);
  });

  it('creates no alert when no threshold is exceeded', async () => {
    const result = await useCase.execute({
      deviceId: 'device-001',
      consumptionKwh: 2,
    });

    expect(result).toEqual({ evaluatedRules: 2, alerts: [] });
    expect(alerts.save).not.toHaveBeenCalled();
  });

  it('delegates the decision to the injected strategy', async () => {
    const strategy = { evaluate: jest.fn().mockReturnValue('custom') };
    useCase = new EvaluateMeasurementForAlertsUseCase(rules, alerts, strategy);

    const result = await useCase.execute({
      deviceId: 'device-001',
      consumptionKwh: 0,
    });

    expect(strategy.evaluate).toHaveBeenCalledTimes(2);
    expect(result.alerts.map((a) => a.message)).toEqual(['custom', 'custom']);
  });
});
