import { registerAs } from '@nestjs/config';

/**
 * PostgreSQL connection settings, read from environment variables.
 * No default is provided for the password on purpose.
 */
export const databaseConfig = registerAs('database', () => ({
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
  username: process.env.POSTGRES_USER ?? 'smartenergy',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB ?? 'smartenergy',
  /**
   * Lets TypeORM create the service schema and create/update its tables.
   * Development/test convenience only: forced to `false` when
   * NODE_ENV=production, whatever DB_SYNCHRONIZE says. Versioned migrations
   * are future work.
   */
  synchronize:
    process.env.NODE_ENV !== 'production' &&
    (process.env.DB_SYNCHRONIZE ?? 'true') === 'true',
}));
