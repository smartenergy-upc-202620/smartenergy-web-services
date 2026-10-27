
import { Type } from 'class-transformer';
import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EnergyMeasurementQueryDto } from './energy-measurement-query.dto';

export class EstimatedEnergyCostQueryDto extends EnergyMeasurementQueryDto {
  @ApiProperty({
    example: 0.7,
    description: 'Tarifa referencial en soles por kWh',
    minimum: 0,
    exclusiveMinimum: true,
  })
  @Type(() => Number)
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
  })
  @IsPositive()
  tariffPerKwh: number;
}

export class EstimatedEnergyCostResponseDto {
  @ApiProperty({ example: 2 })
  totalMeasurements: number;

  @ApiProperty({ example: 8 })
  totalConsumptionKwh: number;

  @ApiProperty({ example: 0.7 })
  tariffPerKwh: number;

  @ApiProperty({ example: 5.6 })
  estimatedCost: number;

  @ApiProperty({ enum: ['PEN'], example: 'PEN' })
  currency: 'PEN';
}
