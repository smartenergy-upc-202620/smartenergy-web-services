import { DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { databaseConfig } from '../config/database.config';

/**
 * Connects a service to the shared PostgreSQL instance, restricted to the
 * schema owned by its Bounded Context. Tables are created by the context's
 * migrations; `synchronize` is only an opt-in shortcut outside production.
 */
export function postgresTypeOrmModule(
  schema: string,
  entities: DataSourceOptions['entities'],
): DynamicModule {
  return TypeOrmModule.forRootAsync({
    imports: [ConfigModule.forFeature(databaseConfig)],
    inject: [databaseConfig.KEY],
    useFactory: (db: ConfigType<typeof databaseConfig>) => ({
      ...db,
      schema,
      entities,
    }),
    // TypeORM synchronization does not create schemas, so the owning service
    // creates its own schema first.
    dataSourceFactory: async (options) => {
      const dataSource = new DataSource({
        ...(options as DataSourceOptions),
        synchronize: false,
      });
      await dataSource.initialize();
      if (options?.synchronize) {
        await dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
        await dataSource.synchronize();
      }
      return dataSource;
    },
  });
}
