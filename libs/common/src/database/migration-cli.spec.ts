import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { runMigrationCommand } from './migration-cli';

function fakeDataSource(overrides: Record<string, unknown> = {}) {
  const ds: Record<string, any> = {
    options: { schema: 'alerting' },
    isInitialized: false,
    initialize: jest.fn((): Promise<void> => {
      ds.isInitialized = true;
      return Promise.resolve();
    }),
    query: jest.fn().mockResolvedValue(undefined),
    runMigrations: jest.fn().mockResolvedValue([{ name: 'Initial1' }]),
    undoLastMigration: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  return ds;
}

describe('runMigrationCommand', () => {
  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    process.exitCode = undefined;
  });

  it('creates the context schema before running pending migrations', async () => {
    const ds = fakeDataSource();

    await runMigrationCommand(ds as unknown as DataSource, 'run');

    expect(ds.query).toHaveBeenCalledWith(
      'CREATE SCHEMA IF NOT EXISTS "alerting"',
    );
    expect(ds.query.mock.invocationCallOrder[0]).toBeLessThan(
      ds.runMigrations.mock.invocationCallOrder[0],
    );
    expect(ds.runMigrations).toHaveBeenCalledWith({ transaction: 'each' });
    expect(ds.destroy).toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });

  it('reverts only the last migration', async () => {
    const ds = fakeDataSource();

    await runMigrationCommand(ds as unknown as DataSource, 'revert');

    expect(ds.undoLastMigration).toHaveBeenCalledWith({ transaction: 'each' });
    expect(ds.runMigrations).not.toHaveBeenCalled();
    expect(ds.destroy).toHaveBeenCalled();
  });

  it('fails with a non-zero exit code and still closes the connection', async () => {
    const ds = fakeDataSource({
      runMigrations: jest.fn().mockRejectedValue(new Error('syntax error')),
    });

    await runMigrationCommand(ds as unknown as DataSource, 'run');

    expect(process.exitCode).toBe(1);
    expect(ds.destroy).toHaveBeenCalled();
  });

  it('rejects unknown commands without touching the database', async () => {
    const ds = fakeDataSource();

    await runMigrationCommand(ds as unknown as DataSource, 'drop');

    expect(process.exitCode).toBe(1);
    expect(ds.initialize).not.toHaveBeenCalled();
  });
});
