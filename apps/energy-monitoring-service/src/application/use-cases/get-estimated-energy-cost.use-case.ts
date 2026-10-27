
import { Inject, Injectable } from '@nestjs/common';
import {
  ENERGY_MEASUREMENT_REPOSITORY,
  EnergyMeasurementFilter,
  EnergyMeasurementRepository,
} from '../../domain/repositories/energy-measurement.repository';
import { calculateEstimatedCost } from '../../domain/services/energy-cost-calculator';

export interface EstimatedEnergyCost {
  totalMeasurements: number;
  totalConsumptionKwh: number;
  tariffPerKwh: number;
  estimatedCost: number;
  currency: 'PEN';
}

@Injectable()
export class GetEstimatedEnergyCostUseCase {
  constructor(
    @Inject(ENERGY_MEASUREMENT_REPOSITORY)
    private readonly measurements: EnergyMeasurementRepository,
  ) {}

  async execute(
    tariffPerKwh: number,
    filter: EnergyMeasurementFilter = {},
  ): Promise<EstimatedEnergyCost> {
    // Validate the tariff before querying PostgreSQL.
    calculateEstimatedCost(0, tariffPerKwh);

    const measurements = await this.measurements.findAll(filter);

    const total = measurements.reduce(
      (sum, measurement) => sum + measurement.consumptionKwh,
      0,
    );

    return {
      totalMeasurements: measurements.length,
      totalConsumptionKwh: Math.round(total * 1000) / 1000,
      tariffPerKwh,
      estimatedCost: calculateEstimatedCost(total, tariffPerKwh),
      currency: 'PEN',
    };
  }
}
