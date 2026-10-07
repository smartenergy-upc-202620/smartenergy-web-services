import {
  databaseConfig,
  isSynchronizeEnabled,
  postgresConnectionOptions,
} from './database.config';

describe('isSynchronizeEnabled', () => {
  it('never synchronizes in production, even if DB_SYNCHRONIZE=true', () => {
    expect(
      isSynchronizeEnabled({ NODE_ENV: 'production', DB_SYNCHRONIZE: 'true' }),
    ).toBe(false);
  });

  it('is opt-in outside production (migrations are the default)', () => {
    expect(isSynchronizeEnabled({ NODE_ENV: 'development' })).toBe(false);
    expect(
      isSynchronizeEnabled({ NODE_ENV: 'development', DB_SYNCHRONIZE: 'true' }),
    ).toBe(true);
  });
});

describe('postgresConnectionOptions', () => {
  const cloudUrl = 'postgresql://app:secret@db.internal:5432/smartenergy';

  it('prefers DATABASE_URL over POSTGRES_*', () => {
    expect(
      postgresConnectionOptions({
        DATABASE_URL: cloudUrl,
        POSTGRES_HOST: 'ignored',
      }),
    ).toEqual({ type: 'postgres', url: cloudUrl, ssl: undefined });
  });

  it('uses POSTGRES_* with local defaults outside production', () => {
    expect(
      postgresConnectionOptions({
        NODE_ENV: 'development',
        POSTGRES_PASSWORD: 'pw',
      }),
    ).toEqual({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'smartenergy',
      password: 'pw',
      database: 'smartenergy',
      ssl: undefined,
    });
  });

  it('requires an explicit connection in production', () => {
    expect(() =>
      postgresConnectionOptions({
        NODE_ENV: 'production',
        POSTGRES_HOST: 'db',
      }),
    ).toThrow(
      'Database is not configured: set DATABASE_URL or POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB',
    );
    expect(
      postgresConnectionOptions({
        NODE_ENV: 'production',
        DATABASE_URL: cloudUrl,
      }).url,
    ).toBe(cloudUrl);
  });

  it('enables SSL with DB_SSL, verifying certificates unless told otherwise', () => {
    expect(
      postgresConnectionOptions({ DATABASE_URL: cloudUrl, DB_SSL: 'true' }).ssl,
    ).toEqual({ rejectUnauthorized: true });
    expect(
      postgresConnectionOptions({
        DATABASE_URL: cloudUrl,
        DB_SSL: 'TRUE',
        DB_SSL_REJECT_UNAUTHORIZED: 'false',
      }).ssl,
    ).toEqual({ rejectUnauthorized: false });
    expect(
      postgresConnectionOptions({ DATABASE_URL: cloudUrl, DB_SSL: 'false' })
        .ssl,
    ).toBeUndefined();
  });

  it('rejects an invalid POSTGRES_PORT', () => {
    expect(() => postgresConnectionOptions({ POSTGRES_PORT: 'abc' })).toThrow(
      'Invalid POSTGRES_PORT',
    );
  });
});

describe('databaseConfig', () => {
  const keys = ['NODE_ENV', 'DB_SYNCHRONIZE', 'DATABASE_URL'];
  const original = Object.fromEntries(keys.map((k) => [k, process.env[k]]));

  afterEach(() => {
    for (const key of keys) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  });

  it('combines the connection with the synchronize flag', () => {
    process.env.NODE_ENV = 'production';
    process.env.DB_SYNCHRONIZE = 'true';
    process.env.DATABASE_URL = 'postgresql://u:p@db:5432/smartenergy';

    expect(databaseConfig()).toMatchObject({
      type: 'postgres',
      url: 'postgresql://u:p@db:5432/smartenergy',
      synchronize: false,
    });
  });
});
