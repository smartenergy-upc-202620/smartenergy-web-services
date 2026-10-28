
import { Inject, Injectable } from '@nestjs/common';

import {
  ENERGY_MEASUREMENT_REPOSITORY,
  EnergyMeasurementFilter,
  EnergyMeasurementRepository,
} from '../../domain/repositories/energy-measurement.repository';

import {
  EnergyHistoryGranularity,
  EnergyHistoryPeriod,
  groupEnergyMeasurements,
} from '../../domain/services/energy-history-grouping';

export interface GroupedEnergyHistory {
  granularity: EnergyHistoryGranularity;
  totalMeasurements: number;
  totalConsumptionKwh: number;
  hasData: boolean;
  periods: EnergyHistoryPeriod[];
}

@Injectable()
export class GetGroupedEnergyHistoryUseCase {
  constructor(
    @Inject(ENERGY_MEASUREMENT_REPOSITORY)
    private readonly measurements: EnergyMeasurementRepository,
  ) {}

  async execute(
    granularity: EnergyHistoryGranularity,
    filter: EnergyMeasurementFilter = {},
  ): Promise<GroupedEnergyHistory> {
    if (!['day', 'week', 'month'].includes(granularity)) {
      throw new RangeError('Unsupported history granularity');
    }

    // Retrieve measurements using the existing repository.
    const measurements = await this.measurements.findAll(filter);

    // Group them using the existing domain service.
    const periods = groupEnergyMeasurements(
      measurements,
      granularity,
    );

    const totalConsumption = measurements.reduce(
      (sum, measurement) =>
        sum + measurement.consumptionKwh,
      0,
    );

    return {
      granularity,
      totalMeasurements: measurements.length,
      totalConsumptionKwh:
        Math.round(totalConsumption * 1000) / 1000,
      hasData: measurements.length > 0,
      periods,
    };
  }
}