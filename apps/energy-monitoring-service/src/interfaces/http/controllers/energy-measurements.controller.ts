import {
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
import { ListEnergyMeasurementsUseCase } from '../../../application/use-cases/list-energy-measurements.use-case';
import { CreateEnergyMeasurementDto } from '../dto/create-energy-measurement.dto';
import { EnergyMeasurementQueryDto } from '../dto/energy-measurement-query.dto';
import {
  EnergyConsumptionSummaryResponseDto,
  EnergyMeasurementResponseDto,
} from '../dto/energy-measurement-response.dto';

@ApiTags('measurements')
@Controller('measurements')
export class EnergyMeasurementsController {
  constructor(
    private readonly createMeasurement: CreateEnergyMeasurementUseCase,
    private readonly listMeasurements: ListEnergyMeasurementsUseCase,
    private readonly getMeasurementById: GetEnergyMeasurementByIdUseCase,
    private readonly getSummary: GetEnergyConsumptionSummaryUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register an energy measurement' })
  @ApiCreatedResponse({ type: EnergyMeasurementResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
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

  @Get()
  @ApiOperation({
    summary: 'List energy measurements, most recent first',
  })
  @ApiOkResponse({ type: EnergyMeasurementResponseDto, isArray: true })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async list(
    @Query() query: EnergyMeasurementQueryDto,
  ): Promise<EnergyMeasurementResponseDto[]> {
    const measurements = await this.listMeasurements.execute(query);
    return measurements.map((m) => EnergyMeasurementResponseDto.fromDomain(m));
  }

  // Declared before ':id' so "summary" is not captured as an id.
  @Get('summary')
  @ApiOperation({
    summary: 'Get a basic consumption summary (count, total and average)',
  })
  @ApiOkResponse({ type: EnergyConsumptionSummaryResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  summary(
    @Query() query: EnergyMeasurementQueryDto,
  ): Promise<EnergyConsumptionSummaryResponseDto> {
    return this.getSummary.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an energy measurement by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: EnergyMeasurementResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'The id is not a valid UUID',
  })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EnergyMeasurementResponseDto> {
    return EnergyMeasurementResponseDto.fromDomain(
      await this.getMeasurementById.execute(id),
    );
  }
}
