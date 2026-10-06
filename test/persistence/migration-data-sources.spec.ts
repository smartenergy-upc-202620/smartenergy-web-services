import { readdirSync } from 'fs';
import { join, resolve } from 'path';
import { DataSource } from 'typeorm';
import alertingDataSource from '../../apps/alert-service/src/infrastructure/persistence/typeorm/alerting.data-source';
import {
  ALERTING_ORM_ENTITIES,
  ALERTING_SCHEMA,
} from '../../apps/alert-service/src/infrastructure/persistence/typeorm/alerting.persistence';
import energyDataSource from '../../apps/energy-monitoring-service/src/infrastructure/persistence/typeorm/energy-monitoring.data-source';
import {
  ENERGY_MONITORING_ORM_ENTITIES,
  ENERGY_MONITORING_SCHEMA,
} from '../../apps/energy-monitoring-service/src/infrastructure/persistence/typeorm/energy-monitoring.persistence';
import identityDataSource from '../../apps/user-service/src/infrastructure/persistence/typeorm/identity-access.data-source';
import {
  IDENTITY_ACCESS_ORM_ENTITIES,
  IDENTITY_ACCESS_SCHEMA,
} from '../../apps/user-service/src/infrastructure/persistence/typeorm/identity-access.persistence';

/**
 * Each Bounded Context migrates only its own schema and entities, and every
 * migration file on disk is registered (a generated but unregistered
 * migration would silently never run in production).
 */
const ROOT = resolve(__dirname, '..', '..');

describe.each([
  [
    'user-service',
    identityDataSource,
    IDENTITY_ACCESS_SCHEMA,
    IDENTITY_ACCESS_ORM_ENTITIES,
  ],
  [
    'energy-monitoring-service',
    energyDataSource,
    ENERGY_MONITORING_SCHEMA,
    ENERGY_MONITORING_ORM_ENTITIES,
  ],
  ['alert-service', alertingDataSource, ALERTING_SCHEMA, ALERTING_ORM_ENTITIES],
] as [string, DataSource, string, unknown[]][])(
  'Migration DataSource of %s',
  (app, dataSource, schema, entities) => {
    const { options } = dataSource as unknown as {
      options: {
        schema: string;
        entities: unknown[];
        migrations: { name: string }[];
        synchronize: boolean;
      };
    };

    it('targets only the schema and entities of its context', () => {
      expect(options.schema).toBe(schema);
      expect(options.entities).toEqual(entities);
      expect(options.synchronize).toBe(false);
    });

    it('registers every migration file of the context', () => {
      const dir = join(
        ROOT,
        'apps',
        app,
        'src/infrastructure/persistence/typeorm/migrations',
      );
      const onDisk = readdirSync(dir)
        .filter((f) => f.endsWith('.ts') && !f.endsWith('.spec.ts'))
        .map((f) => {
          const [timestamp, name] = f.replace(/\.ts$/, '').split('-');
          return `${name}${timestamp}`;
        })
        .sort();

      expect(options.migrations.map((m) => m.name).sort()).toEqual(onDisk);
    });
  },
);
