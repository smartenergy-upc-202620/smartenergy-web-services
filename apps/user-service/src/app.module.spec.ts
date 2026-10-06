import { Test } from '@nestjs/testing';
import { HealthController } from '@app/common';
import { AppModule } from './app.module';

describe('AppModule (user-service)', () => {
  it('exposes the health check of user-service', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const result = moduleRef.get(HealthController).check();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('user-service');
  });
});
