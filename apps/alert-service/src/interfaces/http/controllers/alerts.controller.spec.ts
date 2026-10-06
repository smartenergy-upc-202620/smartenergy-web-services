import {
  HttpTestApp,
  startHttpTestApp,
} from '../../../../../../test/support/http-test-app';
import { CreateAlertRuleUseCase } from '../../../application/use-cases/create-alert-rule.use-case';
import { EvaluateMeasurementForAlertsUseCase } from '../../../application/use-cases/evaluate-measurement-for-alerts.use-case';
import { GetAlertByIdUseCase } from '../../../application/use-cases/get-alert-by-id.use-case';
import { ListAlertRulesUseCase } from '../../../application/use-cases/list-alert-rules.use-case';
import { ListAlertsUseCase } from '../../../application/use-cases/list-alerts.use-case';
import { AlertRule } from '../../../domain/entities/alert-rule.entity';
import { Alert } from '../../../domain/entities/alert.entity';
import {
  ALERT_RULE_REPOSITORY,
  AlertRuleRepository,
} from '../../../domain/repositories/alert-rule.repository';
import {
  ALERT_REPOSITORY,
  AlertRepository,
} from '../../../domain/repositories/alert.repository';
import { ALERT_EVALUATION_STRATEGY } from '../../../domain/services/alert-evaluation.strategy';
import { ThresholdAlertStrategy } from '../../../domain/services/threshold-alert.strategy';
import { ALERT_ERROR_STATUSES } from '../error-statuses';
import { AlertRulesController } from './alert-rules.controller';
import { AlertsController } from './alerts.controller';

class InMemoryAlertRuleRepository implements AlertRuleRepository {
  readonly items: AlertRule[] = [];

  save(rule: AlertRule): Promise<void> {
    this.items.push(rule);
    return Promise.resolve();
  }

  findAll(): Promise<AlertRule[]> {
    return Promise.resolve([...this.items].reverse());
  }

  findActive(): Promise<AlertRule[]> {
    return Promise.resolve(this.items.filter((r) => r.active));
  }
}

class InMemoryAlertRepository implements AlertRepository {
  private readonly items = new Map<string, Alert>();

  save(alert: Alert): Promise<void> {
    this.items.set(alert.id, alert);
    return Promise.resolve();
  }

  findById(id: string): Promise<Alert | null> {
    return Promise.resolve(this.items.get(id) ?? null);
  }

  findAll(): Promise<Alert[]> {
    return Promise.resolve([...this.items.values()].reverse());
  }
}

describe('Alert rules & alerts HTTP API (alert-service)', () => {
  let api: HttpTestApp;

  beforeAll(async () => {
    api = await startHttpTestApp(
      {
        controllers: [AlertRulesController, AlertsController],
        providers: [
          CreateAlertRuleUseCase,
          ListAlertRulesUseCase,
          EvaluateMeasurementForAlertsUseCase,
          ListAlertsUseCase,
          GetAlertByIdUseCase,
          {
            provide: ALERT_RULE_REPOSITORY,
            useValue: new InMemoryAlertRuleRepository(),
          },
          {
            provide: ALERT_REPOSITORY,
            useValue: new InMemoryAlertRepository(),
          },
          {
            provide: ALERT_EVALUATION_STRATEGY,
            useClass: ThresholdAlertStrategy,
          },
        ],
      },
      ALERT_ERROR_STATUSES,
    );
  });

  afterAll(() => api.close());

  it('POST /alert-rules creates an active rule', async () => {
    const res = await api.request('POST', '/api/v1/alert-rules', {
      body: { name: 'High consumption', thresholdKwh: 5.0 },
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      name: 'High consumption',
      thresholdKwh: 5,
      active: true,
      createdAt: expect.any(String),
    });
  });

  it('POST /alert-rules returns 400 for invalid data', async () => {
    const res = await api.request('POST', '/api/v1/alert-rules', {
      body: { name: '', thresholdKwh: 0 },
    });

    expect(res.status).toBe(400);
  });

  it('GET /alert-rules lists the rules', async () => {
    const res = await api.request('GET', '/api/v1/alert-rules');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('POST /alerts/evaluate does not raise alerts below the threshold', async () => {
    const res = await api.request('POST', '/api/v1/alerts/evaluate', {
      body: { deviceId: 'device-001', consumptionKwh: 3 },
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ evaluatedRules: 1, alerts: [] });
  });

  it('POST /alerts/evaluate raises an alert above the threshold, retrievable afterwards', async () => {
    const evaluation = await api.request('POST', '/api/v1/alerts/evaluate', {
      body: { deviceId: 'device-001', consumptionKwh: 8.2 },
    });

    expect(evaluation.status).toBe(200);
    expect(evaluation.body.alerts).toHaveLength(1);
    const [alert] = evaluation.body.alerts;
    expect(alert).toMatchObject({
      deviceId: 'device-001',
      consumptionKwh: 8.2,
    });

    const list = await api.request('GET', '/api/v1/alerts');
    const one = await api.request('GET', `/api/v1/alerts/${alert.id}`);

    expect(list.body).toEqual([alert]);
    expect(one.status).toBe(200);
    expect(one.body).toEqual(alert);
  });

  it('GET /alerts/:id returns 404 / 400 for unknown / invalid ids', async () => {
    const missing = await api.request(
      'GET',
      '/api/v1/alerts/00000000-0000-4000-8000-000000000000',
    );
    const invalid = await api.request('GET', '/api/v1/alerts/abc');

    expect(missing.status).toBe(404);
    expect(invalid.status).toBe(400);
  });
});
