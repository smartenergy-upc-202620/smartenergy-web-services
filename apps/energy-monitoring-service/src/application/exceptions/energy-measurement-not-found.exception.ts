export class EnergyMeasurementNotFoundException extends Error {
  constructor(id: string) {
    super(`Energy measurement "${id}" was not found`);
    this.name = 'EnergyMeasurementNotFoundException';
  }
}
