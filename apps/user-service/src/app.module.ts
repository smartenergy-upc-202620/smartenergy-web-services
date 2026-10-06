import { Module } from '@nestjs/common';
import { AppConfigModule, HealthModule } from '@app/common';

@Module({
  imports: [AppConfigModule, HealthModule.register('user-service')],
})
export class AppModule {}
