import { InvalidEnergyMeasurementException } from '../exceptions/invalid-energy-measurement.exception';

export interface EnergyMeasurementProps {
  id: string;
  deviceId: string;
  consumptionKwh: number;
  measuredAt: Date;
}

export class EnergyMeasurement {
  private constructor(private readonly props: EnergyMeasurementProps) {}

  static create(props: EnergyMeasurementProps): EnergyMeasurement {
    if (props.deviceId.trim().length === 0) {
      throw new InvalidEnergyMeasurementException('deviceId must not be empty');
    }
    if (!Number.isFinite(props.consumptionKwh) || props.consumptionKwh < 0) {
      throw new InvalidEnergyMeasurementException(
        'consumptionKwh must be a non-negative number',
      );
    }
    if (Number.isNaN(props.measuredAt.getTime())) {
      throw new InvalidEnergyMeasurementException(
        'measuredAt must be a valid date',
      );
    }
    return new EnergyMeasurement({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get deviceId(): string {
    return this.props.deviceId;
  }

  get consumptionKwh(): number {
    return this.props.consumptionKwh;
  }

  get measuredAt(): Date {
    return this.props.measuredAt;
  }
}
