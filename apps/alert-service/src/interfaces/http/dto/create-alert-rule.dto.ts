import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAlertRuleDto {
  @ApiProperty({ example: 'High consumption', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty({
    example: 5.0,
    description: 'An alert is raised when consumption is strictly greater',
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsPositive()
  thresholdKwh: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
