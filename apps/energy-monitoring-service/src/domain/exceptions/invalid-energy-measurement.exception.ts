export class InvalidEnergyMeasurementException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidEnergyMeasurementException';
  }
}
