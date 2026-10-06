import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

/**
 * Loads the `.env` file (variables already set in the environment win).
 * Import it once in the root module of every application. Feature
 * configuration (e.g. the database) is registered by the modules that use it,
 * so the API Gateway never requires database settings.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
    }),
  ],
})
export class AppConfigModule {}
