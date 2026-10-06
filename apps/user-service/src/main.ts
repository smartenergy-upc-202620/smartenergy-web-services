import { bootstrapService } from '@app/common';
import { AppModule } from './app.module';

void bootstrapService({
  module: AppModule,
  serviceName: 'user-service',
  title: 'SmartEnergy - User Service',
  description:
    'Identity & Access Context: users, authentication and basic authorization.',
  portEnvKey: 'USER_SERVICE_PORT',
  defaultPort: 3001,
});
