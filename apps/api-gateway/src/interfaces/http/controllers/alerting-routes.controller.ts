import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '@app/common';
import type { Request, Response } from 'express';
import { DownstreamProxy } from '../../../infrastructure/http/downstream-proxy';
import {
  AlertDoc,
  AlertRuleDoc,
  CreateAlertRuleRequestDoc,
  EvaluateConsumptionRequestDoc,
  EvaluationResultDoc,
} from '../dto/gateway-docs.dto';

/** Routes forwarded to the alert-service (Alerting). */
@Controller()
export class AlertingRoutesController {
  constructor(private readonly proxy: DownstreamProxy) {}

  @Post('alert-rules')
  @ApiTags('alert-rules')
  @ApiOperation({ summary: 'Create a consumption threshold alert rule' })
  @ApiBody({ type: CreateAlertRuleRequestDoc })
  @ApiCreatedResponse({ type: AlertRuleDoc })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  createRule(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.proxy.forward('alert-service', req, res);
  }

  @Get('alert-rules')
  @ApiTags('alert-rules')
  @ApiOperation({ summary: 'List alert rules' })
  @ApiOkResponse({ type: AlertRuleDoc, isArray: true })
  listRules(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.proxy.forward('alert-service', req, res);
  }

  @Post('alerts/evaluate')
  @ApiTags('alerts')
  @ApiOperation({
    summary: 'Evaluate a consumption reading against the active rules',
  })
  @ApiBody({ type: EvaluateConsumptionRequestDoc })
  @ApiOkResponse({ type: EvaluationResultDoc })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  evaluate(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.proxy.forward('alert-service', req, res);
  }

  @Get('alerts')
  @ApiTags('alerts')
  @ApiOperation({ summary: 'List generated alerts' })
  @ApiOkResponse({ type: AlertDoc, isArray: true })
  listAlerts(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.proxy.forward('alert-service', req, res);
  }

  @Get('alerts/:id')
  @ApiTags('alerts')
  @ApiOperation({ summary: 'Get an alert by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: AlertDoc })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findAlert(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.proxy.forward('alert-service', req, res);
  }
}
