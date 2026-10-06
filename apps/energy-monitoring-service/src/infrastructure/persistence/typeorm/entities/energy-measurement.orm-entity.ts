import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

/** Persistence model of `energy_monitoring.energy_measurements`. */
@Entity({ name: 'energy_measurements' })
export class EnergyMeasurementOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'device_id', type: 'varchar', length: 100 })
  deviceId: string;

  @Column({ name: 'consumption_kwh', type: 'double precision' })
  consumptionKwh: number;

  @Column({ name: 'measured_at', type: 'timestamptz' })
  measuredAt: Date;
}
