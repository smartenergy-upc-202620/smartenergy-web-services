import { Alert } from '../entities/alert.entity';

export interface AlertRepository {
  save(alert: Alert): Promise<void>;
  findById(id: string): Promise<Alert | null>;
  /** Most recent alerts first. */
  findAll(): Promise<Alert[]>;
}

/** Injection token used to bind the PostgreSQL implementation (infrastructure). */
export const ALERT_REPOSITORY = Symbol('ALERT_REPOSITORY');
