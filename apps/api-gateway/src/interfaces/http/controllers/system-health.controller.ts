import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { DownstreamProxy } from '../../../infrastructure/http/downstream-proxy';
import { SystemHealthDoc } from '../dto/gateway-docs.dto';

@ApiTags('health')
@Controller('system/health')
export class SystemHealthController {
  constructor(private readonly proxy: DownstreamProxy) {}

  @Get()
  @ApiOperation({ summary: 'Health of the three downstream services' })
  @ApiOkResponse({ type: SystemHealthDoc, description: 'All services up' })
  @ApiServiceUnavailableResponse({
    type: SystemHealthDoc,
    description: 'At least one service is down',
  })
  async check(
    @Res({ passthrough: true }) res: Response,
  ): Promise<SystemHealthDoc> {
    const services = await this.proxy.checkHealth();
    const allUp = services.every((s) => s.status === 'up');
    res.status(allUp ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return { status: allUp ? 'ok' : 'degraded', services };
  }
}
