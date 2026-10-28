import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class EnergyMeasurementQueryDto {
  @ApiPropertyOptional({
    example: 'device-001',
    description: 'Only include measurements of this device',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  deviceId?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2026-10-01T00:00:00.000Z',
    description: 'Start of the date range (inclusive)',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2026-10-07T23:59:59.999Z',
    description: 'End of the date range (inclusive)',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;
}
