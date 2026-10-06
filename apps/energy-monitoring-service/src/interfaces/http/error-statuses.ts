import { HttpStatus } from '@nestjs/common';
import { ErrorStatusMap } from '@app/common';
import { EnergyMeasurementNotFoundException } from '../../application/exceptions/energy-measurement-not-found.exception';
import { InvalidEnergyMeasurementException } from '../../domain/exceptions/invalid-energy-measurement.exception';

export const ENERGY_ERROR_STATUSES: ErrorStatusMap = [
  [InvalidEnergyMeasurementException, HttpStatus.BAD_REQUEST],
  [EnergyMeasurementNotFoundException, HttpStatus.NOT_FOUND],
];
