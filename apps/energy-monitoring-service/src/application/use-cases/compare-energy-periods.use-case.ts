import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  ENERGY_MEASUREMENT_REPOSITORY,
  EnergyMeasurementRepository,
} from '../../domain/repositories/energy-measurement.repository';
import {
  compareEnergyPeriods,
  EnergyPeriodComparison,
} from '../../domain/services/energy-period-comparison';

export interface CompareEnergyPeriodsRequest {
  deviceId: string;
  baselineFrom: Date;
  baselineTo: Date;
  comparisonFrom: Date;
  comparisonTo: Date;
}

@Injectable()
export class CompareEnergyPeriodsUseCase {
  constructor(
    @Inject(ENERGY_MEASUREMENT_REPOSITORY)
    private readonly repository: EnergyMeasurementRepository,
  ) {}

  async execute(request: CompareEnergyPeriodsRequest): Promise<EnergyPeriodComparison> {
    const { deviceId, baselineFrom, baselineTo, comparisonFrom, comparisonTo } = request;
    const dates = [baselineFrom, baselineTo, comparisonFrom, comparisonTo];
    if (dates.some((date) => !(date instanceof Date) || !Number.isFinite(date.getTime()))) {
      throw new BadRequestException('All four period dates must be valid.');
    }
    if (baselineFrom > baselineTo || comparisonFrom > comparisonTo) {
      throw new BadRequestException('Each start date must not be after its end date.');
    }
    if (baselineTo >= comparisonFrom) {
      throw new BadRequestException('Baseline must end before the comparison period starts.');
    }
    if (!deviceId?.trim()) {
      throw new BadRequestException('deviceId is required.');
    }

    const [before, after] = await Promise.all([
      this.repository.findAll({ deviceId, from: baselineFrom, to: baselineTo }),
      this.repository.findAll({ deviceId, from: comparisonFrom, to: comparisonTo }),
    ]);

    return compareEnergyPeriods(
      deviceId,
      before,
      after,
      { from: baselineFrom, to: baselineTo },
      { from: comparisonFrom, to: comparisonTo },
    );
  }
}
