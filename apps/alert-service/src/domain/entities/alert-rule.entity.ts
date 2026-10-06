import { InvalidAlertRuleException } from '../exceptions/invalid-alert-rule.exception';

export interface AlertRuleProps {
  id: string;
  name: string;
  thresholdKwh: number;
  active: boolean;
  createdAt: Date;
}

export class AlertRule {
  private constructor(private readonly props: AlertRuleProps) {}

  static create(props: AlertRuleProps): AlertRule {
    if (props.id.trim().length === 0) {
      throw new InvalidAlertRuleException('id must not be empty');
    }
    if (props.name.trim().length === 0) {
      throw new InvalidAlertRuleException('name must not be empty');
    }
    if (!Number.isFinite(props.thresholdKwh) || props.thresholdKwh <= 0) {
      throw new InvalidAlertRuleException(
        'thresholdKwh must be a positive number',
      );
    }
    if (Number.isNaN(props.createdAt.getTime())) {
      throw new InvalidAlertRuleException('createdAt must be a valid date');
    }
    return new AlertRule({ ...props, name: props.name.trim() });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get thresholdKwh(): number {
    return this.props.thresholdKwh;
  }

  get active(): boolean {
    return this.props.active;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
