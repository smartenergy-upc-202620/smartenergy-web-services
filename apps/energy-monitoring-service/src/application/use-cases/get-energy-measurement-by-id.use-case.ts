import { Inject, Injectable } from '@nestjs/common';
import { EnergyMeasurement } from '../../domain/entities/energy-measurement.entity';
import {
  ENERGY_MEASUREMENT_REPOSITORY,
  EnergyMeasurementRepository,
} from '../../domain/repositories/energy-measurement.repository';
import { EnergyMeasurementNotFoundException } from '../exceptions/energy-measurement-not-found.exception';

@Injectable()
export class GetEnergyMeasurementByIdUseCase {
  constructor(
    @Inject(ENERGY_MEASUREMENT_REPOSITORY)
    private readonly measurements: EnergyMeasurementRepository,
  ) {}

  async execute(id: string): Promise<EnergyMeasurement> {
    const measurement = await this.measurements.findById(id);
    if (!measurement) {
      throw new EnergyMeasurementNotFoundException(id);
    }
    return measurement;
  }
}
