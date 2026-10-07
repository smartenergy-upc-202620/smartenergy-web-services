import { AlertRule } from '../entities/alert-rule.entity';

export interface AlertRuleRepository {
  save(rule: AlertRule): Promise<void>;
  /** Most recent rules first. */
  findAll(): Promise<AlertRule[]>;
  findActive(): Promise<AlertRule[]>;
}

/** Injection token used to bind the PostgreSQL implementation (infrastructure). */
export const ALERT_RULE_REPOSITORY = Symbol('ALERT_RULE_REPOSITORY');
