import { runMigrationCommand } from '@app/common';
import dataSource from './alerting.data-source';

// Usage: migrate.ts run | revert (see the migration:* scripts in package.json)
void runMigrationCommand(dataSource, process.argv[2]);
