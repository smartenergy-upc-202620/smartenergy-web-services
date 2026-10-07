import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

type PostgresDataSourceOptions = Extract<
  DataSourceOptions,
  { type: 'postgres' }
>;

export type PostgresConnectionOptions = Pick<
  PostgresDataSourceOptions,
  | 'type'
  | 'url'
  | 'host'
  | 'port'
  | 'username'
  | 'password'
  | 'database'
  | 'ssl'
>;

const isTrue = (value?: string) => value?.trim().toLowerCase() === 'true';

/**
 * Builds the PostgreSQL connection from the environment.
 *
 * - `DATABASE_URL` (cloud providers) takes precedence over `POSTGRES_*`.
 * - `DB_SSL=true` enables TLS; `DB_SSL_REJECT_UNAUTHORIZED=false` accepts
 *   self-signed certificates. When `DB_SSL` is not `true`, the URL decides
 *   (e.g. `?sslmode=require`).
 * - Local defaults (localhost, smartenergy) are only used outside
 *   production; in production the connection must be fully configured.
 */
export function postgresConnectionOptions(
  env: NodeJS.ProcessEnv = process.env,
): PostgresConnectionOptions {
  const ssl = isTrue(env.DB_SSL)
    ? { rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
    : undefined;

  if (env.DATABASE_URL) {
    return { type: 'postgres', url: env.DATABASE_URL, ssl };
  }

  if (env.NODE_ENV === 'production') {
    const missing = [
      'POSTGRES_HOST',
      'POSTGRES_USER',
      'POSTGRES_PASSWORD',
      'POSTGRES_DB',
    ].filter((key) => !env[key]);
    if (missing.length > 0) {
      throw new Error(
        `Database is not configured: set DATABASE_URL or ${missing.join(', ')}`,
      );
    }
  }

  const port = Number(env.POSTGRES_PORT || 5432);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid POSTGRES_PORT: "${env.POSTGRES_PORT}"`);
  }

  return {
    type: 'postgres',
    host: env.POSTGRES_HOST || 'localhost',
    port,
    username: env.POSTGRES_USER || 'smartenergy',
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB || 'smartenergy',
    ssl,
  };
}

/**
 * TypeORM `synchronize` lets a service create its schema and tables without
 * migrations. Opt-in for throwaway development/test databases only
 * (`DB_SYNCHRONIZE=true`) and always off when NODE_ENV=production.
 */
export function isSynchronizeEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env.NODE_ENV !== 'production' && isTrue(env.DB_SYNCHRONIZE);
}

export const databaseConfig = registerAs('database', () => ({
  ...postgresConnectionOptions(),
  synchronize: isSynchronizeEnabled(),
}));
