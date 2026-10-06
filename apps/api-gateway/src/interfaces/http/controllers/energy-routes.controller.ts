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
  MeasurementDoc,
} from '../dto/gateway-docs.dto';

const DEVICE_FILTER = {
  name: 'deviceId',
  required: false,
  example: 'device-001',
} as const;

/** Routes forwarded to the energy-monitoring-service. */
@ApiTags('measurements')
@Controller('measurements')
export class EnergyRoutesController {
  constructor(private readonly proxy: DownstreamProxy) {}

  @Post()
  @ApiOperation({ summary: 'Register an energy measurement' })
  @ApiBody({ type: CreateMeasurementRequestDoc })
  @ApiCreatedResponse({ type: MeasurementDoc })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  create(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.proxy.forward('energy-monitoring-service', req, res);
  }

  @Get()
  @ApiOperation({ summary: 'List energy measurements, most recent first' })
  @ApiQuery(DEVICE_FILTER)
  @ApiOkResponse({ type: MeasurementDoc, isArray: true })
  list(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.proxy.forward('energy-monitoring-service', req, res);
  }

  // Declared before ':id' so "summary" is not captured as an id.
  @Get('summary')
  @ApiOperation({ summary: 'Consumption summary (count, total, average)' })
  @ApiQuery(DEVICE_FILTER)
  @ApiOkResponse({ type: ConsumptionSummaryDoc })
  summary(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.proxy.forward('energy-monitoring-service', req, res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an energy measurement by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: MeasurementDoc })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findOne(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.proxy.forward('energy-monitoring-service', req, res);
  }
}
