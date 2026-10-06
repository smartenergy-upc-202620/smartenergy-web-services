import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Loads `.env` when it exists, without overriding variables that are already
 * set (same precedence as ConfigModule). Cloud environments have no `.env`.
 */
export function loadLocalEnvFile(path = '.env'): void {
  try {
    process.loadEnvFile(path);
  } catch {
    // No .env file: rely on the real environment.
  }
}

/**
 * Runs or reverts the migrations of one Bounded Context. Its schema is
 * created first because TypeORM keeps the migrations table inside it.
 * Sets a non-zero exit code on failure so deploy pipelines stop.
 */
export async function runMigrationCommand(
  dataSource: DataSource,
  command: string | undefined,
): Promise<void> {
  const logger = new Logger('Migrations');
  if (command !== 'run' && command !== 'revert') {
    logger.error(`Unknown command "${command}". Use "run" or "revert".`);
    process.exitCode = 1;
    return;
  }

  const { schema } = dataSource.options as { schema?: string };
  try {
    await dataSource.initialize();
    if (command === 'run') {
      if (schema) {
        await dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
      }
      const applied = await dataSource.runMigrations({ transaction: 'each' });
      logger.log(
        applied.length > 0
          ? `[${schema}] applied: ${applied.map((m) => m.name).join(', ')}`
          : `[${schema}] no pending migrations`,
      );
    } else {
      await dataSource.undoLastMigration({ transaction: 'each' });
      logger.log(`[${schema}] last migration reverted`);
    }
  } catch (error) {
    logger.error(
      `[${schema}] migration "${command}" failed`,
      error instanceof Error ? error.stack : String(error),
    );
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) await dataSource.destroy();
  }
}
