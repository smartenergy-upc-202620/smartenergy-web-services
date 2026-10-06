import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '@app/common';
import { CreateAlertRuleUseCase } from '../../../application/use-cases/create-alert-rule.use-case';
import { ListAlertRulesUseCase } from '../../../application/use-cases/list-alert-rules.use-case';
import { AlertRuleResponseDto } from '../dto/alert-response.dto';
import { CreateAlertRuleDto } from '../dto/create-alert-rule.dto';

@ApiTags('alert-rules')
@Controller('alert-rules')
export class AlertRulesController {
  constructor(
    private readonly createAlertRule: CreateAlertRuleUseCase,
    private readonly listAlertRules: ListAlertRulesUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a consumption threshold alert rule' })
  @ApiCreatedResponse({ type: AlertRuleResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async create(@Body() dto: CreateAlertRuleDto): Promise<AlertRuleResponseDto> {
    return AlertRuleResponseDto.fromDomain(
      await this.createAlertRule.execute(dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List alert rules, most recent first' })
  @ApiOkResponse({ type: AlertRuleResponseDto, isArray: true })
  async list(): Promise<AlertRuleResponseDto[]> {
    const rules = await this.listAlertRules.execute();
    return rules.map((rule) => AlertRuleResponseDto.fromDomain(rule));
  }
}
