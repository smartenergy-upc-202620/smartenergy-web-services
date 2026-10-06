import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigModule, HealthModule } from '@app/common';
import { gatewayConfig } from './infrastructure/configuration/gateway.config';
import { DownstreamProxy } from './infrastructure/http/downstream-proxy';
import { AlertingRoutesController } from './interfaces/http/controllers/alerting-routes.controller';
import { EnergyRoutesController } from './interfaces/http/controllers/energy-routes.controller';
import { IdentityRoutesController } from './interfaces/http/controllers/identity-routes.controller';
import { SystemHealthController } from './interfaces/http/controllers/system-health.controller';

@Module({
  imports: [
    AppConfigModule,
    ConfigModule.forFeature(gatewayConfig),
    HealthModule.register('api-gateway'),
  ],
  controllers: [
    IdentityRoutesController,
    EnergyRoutesController,
    AlertingRoutesController,
    SystemHealthController,
  ],
  providers: [DownstreamProxy],
})
export class AppModule {}
