export interface AlertProps {
  id: string;
  alertRuleId: string;
  deviceId: string;
  consumptionKwh: number;
  triggeredAt: Date;
}

export class Alert {
  constructor(private readonly props: AlertProps) {}

  get id(): string {
    return this.props.id;
  }

  get alertRuleId(): string {
    return this.props.alertRuleId;
  }

  get deviceId(): string {
    return this.props.deviceId;
  }

  get consumptionKwh(): number {
    return this.props.consumptionKwh;
  }

  get triggeredAt(): Date {
    return this.props.triggeredAt;
  }
}
