import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Persistence model of `alerting.alert_rules`. */
@Entity({ name: 'alert_rules' })
export class AlertRuleOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ name: 'threshold_kwh', type: 'double precision' })
  thresholdKwh: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
