import { Inject, Injectable } from '@nestjs/common';
import { EnergyMeasurement } from '../../domain/entities/energy-measurement.entity';
import {
  ENERGY_MEASUREMENT_REPOSITORY,
  EnergyMeasurementFilter,
  EnergyMeasurementRepository,
} from '../../domain/repositories/energy-measurement.repository';

@Injectable()
export class ListEnergyMeasurementsUseCase {
  constructor(
    @Inject(ENERGY_MEASUREMENT_REPOSITORY)
    private readonly measurements: EnergyMeasurementRepository,
  ) {}

  // TODO: add pagination (limit/offset) before lists can grow large.
  execute(filter: EnergyMeasurementFilter = {}): Promise<EnergyMeasurement[]> {
    return this.measurements.findAll(filter);
  }
}
