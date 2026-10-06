import { AlertRuleRepository } from '../../domain/repositories/alert-rule.repository';
import { AlertRepository } from '../../domain/repositories/alert.repository';
import { ListAlertRulesUseCase } from './list-alert-rules.use-case';
import { ListAlertsUseCase } from './list-alerts.use-case';

describe('ListAlertsUseCase', () => {
  it('returns the stored alerts', async () => {
    const alerts: jest.Mocked<AlertRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
    };

    await expect(new ListAlertsUseCase(alerts).execute()).resolves.toEqual([]);
    expect(alerts.findAll).toHaveBeenCalled();
  });
});

describe('ListAlertRulesUseCase', () => {
  it('returns the stored rules', async () => {
    const rules: jest.Mocked<AlertRuleRepository> = {
      save: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
      findActive: jest.fn(),
    };

    await expect(new ListAlertRulesUseCase(rules).execute()).resolves.toEqual(
      [],
    );
    expect(rules.findAll).toHaveBeenCalled();
  });
});
