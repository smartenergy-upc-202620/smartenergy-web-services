import { databaseConfig } from './database.config';

describe('databaseConfig', () => {
  const keys = ['NODE_ENV', 'DB_SYNCHRONIZE'];
  const original = Object.fromEntries(keys.map((k) => [k, process.env[k]]));

  const synchronizeWith = (env: Record<string, string | undefined>) => {
    for (const key of keys) {
      if (env[key] === undefined) delete process.env[key];
      else process.env[key] = env[key];
    }
    return databaseConfig().synchronize;
  };

  afterEach(() => {
    for (const key of keys) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  });

  it('never synchronizes in production, even if DB_SYNCHRONIZE=true', () => {
    expect(
      synchronizeWith({ NODE_ENV: 'production', DB_SYNCHRONIZE: 'true' }),
    ).toBe(false);
    expect(synchronizeWith({ NODE_ENV: 'production' })).toBe(false);
  });

  it('synchronizes by default outside production', () => {
    expect(synchronizeWith({ NODE_ENV: 'development' })).toBe(true);
    expect(synchronizeWith({ NODE_ENV: 'test' })).toBe(true);
  });

  it('can be disabled outside production', () => {
    expect(
      synchronizeWith({ NODE_ENV: 'development', DB_SYNCHRONIZE: 'false' }),
    ).toBe(false);
  });
});
