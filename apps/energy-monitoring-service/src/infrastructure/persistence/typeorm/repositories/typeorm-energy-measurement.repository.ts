import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  MoreThanOrEqual,
  LessThanOrEqual,
  Repository,
} from 'typeorm';

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
    const where: FindOptionsWhere<EnergyMeasurementOrmEntity> = {};

    if (filter.deviceId) {
      where.deviceId = filter.deviceId;
    }

    if (filter.from && filter.to) {
      where.measuredAt = Between(filter.from, filter.to);
    } else if (filter.from) {
      where.measuredAt = MoreThanOrEqual(filter.from);
    } else if (filter.to) {
      where.measuredAt = LessThanOrEqual(filter.to);
    }

    const entities = await this.repository.find({
      where,
      order: { measuredAt: 'DESC' },
    });

    return entities.map((entity) => EnergyMeasurementMapper.toDomain(entity));
  }
}
