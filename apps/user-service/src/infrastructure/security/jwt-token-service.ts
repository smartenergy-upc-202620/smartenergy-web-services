import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AccessTokenPayload,
  TokenService,
} from '../../application/ports/token-service.port';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(private readonly jwt: JwtService) {}

  issue(payload: AccessTokenPayload): Promise<string> {
    return this.jwt.signAsync({ ...payload });
  }

  async verify(token: string): Promise<AccessTokenPayload | null> {
    try {
      const { sub, email, role } =
        await this.jwt.verifyAsync<AccessTokenPayload>(token);
      return { sub, email, role };
    } catch {
      return null;
    }
  }
}
