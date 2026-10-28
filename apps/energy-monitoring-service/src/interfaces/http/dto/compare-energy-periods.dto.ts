import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CompareEnergyPeriodsQueryDto {
  @ApiProperty({ example: 'device-001', description: 'Device to compare' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  deviceId: string;

  @ApiProperty({ example: '2026-10-01T00:00:00.000Z', format: 'date-time' })
  @IsISO8601({ strict: true })
  @Matches(/Z$/, { message: 'baselineFrom must be in UTC (Z)' })
  baselineFrom: string;

  @ApiProperty({ example: '2026-10-07T23:59:59.999Z', format: 'date-time' })
  @IsISO8601({ strict: true })
  @Matches(/Z$/, { message: 'baselineTo must be in UTC (Z)' })
  baselineTo: string;

  @ApiProperty({ example: '2026-10-08T00:00:00.000Z', format: 'date-time' })
  @IsISO8601({ strict: true })
  @Matches(/Z$/, { message: 'comparisonFrom must be in UTC (Z)' })
  comparisonFrom: string;

  @ApiProperty({ example: '2026-10-14T23:59:59.999Z', format: 'date-time' })
  @IsISO8601({ strict: true })
  @Matches(/Z$/, { message: 'comparisonTo must be in UTC (Z)' })
  comparisonTo: string;
}

export class ComparisonPeriodResponseDto {
  @ApiProperty({ example: '2026-10-01T00:00:00.000Z' })
  from: string;

  @ApiProperty({ example: '2026-10-07T23:59:59.999Z' })
  to: string;

  @ApiProperty({ example: 2 })
  totalMeasurements: number;

  @ApiProperty({ type: Number, nullable: true, example: 120 })
  totalConsumptionKwh: number | null;

  @ApiProperty({ example: true })
  hasData: boolean;
}

export class CompareEnergyPeriodsResponseDto {
  @ApiProperty({ example: 'device-001' })
  deviceId: string;

  @ApiProperty({ type: ComparisonPeriodResponseDto })
  baseline: ComparisonPeriodResponseDto;

  @ApiProperty({ type: ComparisonPeriodResponseDto })
  comparison: ComparisonPeriodResponseDto;

  @ApiProperty({ example: true })
  hasSufficientData: boolean;

  @ApiProperty({ type: Number, nullable: true, example: -30 })
  differenceKwh: number | null;

  @ApiProperty({ type: Number, nullable: true, example: -25 })
  percentageChange: number | null;

  @ApiProperty({ enum: ['increase', 'decrease', 'no_change', 'insufficient_data'] })
  trend: 'increase' | 'decrease' | 'no_change' | 'insufficient_data';

  @ApiProperty({ example: 'Energy consumption decreased.' })
  message: string;
}
