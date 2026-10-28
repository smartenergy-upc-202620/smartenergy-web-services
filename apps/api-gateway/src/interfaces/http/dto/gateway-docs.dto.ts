import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/*
 * Swagger-only schemas.
 * The gateway does not compute or validate business data.
 */

export class RegisterUserRequestDoc {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({
    example: 'StrongPassword123',
    minLength: 8,
    maxLength: 72,
  })
  password: string;

  @ApiPropertyOptional({
    enum: ['HOME_USER', 'BUSINESS_ADMIN'],
    default: 'HOME_USER',
  })
  role?: string;
}

export class LoginRequestDoc {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'StrongPassword123' })
  password: string;
}

export class UserDoc {
  @ApiProperty({
    example: '3f1c2a4e-8d4b-4c4f-9f7e-2b1a6c9d0e11',
  })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({
    enum: ['HOME_USER', 'BUSINESS_ADMIN'],
    example: 'HOME_USER',
  })
  role: string;

  @ApiProperty({
    example: '2026-10-06T10:00:00.000Z',
  })
  createdAt: string;
}

export class LoginResponseDoc {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({ type: UserDoc })
  user: UserDoc;
}

export class CreateMeasurementRequestDoc {
  @ApiProperty({ example: 'device-001' })
  deviceId: string;

  @ApiProperty({ example: 3.75, minimum: 0 })
  consumptionKwh: number;

  @ApiProperty({
    example: '2026-10-06T10:30:00.000Z',
  })
  measuredAt: string;
}

export class MeasurementDoc extends CreateMeasurementRequestDoc {
  @ApiProperty({
    example: '6b0f4a52-1d3e-4c8a-9b8e-0c5a7d2f9e31',
  })
  id: string;
}

export class ConsumptionSummaryDoc {
  @ApiProperty({ example: 5 })
  totalMeasurements: number;

  @ApiProperty({ example: 20.5 })
  totalConsumptionKwh: number;

  @ApiProperty({ example: 4.1 })
  averageConsumptionKwh: number;
}

export class EstimatedEnergyCostDoc {
  @ApiProperty({ example: 2 })
  totalMeasurements: number;

  @ApiProperty({ example: 8 })
  totalConsumptionKwh: number;

  @ApiProperty({ example: 0.7 })
  tariffPerKwh: number;

  @ApiProperty({ example: 5.6 })
  estimatedCost: number;

  @ApiProperty({
    enum: ['PEN'],
    example: 'PEN',
  })
  currency: 'PEN';
}

// US04 - Grouped history

export class GroupedEnergyHistoryPeriodDoc {
  @ApiProperty({
    example: '2026-10-26',
    description:
      'Day: YYYY-MM-DD; week: Monday date; month: YYYY-MM.',
  })
  period: string;

  @ApiProperty({ example: 2 })
  totalMeasurements: number;

  @ApiProperty({ example: 8 })
  totalConsumptionKwh: number;
}

export class GroupedEnergyHistoryDoc {
  @ApiProperty({
    enum: ['day', 'week', 'month'],
    example: 'day',
  })
  granularity: 'day' | 'week' | 'month';

  @ApiProperty({ example: 3 })
  totalMeasurements: number;

  @ApiProperty({ example: 12 })
  totalConsumptionKwh: number;

  @ApiProperty({
    example: true,
    description: 'Whether matching measurements were found.',
  })
  hasData: boolean;

  @ApiProperty({
    type: GroupedEnergyHistoryPeriodDoc,
    isArray: true,
  })
  periods: GroupedEnergyHistoryPeriodDoc[];
}

// US05 - Comparison between two periods

export class ComparisonPeriodDoc {
  @ApiProperty({
    example: '2026-10-01T00:00:00.000Z',
  })
  from: string;

  @ApiProperty({
    example: '2026-10-07T23:59:59.999Z',
  })
  to: string;

  @ApiProperty({ example: 2 })
  totalMeasurements: number;

  @ApiProperty({
    type: Number,
    nullable: true,
    example: 120,
  })
  totalConsumptionKwh: number | null;

  @ApiProperty({ example: true })
  hasData: boolean;
}

export class EnergyPeriodComparisonDoc {
  @ApiProperty({ example: 'device-001' })
  deviceId: string;

  @ApiProperty({ type: ComparisonPeriodDoc })
  baseline: ComparisonPeriodDoc;

  @ApiProperty({ type: ComparisonPeriodDoc })
  comparison: ComparisonPeriodDoc;

  @ApiProperty({ example: true })
  hasSufficientData: boolean;

  @ApiProperty({
    type: Number,
    nullable: true,
    example: -30,
  })
  differenceKwh: number | null;

  @ApiProperty({
    type: Number,
    nullable: true,
    example: -25,
  })
  percentageChange: number | null;

  @ApiProperty({
    enum: [
      'increase',
      'decrease',
      'no_change',
      'insufficient_data',
    ],
    example: 'decrease',
  })
  trend:
    | 'increase'
    | 'decrease'
    | 'no_change'
    | 'insufficient_data';

  @ApiProperty({
    example: 'Energy consumption decreased.',
  })
  message: string;
}

// Sprint 1 - Alerts

export class CreateAlertRuleRequestDoc {
  @ApiProperty({ example: 'High consumption' })
  name: string;

  @ApiProperty({ example: 5.0 })
  thresholdKwh: number;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  active?: boolean;
}

export class AlertRuleDoc {
  @ApiProperty({
    example: '9a7c1e2b-4f5d-4e6a-8b9c-0d1e2f3a4b5c',
  })
  id: string;

  @ApiProperty({ example: 'High consumption' })
  name: string;

  @ApiProperty({ example: 5 })
  thresholdKwh: number;

  @ApiProperty({ example: true })
  active: boolean;

  @ApiProperty({
    example: '2026-10-06T10:00:00.000Z',
  })
  createdAt: string;
}

export class EvaluateConsumptionRequestDoc {
  @ApiProperty({ example: 'device-001' })
  deviceId: string;

  @ApiProperty({ example: 8.2 })
  consumptionKwh: number;
}

export class AlertDoc {
  @ApiProperty({
    example: 'c4d5e6f7-1a2b-4c3d-9e8f-7a6b5c4d3e2f',
  })
  id: string;

  @ApiProperty({
    example: '9a7c1e2b-4f5d-4e6a-8b9c-0d1e2f3a4b5c',
  })
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

  @ApiProperty({
    example: '2026-10-06T10:31:00.000Z',
  })
  createdAt: string;
}

export class EvaluationResultDoc {
  @ApiProperty({ example: 1 })
  evaluatedRules: number;

  @ApiProperty({
    type: AlertDoc,
    isArray: true,
  })
  alerts: AlertDoc[];
}

class ServiceHealthDoc {
  @ApiProperty({ example: 'user-service' })
  service: string;

  @ApiProperty({
    enum: ['up', 'down'],
    example: 'up',
  })
  status: string;
}

export class SystemHealthDoc {
  @ApiProperty({
    enum: ['ok', 'degraded'],
    example: 'ok',
  })
  status: string;

  @ApiProperty({
    type: ServiceHealthDoc,
    isArray: true,
  })
  services: ServiceHealthDoc[];
}