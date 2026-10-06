import { bootstrapService } from '@app/common';
import { AppModule } from './app.module';

void bootstrapService({
  module: AppModule,
  serviceName: 'api-gateway',
  title: 'SmartEnergy - API Gateway',
  description: 'Single entry point (Facade) of the SmartEnergy backend.',
  portEnvKey: 'API_GATEWAY_PORT',
  defaultPort: 3000,
  bearerAuth: true,
});
