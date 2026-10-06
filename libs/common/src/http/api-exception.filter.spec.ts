import {
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiExceptionFilter } from './api-exception.filter';

class DomainRuleBroken extends Error {}

function capture(filter: ApiExceptionFilter, exception: unknown) {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ url: '/api/v1/things' }),
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;

  filter.catch(exception, host);
  return {
    statusCode: status.mock.calls[0][0] as number,
    body: json.mock.calls[0][0],
  };
}

describe('ApiExceptionFilter', () => {
  const filter = new ApiExceptionFilter([
    [DomainRuleBroken, HttpStatus.CONFLICT],
  ]);

  beforeAll(() => jest.spyOn(Logger.prototype, 'error').mockImplementation());

  it('keeps HTTP exceptions and their validation messages', () => {
    const { statusCode, body } = capture(
      filter,
      new BadRequestException(['email must be an email']),
    );

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      message: ['email must be an email'],
      path: '/api/v1/things',
    });
  });

  it('maps registered errors to their status code', () => {
    const { statusCode, body } = capture(
      filter,
      new DomainRuleBroken('already exists'),
    );

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      error: 'Conflict',
      message: 'already exists',
    });
  });

  it('hides unexpected errors behind a generic 500', () => {
    const { statusCode, body } = capture(
      filter,
      new Error('connection string with secrets'),
    );

    expect(statusCode).toBe(500);
    expect(body.message).toBe('Internal server error');
    expect(JSON.stringify(body)).not.toContain('secrets');
    expect(body).not.toHaveProperty('stack');
  });
});
