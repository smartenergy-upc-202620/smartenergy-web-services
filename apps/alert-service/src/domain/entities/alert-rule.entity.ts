import { InvalidAlertRuleException } from '../exceptions/invalid-alert-rule.exception';

export interface AlertRuleProps {
  id: string;
  deviceId: string;
  thresholdKwh: number;
}

export class AlertRule {
  private constructor(private readonly props: AlertRuleProps) {}

  static create(props: AlertRuleProps): AlertRule {
    if (props.deviceId.trim().length === 0) {
      throw new InvalidAlertRuleException('deviceId must not be empty');
    }
    if (!Number.isFinite(props.thresholdKwh) || props.thresholdKwh <= 0) {
      throw new InvalidAlertRuleException(
        'thresholdKwh must be a positive number',
      );
    }
    return new AlertRule({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get deviceId(): string {
    return this.props.deviceId;
  }

  get thresholdKwh(): number {
    return this.props.thresholdKwh;
  }
}
