import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

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
}
