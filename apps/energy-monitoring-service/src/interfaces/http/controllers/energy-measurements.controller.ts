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
import { GetEnergyConsumptionSummaryUseCase } from '../../../application/use-cases/get-energy-consumption-summary.use-case';
import { GetEnergyMeasurementByIdUseCase } from '../../../application/use-cases/get-energy-measurement-by-id.use-case';
import { GetEstimatedEnergyCostUseCase } from '../../../application/use-cases/get-estimated-energy-cost.use-case';
import { ListEnergyMeasurementsUseCase } from '../../../application/use-cases/list-energy-measurements.use-case';

import { EnergyMeasurementFilter } from '../../../domain/repositories/energy-measurement.repository';

import { CreateEnergyMeasurementDto } from '../dto/create-energy-measurement.dto';
import { EnergyMeasurementQueryDto } from '../dto/energy-measurement-query.dto';

import {
  EnergyConsumptionSummaryResponseDto,
  EnergyMeasurementResponseDto,
} from '../dto/energy-measurement-response.dto';

import {
  EstimatedEnergyCostQueryDto,
  EstimatedEnergyCostResponseDto,
} from '../dto/estimated-energy-cost.dto';

@ApiTags('measurements')
@Controller('measurements')
export class EnergyMeasurementsController {
  constructor(
    private readonly createMeasurement: CreateEnergyMeasurementUseCase,
    private readonly listMeasurements: ListEnergyMeasurementsUseCase,
    private readonly getMeasurementById: GetEnergyMeasurementByIdUseCase,
    private readonly getSummary: GetEnergyConsumptionSummaryUseCase,
    private readonly getEstimatedCost: GetEstimatedEnergyCostUseCase,
  ) {}

  // ============================================================
  // SPRINT 1 — REGISTER ENERGY MEASUREMENTS
  // ============================================================

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

  // ============================================================
  // US04 — CONSUMPTION HISTORY WITH DATE FILTERS
  // ============================================================

  @Get()
  @ApiOperation({
    summary: 'List energy measurements, most recent first',
    description:
      'Retrieve energy measurement history filtered by deviceId, from and to. Date boundaries are inclusive.',
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

    const measurements = await this.listMeasurements.execute(
      filter,
    );

    return measurements.map((measurement) =>
      EnergyMeasurementResponseDto.fromDomain(measurement),
    );
  }

  // ============================================================
  // SPRINT 1 + US04 — CONSUMPTION SUMMARY
  // ============================================================

  // Declared before ':id' so 'summary' is not captured as an id.
  @Get('summary')
  @ApiOperation({
    summary: 'Get a basic consumption summary (count, total and average)',
    description:
      'Summarize energy consumption with optional device and date filters.',
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
    const filter = this.validatedFilter(query);

    return this.getSummary.execute(filter);
  }

  // ============================================================
  // US03 + US04 — ESTIMATED ENERGY COST
  // ============================================================

  // Declared before ':id' to prevent route conflicts.
  @Get('estimated-cost')
  @ApiOperation({
    summary: 'Estimate the energy cost in PEN',
    description:
      'Calculate estimated energy cost using registered consumption, a reference tariff and optional date filters.',
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
    const filter = this.validatedFilter(query);

    return this.getEstimatedCost.execute(
      query.tariffPerKwh,
      filter,
    );
  }

  // ============================================================
  // SPRINT 1 — GET MEASUREMENT BY ID
  // ============================================================

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

  // ============================================================
  // US04 — DATE RANGE VALIDATION
  // ============================================================

  private validatedFilter(
    query: EnergyMeasurementQueryDto,
  ): EnergyMeasurementFilter {
    if (
      query.from &&
      query.to &&
      query.from.getTime() > query.to.getTime()
    ) {
      throw new BadRequestException(
        'The start date must not be after the end date',
      );
    }

    return {
      ...(query.deviceId
        ? { deviceId: query.deviceId }
        : {}),

      ...(query.from
        ? { from: query.from }
        : {}),

      ...(query.to
        ? { to: query.to }
        : {}),
    };
  }
}
