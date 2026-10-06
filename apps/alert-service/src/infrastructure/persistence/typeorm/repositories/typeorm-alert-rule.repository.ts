import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertRule } from '../../../../domain/entities/alert-rule.entity';
import { AlertRuleRepository } from '../../../../domain/repositories/alert-rule.repository';
import { AlertRuleOrmEntity } from '../entities/alert-rule.orm-entity';
import { AlertRuleMapper } from '../mappers/alert-rule.mapper';

@Injectable()
export class TypeOrmAlertRuleRepository implements AlertRuleRepository {
  constructor(
    @InjectRepository(AlertRuleOrmEntity)
    private readonly repository: Repository<AlertRuleOrmEntity>,
  ) {}

  async save(rule: AlertRule): Promise<void> {
    await this.repository.save(AlertRuleMapper.toPersistence(rule));
  }

  async findAll(): Promise<AlertRule[]> {
    const entities = await this.repository.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => AlertRuleMapper.toDomain(entity));
  }

  async findActive(): Promise<AlertRule[]> {
    const entities = await this.repository.find({
      where: { active: true },
      order: { createdAt: 'ASC' },
    });
    return entities.map((entity) => AlertRuleMapper.toDomain(entity));
  }
}
