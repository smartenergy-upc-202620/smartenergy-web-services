import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { ErrorResponseDto } from '@app/common';

import { CreateEnergyMeasurementUseCase } from '../../../application/use-cases/create-energy-measurement.use-case';
import { CompareEnergyPeriodsUseCase } from '../../../application/use-cases/compare-energy-periods.use-case';
import { GetEnergyConsumptionSummaryUseCase } from '../../../application/use-cases/get-energy-consumption-summary.use-case';
import { GetEnergyMeasurementByIdUseCase } from '../../../application/use-cases/get-energy-measurement-by-id.use-case';
import { GetEstimatedEnergyCostUseCase } from '../../../application/use-cases/get-estimated-energy-cost.use-case';
import { GetGroupedEnergyHistoryUseCase } from '../../../application/use-cases/get-grouped-energy-history.use-case';
import { ListEnergyMeasurementsUseCase } from '../../../application/use-cases/list-energy-measurements.use-case';

import { EnergyMeasurementFilter } from '../../../domain/repositories/energy-measurement.repository';

import { CreateEnergyMeasurementDto } from '../dto/create-energy-measurement.dto';

import {
  CompareEnergyPeriodsQueryDto,
  CompareEnergyPeriodsResponseDto,
} from '../dto/compare-energy-periods.dto';

import { EnergyMeasurementQueryDto } from '../dto/energy-measurement-query.dto';

import {
  EnergyConsumptionSummaryResponseDto,
  EnergyMeasurementResponseDto,
} from '../dto/energy-measurement-response.dto';

import {
  EstimatedEnergyCostQueryDto,
  EstimatedEnergyCostResponseDto,
} from '../dto/estimated-energy-cost.dto';

import {
  GroupedEnergyHistoryQueryDto,
  GroupedEnergyHistoryResponseDto,
} from '../dto/grouped-energy-history.dto';

@ApiTags('measurements')
@Controller('measurements')
export class EnergyMeasurementsController {
  constructor(
    private readonly createMeasurement: CreateEnergyMeasurementUseCase,
    private readonly listMeasurements: ListEnergyMeasurementsUseCase,
    private readonly getMeasurementById: GetEnergyMeasurementByIdUseCase,
    private readonly getSummary: GetEnergyConsumptionSummaryUseCase,
    private readonly getEstimatedCost: GetEstimatedEnergyCostUseCase,
    private readonly getGroupedHistory: GetGroupedEnergyHistoryUseCase,
    private readonly comparePeriodsUseCase: CompareEnergyPeriodsUseCase,
  ) {}

  // Sprint 1 - Register an energy measurement

  @Post()
  @ApiOperation({
    summary: 'Register an energy measurement',
  })
  @ApiCreatedResponse({
    type: EnergyMeasurementResponseDto,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
  })
  async create(
    @Body() dto: CreateEnergyMeasurementDto,
  ): Promise<EnergyMeasurementResponseDto> {
    const measurement = await this.createMeasurement.execute({
      deviceId: dto.deviceId,
      consumptionKwh: dto.consumptionKwh,
      measuredAt: new Date(dto.measuredAt),
    });

    return EnergyMeasurementResponseDto.fromDomain(measurement);
  }

  // US04 - List measurements with date filters

  @Get()
  @ApiOperation({
    summary: 'List energy measurements, most recent first',
    description: 'Retrieve measurements filtered by deviceId, from and to.',
  })
  @ApiOkResponse({
    type: EnergyMeasurementResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
  })
  async list(
    @Query() query: EnergyMeasurementQueryDto,
  ): Promise<EnergyMeasurementResponseDto[]> {
    const filter = this.validatedFilter(query);

    const measurements = await this.listMeasurements.execute(filter);

    return measurements.map((measurement) =>
      EnergyMeasurementResponseDto.fromDomain(measurement),
    );
  }

  // Sprint 1 + US04 - Consumption summary

  @Get('summary')
  @ApiOperation({
    summary: 'Get a basic consumption summary (count, total and average)',
  })
  @ApiOkResponse({
    type: EnergyConsumptionSummaryResponseDto,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
  })
  summary(
    @Query() query: EnergyMeasurementQueryDto,
  ): Promise<EnergyConsumptionSummaryResponseDto> {
    return this.getSummary.execute(this.validatedFilter(query));
  }

  // US03 + US04 - Estimated energy cost

  @Get('estimated-cost')
  @ApiOperation({
    summary: 'Estimate the energy cost in PEN',
    description:
      'Calculate estimated energy cost using registered measurements and a reference tariff.',
  })
  @ApiOkResponse({
    type: EstimatedEnergyCostResponseDto,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
  })
  estimatedCost(
    @Query() query: EstimatedEnergyCostQueryDto,
  ): Promise<EstimatedEnergyCostResponseDto> {
    return this.getEstimatedCost.execute(
      query.tariffPerKwh,
      this.validatedFilter(query),
    );
  }

  // US04 - Grouped consumption history

  @Get('grouped-history')
  @ApiOperation({
    summary: 'Get grouped energy consumption history',
    description:
      'Group energy measurements by day, week or month. Supports deviceId, from and to filters. Weeks start on Monday in UTC.',
  })
  @ApiOkResponse({
    type: GroupedEnergyHistoryResponseDto,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
  })
  groupedHistory(
    @Query() query: GroupedEnergyHistoryQueryDto,
  ): Promise<GroupedEnergyHistoryResponseDto> {
    return this.getGroupedHistory.execute(
      query.granularity,
      this.validatedFilter(query),
    );
  }

  // US05 - Compare two ordered, non-overlapping periods

  @Get('compare-periods')
  @ApiOperation({
    summary: 'Compare energy consumption between two periods (US05)',
    description:
      'Compare two UTC date ranges for one device. ' +
      'Null consumption means no measurements; null percentage means undefined.',
  })
  @ApiOkResponse({
    type: CompareEnergyPeriodsResponseDto,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
  })
  comparePeriods(
    @Query() query: CompareEnergyPeriodsQueryDto,
  ): Promise<CompareEnergyPeriodsResponseDto> {
    return this.comparePeriodsUseCase.execute({
      deviceId: query.deviceId,
      baselineFrom: new Date(query.baselineFrom),
      baselineTo: new Date(query.baselineTo),
      comparisonFrom: new Date(query.comparisonFrom),
      comparisonTo: new Date(query.comparisonTo),
    });
  }

  // Sprint 1 - Find measurement by UUID

  @Get(':id')
  @ApiOperation({
    summary: 'Get an energy measurement by id',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
  })
  @ApiOkResponse({
    type: EnergyMeasurementResponseDto,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'The id is not a valid UUID',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EnergyMeasurementResponseDto> {
    return EnergyMeasurementResponseDto.fromDomain(
      await this.getMeasurementById.execute(id),
    );
  }

  // US04 - Shared date range validation

  private validatedFilter(
    query: EnergyMeasurementQueryDto,
  ): EnergyMeasurementFilter {
    if (query.from && query.to && query.from.getTime() > query.to.getTime()) {
      throw new BadRequestException(
        'The start date must not be after the end date',
      );
    }

    return {
      ...(query.deviceId ? { deviceId: query.deviceId } : {}),
      ...(query.from ? { from: query.from } : {}),
      ...(query.to ? { to: query.to } : {}),
    };
  }
}