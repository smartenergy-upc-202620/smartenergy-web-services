import { Inject, Injectable } from '@nestjs/common';
import {
  ENERGY_MEASUREMENT_REPOSITORY,
  EnergyMeasurementFilter,
  EnergyMeasurementRepository,
} from '../../domain/repositories/energy-measurement.repository';

export interface EnergyConsumptionSummary {
  totalMeasurements: number;
  totalConsumptionKwh: number;
  averageConsumptionKwh: number;
}

const round = (value: number) => Math.round(value * 1000) / 1000;

@Injectable()
export class GetEnergyConsumptionSummaryUseCase {
  constructor(
    @Inject(ENERGY_MEASUREMENT_REPOSITORY)
    private readonly measurements: EnergyMeasurementRepository,
  ) {}

  // TODO: aggregate with SQL (COUNT/SUM) instead of loading every row once
  // measurement volume grows.
  async execute(
    filter: EnergyMeasurementFilter = {},
  ): Promise<EnergyConsumptionSummary> {
    const measurements = await this.measurements.findAll(filter);
    const total = measurements.reduce((sum, m) => sum + m.consumptionKwh, 0);
    const count = measurements.length;

    return {
      totalMeasurements: count,
      totalConsumptionKwh: round(total),
      averageConsumptionKwh: count === 0 ? 0 : round(total / count),
    };
  }
}
