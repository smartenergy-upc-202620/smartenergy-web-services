export interface AlertProps {
  id: string;
  ruleId: string;
  deviceId: string;
  consumptionKwh: number;
  message: string;
  createdAt: Date;
}

export class Alert {
  constructor(private readonly props: AlertProps) {}

  get id(): string {
    return this.props.id;
  }

  get ruleId(): string {
    return this.props.ruleId;
  }

  get deviceId(): string {
    return this.props.deviceId;
  }

  get consumptionKwh(): number {
    return this.props.consumptionKwh;
  }

  get message(): string {
    return this.props.message;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
