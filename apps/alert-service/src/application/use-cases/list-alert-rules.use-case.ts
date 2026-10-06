import { Inject, Injectable } from '@nestjs/common';
import { AlertRule } from '../../domain/entities/alert-rule.entity';
import {
  ALERT_RULE_REPOSITORY,
  AlertRuleRepository,
} from '../../domain/repositories/alert-rule.repository';

@Injectable()
export class ListAlertRulesUseCase {
  constructor(
    @Inject(ALERT_RULE_REPOSITORY) private readonly rules: AlertRuleRepository,
  ) {}

  execute(): Promise<AlertRule[]> {
    return this.rules.findAll();
  }
}
