import {
  HttpTestApp,
  startHttpTestApp,
} from '../../../../../../test/support/http-test-app';
import { CreateEnergyMeasurementUseCase } from '../../../application/use-cases/create-energy-measurement.use-case';
import { GetEnergyConsumptionSummaryUseCase } from '../../../application/use-cases/get-energy-consumption-summary.use-case';
import { GetEnergyMeasurementByIdUseCase } from '../../../application/use-cases/get-energy-measurement-by-id.use-case';
import { ListEnergyMeasurementsUseCase } from '../../../application/use-cases/list-energy-measurements.use-case';
import { EnergyMeasurement } from '../../../domain/entities/energy-measurement.entity';
import {
  ENERGY_MEASUREMENT_REPOSITORY,
  EnergyMeasurementFilter,
  EnergyMeasurementRepository,
} from '../../../domain/repositories/energy-measurement.repository';
import { ENERGY_ERROR_STATUSES } from '../error-statuses';
import { EnergyMeasurementsController } from './energy-measurements.controller';

class InMemoryEnergyMeasurementRepository implements EnergyMeasurementRepository {
  private readonly items = new Map<string, EnergyMeasurement>();

  save(measurement: EnergyMeasurement): Promise<void> {
    this.items.set(measurement.id, measurement);
    return Promise.resolve();
  }

  findById(id: string): Promise<EnergyMeasurement | null> {
    return Promise.resolve(this.items.get(id) ?? null);
  }

  findAll(filter: EnergyMeasurementFilter = {}): Promise<EnergyMeasurement[]> {
    return Promise.resolve(
      [...this.items.values()]
        .filter((m) => !filter.deviceId || m.deviceId === filter.deviceId)
        .sort((a, b) => b.measuredAt.getTime() - a.measuredAt.getTime()),
    );
  }
}

describe('Energy measurements HTTP API (energy-monitoring-service)', () => {
  let api: HttpTestApp;

  beforeAll(async () => {
    api = await startHttpTestApp(
      {
        controllers: [EnergyMeasurementsController],
        providers: [
          CreateEnergyMeasurementUseCase,
          ListEnergyMeasurementsUseCase,
          GetEnergyMeasurementByIdUseCase,
          GetEnergyConsumptionSummaryUseCase,
          {
            provide: ENERGY_MEASUREMENT_REPOSITORY,
            useValue: new InMemoryEnergyMeasurementRepository(),
          },
        ],
      },
      ENERGY_ERROR_STATUSES,
    );
  });

  afterAll(() => api.close());

  const create = (deviceId: string, consumptionKwh: number, at: string) =>
    api.request('POST', '/api/v1/measurements', {
      body: { deviceId, consumptionKwh, measuredAt: at },
    });

  it('POST /measurements registers a measurement with a backend id', async () => {
    const res = await create('device-001', 3.75, '2026-10-06T10:30:00.000Z');

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      deviceId: 'device-001',
      consumptionKwh: 3.75,
      measuredAt: '2026-10-06T10:30:00.000Z',
    });
  });

  it('POST /measurements returns 400 for invalid data', async () => {
    const res = await api.request('POST', '/api/v1/measurements', {
      body: { deviceId: '', consumptionKwh: -1, measuredAt: 'yesterday' },
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toHaveLength(3);
  });

  it('POST /measurements rejects unknown fields', async () => {
    const res = await api.request('POST', '/api/v1/measurements', {
      body: {
        id: 'client-id',
        deviceId: 'd',
        consumptionKwh: 1,
        measuredAt: '2026-10-06T10:30:00.000Z',
      },
    });

    expect(res.status).toBe(400);
  });

  it('GET /measurements lists and filters by deviceId', async () => {
    await create('device-002', 6.25, '2026-10-06T11:00:00.000Z');

    const all = await api.request('GET', '/api/v1/measurements');
    const filtered = await api.request(
      'GET',
      '/api/v1/measurements?deviceId=device-002',
    );

    expect(all.status).toBe(200);
    expect(all.body).toHaveLength(2);
    expect(all.body[0].deviceId).toBe('device-002');
    expect(filtered.body).toHaveLength(1);
  });

  it('GET /measurements/summary is not captured by /:id', async () => {
    const res = await api.request('GET', '/api/v1/measurements/summary');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      totalMeasurements: 2,
      totalConsumptionKwh: 10,
      averageConsumptionKwh: 5,
    });
  });

  it('GET /measurements/:id returns the measurement', async () => {
    const created = await create('device-003', 1, '2026-10-06T12:00:00.000Z');

    const res = await api.request(
      'GET',
      `/api/v1/measurements/${created.body.id}`,
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual(created.body);
  });

  it('GET /measurements/:id returns 404 / 400 for unknown / invalid ids', async () => {
    const missing = await api.request(
      'GET',
      '/api/v1/measurements/00000000-0000-4000-8000-000000000000',
    );
    const invalid = await api.request('GET', '/api/v1/measurements/abc');

    expect(missing.status).toBe(404);
    expect(missing.body.error).toBe('Not Found');
    expect(invalid.status).toBe(400);
  });
});
