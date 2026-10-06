import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AlertRule } from '../../domain/entities/alert-rule.entity';
import {
  ALERT_RULE_REPOSITORY,
  AlertRuleRepository,
} from '../../domain/repositories/alert-rule.repository';

export interface CreateAlertRuleCommand {
  name: string;
  thresholdKwh: number;
  active?: boolean;
}

@Injectable()
export class CreateAlertRuleUseCase {
  constructor(
    @Inject(ALERT_RULE_REPOSITORY) private readonly rules: AlertRuleRepository,
  ) {}

  async execute(command: CreateAlertRuleCommand): Promise<AlertRule> {
    const rule = AlertRule.create({
      id: randomUUID(),
      name: command.name,
      thresholdKwh: command.thresholdKwh,
      active: command.active ?? true,
      createdAt: new Date(),
    });
    await this.rules.save(rule);
    return rule;
  }
}
