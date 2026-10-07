import { AlertRuleOrmEntity } from './entities/alert-rule.orm-entity';
import { AlertOrmEntity } from './entities/alert.orm-entity';

/** PostgreSQL schema owned by this Bounded Context. */
export const ALERTING_SCHEMA = 'alerting';

/** Persistence models of this context (shared by the app and its migrations). */
export const ALERTING_ORM_ENTITIES = [AlertRuleOrmEntity, AlertOrmEntity];
