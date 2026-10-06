import { Alert } from '../../domain/entities/alert.entity';
import { AlertRepository } from '../../domain/repositories/alert.repository';
import { AlertNotFoundException } from '../exceptions/alert-not-found.exception';
import { GetAlertByIdUseCase } from './get-alert-by-id.use-case';

describe('GetAlertByIdUseCase', () => {
  const alerts: jest.Mocked<AlertRepository> = {
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
  };
  const useCase = new GetAlertByIdUseCase(alerts);

  it('returns the stored alert', async () => {
    const alert = new Alert({
      id: 'alert-1',
      ruleId: 'rule-1',
      deviceId: 'device-001',
      consumptionKwh: 8.2,
      message: 'exceeded',
      createdAt: new Date(),
    });
    alerts.findById.mockResolvedValue(alert);

    await expect(useCase.execute('alert-1')).resolves.toBe(alert);
  });

  it('fails when the alert does not exist', async () => {
    alerts.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toThrow(
      AlertNotFoundException,
    );
  });
});
