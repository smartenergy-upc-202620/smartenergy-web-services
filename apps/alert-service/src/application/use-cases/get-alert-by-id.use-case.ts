import { Inject, Injectable } from '@nestjs/common';
import { Alert } from '../../domain/entities/alert.entity';
import {
  ALERT_REPOSITORY,
  AlertRepository,
} from '../../domain/repositories/alert.repository';
import { AlertNotFoundException } from '../exceptions/alert-not-found.exception';

@Injectable()
export class GetAlertByIdUseCase {
  constructor(
    @Inject(ALERT_REPOSITORY) private readonly alerts: AlertRepository,
  ) {}

  async execute(id: string): Promise<Alert> {
    const alert = await this.alerts.findById(id);
    if (!alert) {
      throw new AlertNotFoundException(id);
    }
    return alert;
  }
}
