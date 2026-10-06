import { Alert } from '../entities/alert.entity';

export interface AlertRepository {
  save(alert: Alert): Promise<void>;
  findById(id: string): Promise<Alert | null>;
  findAll(): Promise<Alert[]>;
}

/** Injection token used to bind the PostgreSQL implementation (infrastructure). */
export const ALERT_REPOSITORY = Symbol('ALERT_REPOSITORY');
