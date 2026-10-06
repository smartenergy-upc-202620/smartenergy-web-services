import { Inject, Injectable } from '@nestjs/common';
import { Alert } from '../../domain/entities/alert.entity';
import {
  ALERT_REPOSITORY,
  AlertRepository,
} from '../../domain/repositories/alert.repository';

@Injectable()
export class ListAlertsUseCase {
  constructor(
    @Inject(ALERT_REPOSITORY) private readonly alerts: AlertRepository,
  ) {}

  execute(): Promise<Alert[]> {
    return this.alerts.findAll();
  }
}
