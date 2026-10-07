import { ApiProperty } from '@nestjs/swagger';
import { EnergyMeasurement } from '../../../domain/entities/energy-measurement.entity';

export class EnergyMeasurementResponseDto {
  @ApiProperty({ example: '6b0f4a52-1d3e-4c8a-9b8e-0c5a7d2f9e31' })
  id: string;

  @ApiProperty({ example: 'device-001' })
  deviceId: string;

  @ApiProperty({ example: 3.75 })
  consumptionKwh: number;

  @ApiProperty({ example: '2026-10-06T10:30:00.000Z' })
  measuredAt: string;

  static fromDomain(
    measurement: EnergyMeasurement,
  ): EnergyMeasurementResponseDto {
    return {
      id: measurement.id,
      deviceId: measurement.deviceId,
      consumptionKwh: measurement.consumptionKwh,
      measuredAt: measurement.measuredAt.toISOString(),
    };
  }
}

export class EnergyConsumptionSummaryResponseDto {
  @ApiProperty({ example: 5 })
  totalMeasurements: number;

  @ApiProperty({ example: 20.5 })
  totalConsumptionKwh: number;

  @ApiProperty({ example: 4.1 })
  averageConsumptionKwh: number;
}
