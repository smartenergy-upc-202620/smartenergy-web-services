import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EnergyMeasurement } from '../../domain/entities/energy-measurement.entity';
import {
  ENERGY_MEASUREMENT_REPOSITORY,
  EnergyMeasurementRepository,
} from '../../domain/repositories/energy-measurement.repository';

export interface CreateEnergyMeasurementCommand {
  deviceId: string;
  consumptionKwh: number;
  measuredAt: Date;
}

@Injectable()
export class CreateEnergyMeasurementUseCase {
  constructor(
    @Inject(ENERGY_MEASUREMENT_REPOSITORY)
    private readonly measurements: EnergyMeasurementRepository,
  ) {}

  async execute(
    command: CreateEnergyMeasurementCommand,
  ): Promise<EnergyMeasurement> {
    const measurement = EnergyMeasurement.create({
      id: randomUUID(),
      deviceId: command.deviceId,
      consumptionKwh: command.consumptionKwh,
      measuredAt: command.measuredAt,
    });
    await this.measurements.save(measurement);
    return measurement;
  }
}
