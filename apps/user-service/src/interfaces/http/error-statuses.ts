import { HttpStatus } from '@nestjs/common';
import { ErrorStatusMap } from '@app/common';
import { EmailAlreadyRegisteredException } from '../../application/exceptions/email-already-registered.exception';
import { InvalidCredentialsException } from '../../application/exceptions/invalid-credentials.exception';
import { UserNotFoundException } from '../../application/exceptions/user-not-found.exception';
import { InvalidEmailException } from '../../domain/exceptions/invalid-email.exception';
import { InvalidUserException } from '../../domain/exceptions/invalid-user.exception';

export const USER_ERROR_STATUSES: ErrorStatusMap = [
  [InvalidEmailException, HttpStatus.BAD_REQUEST],
  [InvalidUserException, HttpStatus.BAD_REQUEST],
  [InvalidCredentialsException, HttpStatus.UNAUTHORIZED],
  [UserNotFoundException, HttpStatus.NOT_FOUND],
  [EmailAlreadyRegisteredException, HttpStatus.CONFLICT],
];
