import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '@app/common';
import { EvaluateMeasurementForAlertsUseCase } from '../../../application/use-cases/evaluate-measurement-for-alerts.use-case';
import { GetAlertByIdUseCase } from '../../../application/use-cases/get-alert-by-id.use-case';
import { ListAlertsUseCase } from '../../../application/use-cases/list-alerts.use-case';
import {
  AlertResponseDto,
  EvaluationResponseDto,
} from '../dto/alert-response.dto';
import { EvaluateConsumptionDto } from '../dto/evaluate-consumption.dto';

@ApiTags('alerts')
@Controller('alerts')
export class AlertsController {
  constructor(
    private readonly evaluateMeasurement: EvaluateMeasurementForAlertsUseCase,
    private readonly listAlerts: ListAlertsUseCase,
    private readonly getAlertById: GetAlertByIdUseCase,
  ) {}

  @Post('evaluate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Evaluate a consumption reading against the active alert rules',
    description:
      'Creates and returns one alert per active rule whose threshold is exceeded. An empty list means no rule was exceeded.',
  })
  @ApiOkResponse({ type: EvaluationResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async evaluate(
    @Body() dto: EvaluateConsumptionDto,
  ): Promise<EvaluationResponseDto> {
    const { evaluatedRules, alerts } =
      await this.evaluateMeasurement.execute(dto);
    return {
      evaluatedRules,
      alerts: alerts.map((alert) => AlertResponseDto.fromDomain(alert)),
    };
  }

  @Get()
  @ApiOperation({ summary: 'List generated alerts, most recent first' })
  @ApiOkResponse({ type: AlertResponseDto, isArray: true })
  async list(): Promise<AlertResponseDto[]> {
    const alerts = await this.listAlerts.execute();
    return alerts.map((alert) => AlertResponseDto.fromDomain(alert));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an alert by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: AlertResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'The id is not a valid UUID',
  })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AlertResponseDto> {
    return AlertResponseDto.fromDomain(await this.getAlertById.execute(id));
  }
}
