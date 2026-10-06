import { Module } from '@nestjs/common';
import { AppConfigModule, HealthModule } from '@app/common';

@Module({
  imports: [AppConfigModule, HealthModule.register('alert-service')],
})
export class AppModule {}
