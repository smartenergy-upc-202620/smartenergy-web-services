import { ApiProperty } from '@nestjs/swagger';
import { AlertRule } from '../../../domain/entities/alert-rule.entity';
import { Alert } from '../../../domain/entities/alert.entity';

export class AlertRuleResponseDto {
  @ApiProperty({ example: '9a7c1e2b-4f5d-4e6a-8b9c-0d1e2f3a4b5c' })
  id: string;

  @ApiProperty({ example: 'High consumption' })
  name: string;

  @ApiProperty({ example: 5 })
  thresholdKwh: number;

  @ApiProperty({ example: true })
  active: boolean;

  @ApiProperty({ example: '2026-10-06T10:00:00.000Z' })
  createdAt: string;

  static fromDomain(rule: AlertRule): AlertRuleResponseDto {
    return {
      id: rule.id,
      name: rule.name,
      thresholdKwh: rule.thresholdKwh,
      active: rule.active,
      createdAt: rule.createdAt.toISOString(),
    };
  }
}

export class AlertResponseDto {
  @ApiProperty({ example: 'c4d5e6f7-1a2b-4c3d-9e8f-7a6b5c4d3e2f' })
  id: string;

  @ApiProperty({ example: '9a7c1e2b-4f5d-4e6a-8b9c-0d1e2f3a4b5c' })
  ruleId: string;

  @ApiProperty({ example: 'device-001' })
  deviceId: string;

  @ApiProperty({ example: 8.2 })
  consumptionKwh: number;

  @ApiProperty({
    example:
      'Device "device-001" consumed 8.2 kWh, exceeding the 5 kWh threshold of rule "High consumption"',
  })
  message: string;

  @ApiProperty({ example: '2026-10-06T10:31:00.000Z' })
  createdAt: string;

  static fromDomain(alert: Alert): AlertResponseDto {
    return {
      id: alert.id,
      ruleId: alert.ruleId,
      deviceId: alert.deviceId,
      consumptionKwh: alert.consumptionKwh,
      message: alert.message,
      createdAt: alert.createdAt.toISOString(),
    };
  }
}

export class EvaluationResponseDto {
  @ApiProperty({ example: 1, description: 'Number of active rules evaluated' })
  evaluatedRules: number;

  @ApiProperty({ type: AlertResponseDto, isArray: true })
  alerts: AlertResponseDto[];
}
