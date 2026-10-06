import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './database.config';

/**
 * Loads the `.env` file and registers the shared configuration namespaces.
 * Import it once in the root module of every application.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      load: [databaseConfig],
    }),
  ],
})
export class AppConfigModule {}
