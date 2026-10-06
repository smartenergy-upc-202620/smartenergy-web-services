import { DynamicModule } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { databaseConfig } from '../config/database.config';

/**
 * Connects a service to the shared PostgreSQL instance, restricted to the
 * schema owned by its Bounded Context.
 */
export function postgresTypeOrmModule(
  schema: string,
  entities: DataSourceOptions['entities'],
): DynamicModule {
  return TypeOrmModule.forRootAsync({
    inject: [databaseConfig.KEY],
    useFactory: (db: ConfigType<typeof databaseConfig>) => ({
      type: 'postgres',
      host: db.host,
      port: db.port,
      username: db.username,
      password: db.password,
      database: db.database,
      schema,
      entities,
      synchronize: db.synchronize,
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
