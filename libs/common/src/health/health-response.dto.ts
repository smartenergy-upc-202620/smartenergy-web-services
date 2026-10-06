import { ApiProperty } from '@nestjs/swagger';

/**
 * Response body of the health check endpoint exposed by every application.
 */
export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({ example: 'user-service' })
  service: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  timestamp: string;
}
