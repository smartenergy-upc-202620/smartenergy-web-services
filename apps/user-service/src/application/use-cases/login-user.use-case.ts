import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email.value-object';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';
import { PASSWORD_HASHER, PasswordHasher } from '../ports/password-hasher.port';
import { TOKEN_SERVICE, TokenService } from '../ports/token-service.port';

export interface LoginUserCommand {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  user: User;
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginResult> {
    const user = await this.users.findByEmail(Email.create(command.email));
    const passwordMatches =
      user !== null &&
      (await this.passwordHasher.compare(command.password, user.passwordHash));
    // Same error for unknown email and wrong password: no user enumeration.
    if (!user || !passwordMatches) {
      throw new InvalidCredentialsException();
    }

    const accessToken = await this.tokens.issue({
      sub: user.id,
      email: user.email.value,
      role: user.role,
    });
    return { accessToken, user };
  }
}
