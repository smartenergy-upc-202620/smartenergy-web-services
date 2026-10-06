import { UserOrmEntity } from './entities/user.orm-entity';

/** PostgreSQL schema owned by this Bounded Context. */
export const IDENTITY_ACCESS_SCHEMA = 'identity_access';

/** Persistence models of this context (shared by the app and its migrations). */
export const IDENTITY_ACCESS_ORM_ENTITIES = [UserOrmEntity];
