import { EnergyMeasurement } from '../entities/energy-measurement.entity';

export interface EnergyMeasurementFilter {
  deviceId?: string;
}

export interface EnergyMeasurementRepository {
  save(measurement: EnergyMeasurement): Promise<void>;
  findById(id: string): Promise<EnergyMeasurement | null>;
  /** Most recent measurements first. */
  findAll(filter?: EnergyMeasurementFilter): Promise<EnergyMeasurement[]>;
}

/** Injection token used to bind the PostgreSQL implementation (infrastructure). */
export const ENERGY_MEASUREMENT_REPOSITORY = Symbol(
  'ENERGY_MEASUREMENT_REPOSITORY',
);
