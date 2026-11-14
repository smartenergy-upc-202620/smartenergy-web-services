import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

import { EnergyReportPeriod } from '../../../domain/services/energy-report-period';

export class EnergyReportQueryDto {
  @ApiProperty({
    enum: ['week', 'month'],
    example: 'week',
    description: 'Report period: week (Monday-Sunday) or calendar month, in UTC.',
  })
  @IsIn(['week', 'month'])
  period: EnergyReportPeriod;

  @ApiProperty({
    example: '2026-11-10T00:00:00.000Z',
    format: 'date-time',
    description: 'UTC date used to determine the requested week or month.',
  })
  @IsISO8601({ strict: true })
  @Matches(/Z$/, { message: 'referenceDate must be in UTC (Z)' })
  referenceDate: string;

  @ApiPropertyOptional({
    example: 'device-001',
    description: 'Only include measurements of this device',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  deviceId?: string;
}

export class EnergyReportResponseDto {
  @ApiProperty({ enum: ['week', 'month'], example: 'week' })
  period: EnergyReportPeriod;

  @ApiProperty({ example: '2026-11-09T00:00:00.000Z' })
  from: string;

  @ApiProperty({ example: '2026-11-15T23:59:59.999Z' })
  to: string;

  @ApiPropertyOptional({ example: 'device-001' })
  deviceId?: string;

  @ApiProperty({ example: 4 })
  totalMeasurements: number;

  @ApiProperty({ example: 18.5 })
  totalConsumptionKwh: number;

  @ApiProperty({ type: Number, nullable: true, example: 4.625 })
  averageConsumptionKwh: number | null;

  @ApiProperty({ example: true })
  hasData: boolean;

  @ApiPropertyOptional({ example: 'Not enough data to generate the report.' })
  message?: string;
}
