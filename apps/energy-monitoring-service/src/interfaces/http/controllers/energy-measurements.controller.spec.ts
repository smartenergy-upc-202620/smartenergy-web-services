import {
  HttpTestApp,
  startHttpTestApp,
} from '../../../../../../test/support/http-test-app';
import { CreateEnergyMeasurementUseCase } from '../../../application/use-cases/create-energy-measurement.use-case';
import { GetEnergyConsumptionSummaryUseCase } from '../../../application/use-cases/get-energy-consumption-summary.use-case';
import { GetEnergyMeasurementByIdUseCase } from '../../../application/use-cases/get-energy-measurement-by-id.use-case';
import { ListEnergyMeasurementsUseCase } from '../../../application/use-cases/list-energy-measurements.use-case';
import { EnergyMeasurement } from '../../../domain/entities/energy-measurement.entity';
import { GetEstimatedEnergyCostUseCase } from '../../../application/use-cases/get-estimated-energy-cost.use-case';
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

  
  findAll(
    filter: EnergyMeasurementFilter = {},
  ): Promise<EnergyMeasurement[]> {
    const { deviceId, from, to } = filter;

    const measurements = [...this.items.values()]
      .filter((measurement) => {
        const measuredAt = measurement.measuredAt.getTime();

        return (
          (!deviceId || measurement.deviceId === deviceId) &&
          (!from || measuredAt >= from.getTime()) &&
          (!to || measuredAt <= to.getTime())
        );
      })
      .sort(
        (a, b) =>
          b.measuredAt.getTime() - a.measuredAt.getTime(),
      );

    return Promise.resolve(measurements);
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
          GetEstimatedEnergyCostUseCase,
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

  
  it('GET /measurements/estimated-cost calculates the cost in PEN', async () => {
    await create(
      'us03-http-001',
      3.75,
      '2026-10-26T12:00:00.000Z',
    );

    await create(
      'us03-http-001',
      4.25,
      '2026-10-26T13:00:00.000Z',
    );

    const res = await api.request(
      'GET',
      '/api/v1/measurements/estimated-cost?deviceId=us03-http-001&tariffPerKwh=0.7',
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      totalMeasurements: 2,
      totalConsumptionKwh: 8,
      tariffPerKwh: 0.7,
      estimatedCost: 5.6,
      currency: 'PEN',
    });
  });

  it('GET /measurements/estimated-cost rejects negative tariffs', async () => {
    const res = await api.request(
      'GET',
      '/api/v1/measurements/estimated-cost?tariffPerKwh=-1',
    );

    expect(res.status).toBe(400);
  });

  
  it('US04 filters consumption history by device and date range', async () => {
    await create(
      'us04-history',
      2,
      '2026-10-03T10:00:00.000Z',
    );

    await create(
      'us04-history',
      4,
      '2026-10-06T10:00:00.000Z',
    );

    await create(
      'us04-history',
      6,
      '2026-10-09T10:00:00.000Z',
    );

    await create(
      'us04-other-device',
      20,
      '2026-10-06T10:00:00.000Z',
    );

    const response = await api.request(
      'GET',
      '/api/v1/measurements?deviceId=us04-history' +
        '&from=2026-10-05T00:00:00.000Z' +
        '&to=2026-10-07T23:59:59.999Z',
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      deviceId: 'us04-history',
      consumptionKwh: 4,
      measuredAt: '2026-10-06T10:00:00.000Z',
    });
  });

  it('US04 rejects inverted and invalid date ranges', async () => {
    const inverted = await api.request(
      'GET',
      '/api/v1/measurements' +
        '?from=2026-10-10T00:00:00.000Z' +
        '&to=2026-10-01T00:00:00.000Z',
    );

    expect(inverted.status).toBe(400);

    const invalid = await api.request(
      'GET',
      '/api/v1/measurements?from=invalid-date',
    );

    expect(invalid.status).toBe(400);
  });

  it('US04 applies date filters to summary and US03 estimated cost', async () => {
    await create(
      'us04-summary',
      4,
      '2026-10-06T12:00:00.000Z',
    );

    await create(
      'us04-summary',
      6,
      '2026-10-10T12:00:00.000Z',
    );

    const filters =
      'deviceId=us04-summary' +
      '&from=2026-10-05T00:00:00.000Z' +
      '&to=2026-10-07T23:59:59.999Z';

    const summary = await api.request(
      'GET',
      `/api/v1/measurements/summary?${filters}`,
    );

    expect(summary.status).toBe(200);
    expect(summary.body).toEqual({
      totalMeasurements: 1,
      totalConsumptionKwh: 4,
      averageConsumptionKwh: 4,
    });

    const cost = await api.request(
      'GET',
      `/api/v1/measurements/estimated-cost?tariffPerKwh=0.7&${filters}`,
    );

    expect(cost.status).toBe(200);
    expect(cost.body).toMatchObject({
      totalMeasurements: 1,
      totalConsumptionKwh: 4,
      tariffPerKwh: 0.7,
      estimatedCost: 2.8,
      currency: 'PEN',
    });
  });

});
