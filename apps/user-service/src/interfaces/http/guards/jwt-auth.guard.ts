import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  AccessTokenPayload,
  TOKEN_SERVICE,
  TokenService,
} from '../../../application/ports/token-service.port';

export interface AuthenticatedRequest extends Request {
  user: AccessTokenPayload;
}

/** Requires a valid `Authorization: Bearer <token>` header. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(TOKEN_SERVICE) private readonly tokens: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const payload = await this.tokens.verify(token);
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    request.user = payload;
    return true;
  }
}
