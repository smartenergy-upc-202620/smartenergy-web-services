import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class EvaluateConsumptionDto {
  @ApiProperty({ example: 'device-001', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  deviceId: string;

  @ApiProperty({ example: 8.2, minimum: 0 })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  consumptionKwh: number;
}
