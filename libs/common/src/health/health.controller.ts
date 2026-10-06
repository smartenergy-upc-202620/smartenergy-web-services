import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HEALTH_SERVICE_NAME } from './health.constants';
import { HealthResponseDto } from './health-response.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(HEALTH_SERVICE_NAME) private readonly serviceName: string,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Service health check' })
  @ApiOkResponse({ type: HealthResponseDto })
  check(): HealthResponseDto {
    return {
      status: 'ok',
      service: this.serviceName,
      timestamp: new Date().toISOString(),
    };
  }
}
