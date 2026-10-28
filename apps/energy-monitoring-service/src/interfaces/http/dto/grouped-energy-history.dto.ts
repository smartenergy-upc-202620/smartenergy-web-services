
import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

import { EnergyHistoryGranularity } from '../../../domain/services/energy-history-grouping';

import { EnergyMeasurementQueryDto } from './energy-measurement-query.dto';

// ============================================================
// US04 - QUERY PARAMETERS
// ============================================================

export class GroupedEnergyHistoryQueryDto extends EnergyMeasurementQueryDto {
  @ApiProperty({
    enum: ['day', 'week', 'month'],
    example: 'day',
    description:
      'Grouping granularity: day, week or month.',
  })
  @IsIn(['day', 'week', 'month'])
  granularity: EnergyHistoryGranularity;
}

// ============================================================
// US04 - INDIVIDUAL PERIOD
// ============================================================

export class GroupedEnergyHistoryPeriodDto {
  @ApiProperty({
    example: '2026-10-26',
    description:
      'Period identifier. Day: YYYY-MM-DD; week: Monday date; month: YYYY-MM.',
  })
  period: string;

  @ApiProperty({
    example: 2,
  })
  totalMeasurements: number;

  @ApiProperty({
    example: 8,
  })
  totalConsumptionKwh: number;
}

// ============================================================
// US04 - COMPLETE RESPONSE
// ============================================================

export class GroupedEnergyHistoryResponseDto {
  @ApiProperty({
    enum: ['day', 'week', 'month'],
    example: 'day',
  })
  granularity: EnergyHistoryGranularity;

  @ApiProperty({
    example: 3,
  })
  totalMeasurements: number;

  @ApiProperty({
    example: 12,
  })
  totalConsumptionKwh: number;

  @ApiProperty({
    example: true,
    description:
      'Indicates whether matching energy measurements exist.',
  })
  hasData: boolean;

  @ApiProperty({
    type: GroupedEnergyHistoryPeriodDto,
    isArray: true,
  })
  periods: GroupedEnergyHistoryPeriodDto[];
}