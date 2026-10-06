import { ApiProperty } from '@nestjs/swagger';

/**
 * Body returned by every application when a request fails.
 */
export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: ['email must be an email'],
  })
  message: string | string[];

  @ApiProperty({ example: '/api/v1/auth/register' })
  path: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  timestamp: string;
}
