import { loadLocalEnvFile, postgresConnectionOptions } from '@app/common';
import { DataSource } from 'typeorm';
import {
  IDENTITY_ACCESS_ORM_ENTITIES,
  IDENTITY_ACCESS_SCHEMA,
} from './identity-access.persistence';
import { InitialIdentityAccessSchema1791296250262 } from './migrations/1791296250262-InitialIdentityAccessSchema';

loadLocalEnvFile();

/**
 * Migration DataSource of this Bounded Context, used by the migration scripts
 * and by the TypeORM CLI to generate new migrations. Never synchronizes.
 */
export default new DataSource({
  ...postgresConnectionOptions(),
  schema: IDENTITY_ACCESS_SCHEMA,
  entities: IDENTITY_ACCESS_ORM_ENTITIES,
  migrations: [InitialIdentityAccessSchema1791296250262],
  synchronize: false,
});
