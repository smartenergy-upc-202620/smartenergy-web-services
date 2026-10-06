import { bootstrapService } from '@app/common';
import { AppModule } from './app.module';
import { USER_ERROR_STATUSES } from './interfaces/http/error-statuses';

void bootstrapService({
  module: AppModule,
  serviceName: 'user-service',
  title: 'SmartEnergy - User Service',
  description:
    'Identity & Access Context: users, authentication and basic authorization.',
  portEnvKey: 'USER_SERVICE_PORT',
  defaultPort: 3001,
  errorStatuses: USER_ERROR_STATUSES,
  bearerAuth: true,
});
