import { InvalidAlertRuleException } from '../../domain/exceptions/invalid-alert-rule.exception';
import { AlertRuleRepository } from '../../domain/repositories/alert-rule.repository';
import { CreateAlertRuleUseCase } from './create-alert-rule.use-case';

describe('CreateAlertRuleUseCase', () => {
  const rules: jest.Mocked<AlertRuleRepository> = {
    save: jest.fn().mockResolvedValue(undefined),
    findAll: jest.fn(),
    findActive: jest.fn(),
  };
  const useCase = new CreateAlertRuleUseCase(rules);

  beforeEach(() => jest.clearAllMocks());

  it('creates an active rule by default and stores it', async () => {
    const rule = await useCase.execute({
      name: 'High consumption',
      thresholdKwh: 5,
    });

    expect(rule.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(rule.active).toBe(true);
    expect(rule.thresholdKwh).toBe(5);
    expect(rule.createdAt).toBeInstanceOf(Date);
    expect(rules.save).toHaveBeenCalledWith(rule);
  });

  it('can create an inactive rule', async () => {
    const rule = await useCase.execute({
      name: 'Paused',
      thresholdKwh: 1,
      active: false,
    });

    expect(rule.active).toBe(false);
  });

  it('does not store an invalid rule', async () => {
    await expect(
      useCase.execute({ name: 'x', thresholdKwh: -1 }),
    ).rejects.toThrow(InvalidAlertRuleException);
    expect(rules.save).not.toHaveBeenCalled();
  });
});
