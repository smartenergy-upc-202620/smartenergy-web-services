import { bootstrapService } from '@app/common';
import { AppModule } from './app.module';
import { ENERGY_ERROR_STATUSES } from './interfaces/http/error-statuses';

void bootstrapService({
  module: AppModule,
  serviceName: 'energy-monitoring-service',
  title: 'SmartEnergy - Energy Monitoring Service',
  description:
    'Energy Monitoring Context: energy measurements and consumption summaries.',
  portEnvKey: 'ENERGY_MONITORING_SERVICE_PORT',
  defaultPort: 3002,
  errorStatuses: ENERGY_ERROR_STATUSES,
});
