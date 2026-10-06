import { EnergyMeasurement } from '../entities/energy-measurement.entity';

export interface EnergyMeasurementRepository {
  save(measurement: EnergyMeasurement): Promise<void>;
  findById(id: string): Promise<EnergyMeasurement | null>;
  findAll(): Promise<EnergyMeasurement[]>;
}

/** Injection token used to bind the PostgreSQL implementation (infrastructure). */
export const ENERGY_MEASUREMENT_REPOSITORY = Symbol(
  'ENERGY_MEASUREMENT_REPOSITORY',
);
