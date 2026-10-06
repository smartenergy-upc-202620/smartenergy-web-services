import { HttpStatus } from '@nestjs/common';
import { ErrorStatusMap } from '@app/common';
import { AlertNotFoundException } from '../../application/exceptions/alert-not-found.exception';
import { InvalidAlertRuleException } from '../../domain/exceptions/invalid-alert-rule.exception';

export const ALERT_ERROR_STATUSES: ErrorStatusMap = [
  [InvalidAlertRuleException, HttpStatus.BAD_REQUEST],
  [AlertNotFoundException, HttpStatus.NOT_FOUND],
];
