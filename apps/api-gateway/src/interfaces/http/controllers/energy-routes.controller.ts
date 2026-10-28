import { Controller, Get, Post, Req, Res } from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { ErrorResponseDto } from '@app/common';
import type { Request, Response } from 'express';

import { DownstreamProxy } from '../../../infrastructure/http/downstream-proxy';

import {
  ConsumptionSummaryDoc,
  CreateMeasurementRequestDoc,
  EstimatedEnergyCostDoc,
  EnergyPeriodComparisonDoc,
  GroupedEnergyHistoryDoc,
  MeasurementDoc,
} from '../dto/gateway-docs.dto';

// Shared query parameters

const DEVICE_FILTER = {
  name: 'deviceId',
  required: false,
  type: String,
  example: 'device-001',
  description: 'Filter energy measurements by device identifier.',
} as const;

const FROM_FILTER = {
  name: 'from',
  required: false,
  type: String,
  format: 'date-time',
  example: '2026-10-01T00:00:00.000Z',
  description: 'Start date in UTC (inclusive).',
} as const;

const TO_FILTER = {
  name: 'to',
  required: false,
  type: String,
  format: 'date-time',
  example: '2026-10-07T23:59:59.999Z',
  description: 'End date in UTC (inclusive). Must not precede from.',
} as const;

@ApiTags('measurements')
@Controller('measurements')
export class EnergyRoutesController {
  constructor(private readonly proxy: DownstreamProxy) {}

  // Sprint 1 - Register energy measurement

  @Post()
  @ApiOperation({
    summary: 'Register an energy measurement',
    description: 'Register an energy consumption measurement for a device.',
  })
  @ApiBody({
    type: CreateMeasurementRequestDoc,
  })
  @ApiCreatedResponse({
    type: MeasurementDoc,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
  })
  create(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.proxy.forward('energy-monitoring-service', req, res);
  }

  // US04 - Consumption history

  @Get()
  @ApiOperation({
    summary: 'List energy measurements, most recent first',
    description:
      'Retrieve the energy consumption history with optional ' +
      'deviceId, from and to filters. Date boundaries are inclusive.',
  })
  @ApiQuery(DEVICE_FILTER)
  @ApiQuery(FROM_FILTER)
  @ApiQuery(TO_FILTER)
  @ApiOkResponse({
    type: MeasurementDoc,
    isArray: true,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid query parameters or date range.',
  })
  list(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.proxy.forward('energy-monitoring-service', req, res);
  }

  // Sprint 1 + US04 - Consumption summary

  @Get('summary')
  @ApiOperation({
    summary: 'Consumption summary (count, total, average)',
    description:
      'Retrieve the consumption summary for a device or date range. ' +
      'Supports optional deviceId, from and to filters.',
  })
  @ApiQuery(DEVICE_FILTER)
  @ApiQuery(FROM_FILTER)
  @ApiQuery(TO_FILTER)
  @ApiOkResponse({
    type: ConsumptionSummaryDoc,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid query parameters or date range.',
  })
  summary(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.proxy.forward('energy-monitoring-service', req, res);
  }

  // US03 + US04 - Estimated energy cost

  @Get('estimated-cost')
  @ApiOperation({
    summary: 'Estimate energy consumption cost in PEN',
    description:
      'Estimate energy consumption cost using registered measurements ' +
      'and a configurable reference tariff in PEN per kWh. ' +
      'Supports optional deviceId, from and to filters.',
  })
  @ApiQuery(DEVICE_FILTER)
  @ApiQuery(FROM_FILTER)
  @ApiQuery(TO_FILTER)
  @ApiQuery({
    name: 'tariffPerKwh',
    required: true,
    type: Number,
    example: 0.7,
    description: 'Reference energy tariff in PEN per kWh. Must be positive.',
  })
  @ApiOkResponse({
    type: EstimatedEnergyCostDoc,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid tariff or date range.',
  })
  estimatedCost(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.proxy.forward('energy-monitoring-service', req, res);
  }

  // US04 - Grouped consumption history

  @Get('grouped-history')
  @ApiOperation({
    summary: 'Get grouped energy consumption history',
    description:
      'Retrieve energy consumption grouped by day, week or month. ' +
      'Supports optional device and UTC date filters.',
  })
  @ApiQuery(DEVICE_FILTER)
  @ApiQuery(FROM_FILTER)
  @ApiQuery(TO_FILTER)
  @ApiQuery({
    name: 'granularity',
    required: true,
    enum: ['day', 'week', 'month'],
    example: 'day',
    description: 'Grouping period. Weeks begin on Monday (UTC).',
  })
  @ApiOkResponse({
    type: GroupedEnergyHistoryDoc,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid granularity or date range.',
  })
  groupedHistory(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.proxy.forward('energy-monitoring-service', req, res);
  }

  // US05 - Compare energy consumption between periods

  @Get('compare-periods')
  @ApiOperation({
    summary: 'Compare energy consumption between periods (US05)',
    description:
      'Compare two UTC intervals for one device. The Energy Monitoring Service ' +
      'validates dates and computes the comparison.',
  })
  @ApiQuery({
    name: 'deviceId',
    required: true,
    type: String,
    example: 'device-001',
  })
  @ApiQuery({
    name: 'baselineFrom',
    required: true,
    type: String,
    example: '2026-10-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'baselineTo',
    required: true,
    type: String,
    example: '2026-10-07T23:59:59.999Z',
  })
  @ApiQuery({
    name: 'comparisonFrom',
    required: true,
    type: String,
    example: '2026-10-08T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'comparisonTo',
    required: true,
    type: String,
    example: '2026-10-14T23:59:59.999Z',
  })
  @ApiOkResponse({
    type: EnergyPeriodComparisonDoc,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
  })
  comparePeriods(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.proxy.forward('energy-monitoring-service', req, res);
  }

  // Sprint 1 - Find measurement by UUID

  @Get(':id')
  @ApiOperation({
    summary: 'Get an energy measurement by id',
    description: 'Retrieve a specific energy measurement using its UUID.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
  })
  @ApiOkResponse({
    type: MeasurementDoc,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
  })
  findOne(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.proxy.forward('energy-monitoring-service', req, res);
  }
}