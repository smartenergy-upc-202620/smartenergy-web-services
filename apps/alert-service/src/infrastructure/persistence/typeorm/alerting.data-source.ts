import { loadLocalEnvFile, postgresConnectionOptions } from '@app/common';
import { DataSource } from 'typeorm';
import { ALERTING_ORM_ENTITIES, ALERTING_SCHEMA } from './alerting.persistence';
import { InitialAlertingSchema1791296254937 } from './migrations/1791296254937-InitialAlertingSchema';

loadLocalEnvFile();

/**
 * Migration DataSource of this Bounded Context, used by the migration scripts
 * and by the TypeORM CLI to generate new migrations. Never synchronizes.
 */
export default new DataSource({
  ...postgresConnectionOptions(),
  schema: ALERTING_SCHEMA,
  entities: ALERTING_ORM_ENTITIES,
  migrations: [InitialAlertingSchema1791296254937],
  synchronize: false,
});
