import { EnergyMeasurementOrmEntity } from './entities/energy-measurement.orm-entity';

/** PostgreSQL schema owned by this Bounded Context. */
export const ENERGY_MONITORING_SCHEMA = 'energy_monitoring';

/** Persistence models of this context (shared by the app and its migrations). */
export const ENERGY_MONITORING_ORM_ENTITIES = [EnergyMeasurementOrmEntity];
