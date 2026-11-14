import { Inject, Injectable } from '@nestjs/common';
import {
  ENERGY_MEASUREMENT_REPOSITORY,
  EnergyMeasurementRepository,
} from '../../domain/repositories/energy-measurement.repository';
import {
  EnergyReportPeriod,
  resolveEnergyReportRange,
} from '../../domain/services/energy-report-period';

export interface EnergyReport {
  period: EnergyReportPeriod;
  from: string;
  to: string;
  deviceId?: string;
  totalMeasurements: number;
  totalConsumptionKwh: number;
  averageConsumptionKwh: number | null;
  hasData: boolean;
  message?: string;
}

export const NO_REPORT_DATA_MESSAGE = 'Not enough data to generate the report.';

const round = (value: number) => Math.round(value * 1000) / 1000;

@Injectable()
export class GetEnergyReportUseCase {
  constructor(
    @Inject(ENERGY_MEASUREMENT_REPOSITORY)
    private readonly measurements: EnergyMeasurementRepository,
  ) {}

  async execute(
    period: EnergyReportPeriod,
    referenceDate: Date,
    deviceId?: string,
  ): Promise<EnergyReport> {
    const { from, to } = resolveEnergyReportRange(period, referenceDate);

    const records = await this.measurements.findAll({
      ...(deviceId ? { deviceId } : {}),
      from,
      to,
    });

    const base = {
      period,
      from: from.toISOString(),
      to: to.toISOString(),
      ...(deviceId ? { deviceId } : {}),
    };

    if (records.length === 0) {
      return {
        ...base,
        totalMeasurements: 0,
        totalConsumptionKwh: 0,
        averageConsumptionKwh: null,
        hasData: false,
        message: NO_REPORT_DATA_MESSAGE,
      };
    }

    const total = records.reduce((sum, m) => sum + m.consumptionKwh, 0);

    return {
      ...base,
      totalMeasurements: records.length,
      totalConsumptionKwh: round(total),
      averageConsumptionKwh: round(total / records.length),
      hasData: true,
    };
  }
}
