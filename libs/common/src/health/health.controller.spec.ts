import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthModule } from './health.module';

describe('HealthController', () => {
  it('reports the status of the registered service', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HealthModule.register('alert-service')],
    }).compile();

    const result = moduleRef.get(HealthController).check();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('alert-service');
    expect(new Date(result.timestamp).toString()).not.toBe('Invalid Date');
  });
});
