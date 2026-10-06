import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AppConfigModule,
  HealthModule,
  postgresTypeOrmModule,
} from '@app/common';
import { CreateEnergyMeasurementUseCase } from './application/use-cases/create-energy-measurement.use-case';
import { GetEnergyConsumptionSummaryUseCase } from './application/use-cases/get-energy-consumption-summary.use-case';
import { GetEnergyMeasurementByIdUseCase } from './application/use-cases/get-energy-measurement-by-id.use-case';
import { ListEnergyMeasurementsUseCase } from './application/use-cases/list-energy-measurements.use-case';
import { ENERGY_MEASUREMENT_REPOSITORY } from './domain/repositories/energy-measurement.repository';
import { EnergyMeasurementOrmEntity } from './infrastructure/persistence/typeorm/entities/energy-measurement.orm-entity';
import { TypeOrmEnergyMeasurementRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-energy-measurement.repository';
import { EnergyMeasurementsController } from './interfaces/http/controllers/energy-measurements.controller';

@Module({
  imports: [
    AppConfigModule,
    HealthModule.register('energy-monitoring-service'),
    postgresTypeOrmModule('energy_monitoring', [EnergyMeasurementOrmEntity]),
    TypeOrmModule.forFeature([EnergyMeasurementOrmEntity]),
  ],
  controllers: [EnergyMeasurementsController],
  providers: [
    CreateEnergyMeasurementUseCase,
    ListEnergyMeasurementsUseCase,
    GetEnergyMeasurementByIdUseCase,
    GetEnergyConsumptionSummaryUseCase,
    {
      provide: ENERGY_MEASUREMENT_REPOSITORY,
      useClass: TypeOrmEnergyMeasurementRepository,
    },
  ],
})
export class AppModule {}
