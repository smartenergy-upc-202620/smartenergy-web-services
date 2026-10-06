import { loadLocalEnvFile, postgresConnectionOptions } from '@app/common';
import { DataSource } from 'typeorm';
import {
  ENERGY_MONITORING_ORM_ENTITIES,
  ENERGY_MONITORING_SCHEMA,
} from './energy-monitoring.persistence';
import { InitialEnergyMonitoringSchema1791296252925 } from './migrations/1791296252925-InitialEnergyMonitoringSchema';

loadLocalEnvFile();

/**
 * Migration DataSource of this Bounded Context, used by the migration scripts
 * and by the TypeORM CLI to generate new migrations. Never synchronizes.
 */
export default new DataSource({
  ...postgresConnectionOptions(),
  schema: ENERGY_MONITORING_SCHEMA,
  entities: ENERGY_MONITORING_ORM_ENTITIES,
  migrations: [InitialEnergyMonitoringSchema1791296252925],
  synchronize: false,
});
