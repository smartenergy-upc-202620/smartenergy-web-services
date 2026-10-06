import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from '../../../../domain/entities/alert.entity';
import { AlertRepository } from '../../../../domain/repositories/alert.repository';
import { AlertOrmEntity } from '../entities/alert.orm-entity';
import { AlertMapper } from '../mappers/alert.mapper';

@Injectable()
export class TypeOrmAlertRepository implements AlertRepository {
  constructor(
    @InjectRepository(AlertOrmEntity)
    private readonly repository: Repository<AlertOrmEntity>,
  ) {}

  async save(alert: Alert): Promise<void> {
    await this.repository.save(AlertMapper.toPersistence(alert));
  }

  async findById(id: string): Promise<Alert | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? AlertMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Alert[]> {
    const entities = await this.repository.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => AlertMapper.toDomain(entity));
  }
}
