import { gatewayConfig } from './gateway.config';

describe('gatewayConfig', () => {
  const keys = ['USER_SERVICE_URL', 'ENERGY_SERVICE_URL', 'ALERT_SERVICE_URL'];
  const original = Object.fromEntries(keys.map((k) => [k, process.env[k]]));

  afterEach(() => {
    for (const key of keys) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  });

  it('falls back to local default URLs', () => {
    keys.forEach((k) => delete process.env[k]);

    expect(gatewayConfig()).toEqual({
      userServiceUrl: 'http://localhost:3001',
      energyMonitoringServiceUrl: 'http://localhost:3002',
      alertServiceUrl: 'http://localhost:3003',
    });
  });

  it('reads URLs from the environment', () => {
    process.env.USER_SERVICE_URL = 'http://user-service:3001';

    expect(gatewayConfig().userServiceUrl).toBe('http://user-service:3001');
  });
});
