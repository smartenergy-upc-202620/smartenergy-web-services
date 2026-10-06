import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigModule, HealthModule } from '@app/common';
import { gatewayConfig } from './infrastructure/configuration/gateway.config';

@Module({
  imports: [
    AppConfigModule,
    ConfigModule.forFeature(gatewayConfig),
    HealthModule.register('api-gateway'),
  ],
})
export class AppModule {}
