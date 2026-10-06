import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnergyMeasurement } from '../../../../domain/entities/energy-measurement.entity';
import {
  EnergyMeasurementFilter,
  EnergyMeasurementRepository,
} from '../../../../domain/repositories/energy-measurement.repository';
import { EnergyMeasurementOrmEntity } from '../entities/energy-measurement.orm-entity';
import { EnergyMeasurementMapper } from '../mappers/energy-measurement.mapper';

@Injectable()
export class TypeOrmEnergyMeasurementRepository implements EnergyMeasurementRepository {
  constructor(
    @InjectRepository(EnergyMeasurementOrmEntity)
    private readonly repository: Repository<EnergyMeasurementOrmEntity>,
  ) {}

  async save(measurement: EnergyMeasurement): Promise<void> {
    await this.repository.save(
      EnergyMeasurementMapper.toPersistence(measurement),
    );
  }

  async findById(id: string): Promise<EnergyMeasurement | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? EnergyMeasurementMapper.toDomain(entity) : null;
  }

  async findAll(
    filter: EnergyMeasurementFilter = {},
  ): Promise<EnergyMeasurement[]> {
    const entities = await this.repository.find({
      where: filter.deviceId ? { deviceId: filter.deviceId } : {},
      order: { measuredAt: 'DESC' },
    });
    return entities.map((entity) => EnergyMeasurementMapper.toDomain(entity));
  }
}
