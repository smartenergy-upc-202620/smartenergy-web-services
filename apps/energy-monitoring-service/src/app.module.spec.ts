import { Test } from '@nestjs/testing';
import { HealthController } from '@app/common';
import { DataSource } from 'typeorm';
import { fakeDataSource } from '../../../test/support/http-test-app';
import { AppModule } from './app.module';

describe('AppModule (energy-monitoring-service)', () => {
  it('exposes the health check of energy-monitoring-service', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue(fakeDataSource)
      .compile();

    const result = moduleRef.get(HealthController).check();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('energy-monitoring-service');
  });
});
