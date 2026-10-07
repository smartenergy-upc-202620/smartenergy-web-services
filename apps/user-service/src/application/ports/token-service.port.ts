import { UserRole } from '../../domain/value-objects/user-role';

export interface AccessTokenPayload {
  /** User id. */
  sub: string;
  email: string;
  role: UserRole;
}

export interface TokenService {
  issue(payload: AccessTokenPayload): Promise<string>;
  /** Returns the payload of a valid token, or `null` if it is invalid/expired. */
  verify(token: string): Promise<AccessTokenPayload | null>;
}

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');
