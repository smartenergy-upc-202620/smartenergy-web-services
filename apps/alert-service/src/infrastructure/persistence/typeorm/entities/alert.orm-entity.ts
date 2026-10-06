import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { AlertRuleOrmEntity } from './alert-rule.orm-entity';

/** Persistence model of `alerting.alerts`. */
@Entity({ name: 'alerts' })
export class AlertOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'rule_id', type: 'uuid' })
  ruleId: string;

  /** Only declared to create the foreign key; never loaded. */
  @ManyToOne(() => AlertRuleOrmEntity)
  @JoinColumn({ name: 'rule_id' })
  rule?: AlertRuleOrmEntity;

  @Column({ name: 'device_id', type: 'varchar', length: 100 })
  deviceId: string;

  @Column({ name: 'consumption_kwh', type: 'double precision' })
  consumptionKwh: number;

  @Column({ type: 'varchar', length: 500 })
  message: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
