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
});
