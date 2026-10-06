import { Test } from '@nestjs/testing';
import { HealthController } from '@app/common';
import { AppModule } from './app.module';

describe('AppModule (api-gateway)', () => {
  it('exposes the health check of api-gateway', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const result = moduleRef.get(HealthController).check();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('api-gateway');
  });

  describe('in production', () => {
    const overrides: Record<string, string> = {
      NODE_ENV: 'production',
      USER_SERVICE_URL: 'https://user.example.com',
      ENERGY_SERVICE_URL: 'https://energy.example.com',
      ALERT_SERVICE_URL: 'https://alert.example.com',
      // Empty values are "set", so a local .env cannot fill them in.
      DATABASE_URL: '',
      POSTGRES_HOST: '',
      POSTGRES_USER: '',
      POSTGRES_PASSWORD: '',
      POSTGRES_DB: '',
    };
    const original = Object.fromEntries(
      Object.keys(overrides).map((k) => [k, process.env[k]]),
    );

    beforeAll(() => Object.assign(process.env, overrides));

    afterAll(() => {
      for (const [key, value] of Object.entries(original)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    });

    it('starts without any database configuration', async () => {
      await expect(
        Test.createTestingModule({ imports: [AppModule] }).compile(),
      ).resolves.toBeDefined();
    });
  });
});
