import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '@app/common';
import type { Request, Response } from 'express';
import { DownstreamProxy } from '../../../infrastructure/http/downstream-proxy';
import {
  LoginRequestDoc,
  LoginResponseDoc,
  RegisterUserRequestDoc,
  UserDoc,
} from '../dto/gateway-docs.dto';

/** Routes forwarded to the user-service (Identity & Access). */
@Controller()
export class IdentityRoutesController {
  constructor(private readonly proxy: DownstreamProxy) {}

  @Post('auth/register')
  @ApiTags('auth')
  @ApiOperation({ summary: 'Register a new user (user-service)' })
  @ApiBody({ type: RegisterUserRequestDoc })
  @ApiCreatedResponse({ type: UserDoc })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiConflictResponse({ type: ErrorResponseDto })
  register(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.proxy.forward('user-service', req, res);
  }

  @Post('auth/login')
  @ApiTags('auth')
  @ApiOperation({ summary: 'Log in and obtain a JWT (user-service)' })
  @ApiBody({ type: LoginRequestDoc })
  @ApiOkResponse({ type: LoginResponseDoc })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.proxy.forward('user-service', req, res);
  }

  @Get('users/me')
  @ApiTags('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profile of the authenticated user (user-service)' })
  @ApiOkResponse({ type: UserDoc })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  me(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.proxy.forward('user-service', req, res);
  }
}
