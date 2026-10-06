import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import {
  HttpTestApp,
  startHttpTestApp,
} from '../../../../../../test/support/http-test-app';
import { AppModule } from '../../../app.module';

/** Fake downstream service that echoes what it received. */
function startEchoService(name: string): Promise<Server> {
  const server = createServer((req, res) => {
    let raw = '';
    req.on('data', (chunk: Buffer) => (raw += chunk.toString()));
    req.on('end', () => {
      if (req.url?.endsWith('/health')) {
        res.writeHead(200, { 'content-type': 'application/json' });
        return res.end(JSON.stringify({ status: 'ok' }));
      }
      const status = req.url?.includes('missing')
        ? 404
        : req.method === 'POST'
          ? 201
          : 200;
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify({
          service: name,
          method: req.method,
          url: req.url,
          authorization: req.headers.authorization ?? null,
          body: raw ? (JSON.parse(raw) as unknown) : null,
        }),
      );
    });
  });
  return new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve(server)),
  );
}

const urlOf = (server: Server) =>
  `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

describe('API Gateway routing (Facade)', () => {
  const ENV_KEYS = [
    'USER_SERVICE_URL',
    'ENERGY_SERVICE_URL',
    'ALERT_SERVICE_URL',
  ];
  const originalEnv = Object.fromEntries(
    ENV_KEYS.map((k) => [k, process.env[k]]),
  );
  let upstreams: Server[];
  let gateway: HttpTestApp;

  beforeAll(async () => {
    upstreams = await Promise.all(
      ['user-service', 'energy-monitoring-service', 'alert-service'].map(
        startEchoService,
      ),
    );
    ENV_KEYS.forEach((key, i) => (process.env[key] = urlOf(upstreams[i])));
    gateway = await startHttpTestApp({ imports: [AppModule] });
  });

  afterAll(async () => {
    await gateway.close();
    await Promise.all(
      upstreams.map((s) => new Promise((resolve) => s.close(resolve))),
    );
    for (const key of ENV_KEYS) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
  });

  const id = '6b0f4a52-1d3e-4c8a-9b8e-0c5a7d2f9e31';

  it.each([
    ['POST', '/api/v1/auth/register', 'user-service'],
    ['POST', '/api/v1/auth/login', 'user-service'],
    ['GET', '/api/v1/users/me', 'user-service'],
    ['POST', '/api/v1/measurements', 'energy-monitoring-service'],
    ['GET', '/api/v1/measurements', 'energy-monitoring-service'],
    ['GET', '/api/v1/measurements/summary', 'energy-monitoring-service'],
    ['GET', `/api/v1/measurements/${id}`, 'energy-monitoring-service'],
    ['POST', '/api/v1/alert-rules', 'alert-service'],
    ['GET', '/api/v1/alert-rules', 'alert-service'],
    ['POST', '/api/v1/alerts/evaluate', 'alert-service'],
    ['GET', '/api/v1/alerts', 'alert-service'],
    ['GET', `/api/v1/alerts/${id}`, 'alert-service'],
  ])('%s %s is routed to %s', async (method, path, service) => {
    const res = await gateway.request(method, path, {
      body: method === 'POST' ? {} : undefined,
    });

    expect(res.body).toMatchObject({ service, method, url: path });
    expect(res.status).toBe(method === 'POST' ? 201 : 200);
  });

  it('preserves the body, query string and Authorization header', async () => {
    const body = { deviceId: 'device-001', consumptionKwh: 3.75 };

    const post = await gateway.request('POST', '/api/v1/measurements', {
      body,
      headers: { authorization: 'Bearer token-123' },
    });
    const get = await gateway.request(
      'GET',
      '/api/v1/measurements?deviceId=device-001',
    );

    expect(post.body.body).toEqual(body);
    expect(post.body.authorization).toBe('Bearer token-123');
    expect(get.body.url).toBe('/api/v1/measurements?deviceId=device-001');
  });

  it('passes downstream error status codes through', async () => {
    const res = await gateway.request('GET', '/api/v1/alerts/missing');

    expect(res.status).toBe(404);
  });

  it('GET /system/health reports every downstream service', async () => {
    const res = await gateway.request('GET', '/api/v1/system/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      services: [
        { service: 'user-service', status: 'up' },
        { service: 'energy-monitoring-service', status: 'up' },
        { service: 'alert-service', status: 'up' },
      ],
    });
  });

  it('keeps answering its own health check', async () => {
    const res = await gateway.request('GET', '/api/v1/health');

    expect(res.body).toMatchObject({ status: 'ok', service: 'api-gateway' });
  });
});
