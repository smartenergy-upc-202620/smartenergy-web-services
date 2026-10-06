import { ApiProperty } from '@nestjs/swagger';
import {
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEnergyMeasurementDto {
  @ApiProperty({ example: 'device-001', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  deviceId: string;

  @ApiProperty({ example: 3.75, minimum: 0 })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  consumptionKwh: number;

  @ApiProperty({
    example: '2026-10-06T10:30:00.000Z',
    description: 'ISO 8601 date-time of the reading',
  })
  @IsISO8601({ strict: true })
  measuredAt: string;
}
