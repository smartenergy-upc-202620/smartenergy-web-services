import { bootstrapService } from '@app/common';
import { AppModule } from './app.module';

void bootstrapService({
  module: AppModule,
  serviceName: 'alert-service',
  title: 'SmartEnergy - Alert Service',
  description: 'Alerting Context: alert rules and alerts.',
  portEnvKey: 'ALERT_SERVICE_PORT',
  defaultPort: 3003,
});
