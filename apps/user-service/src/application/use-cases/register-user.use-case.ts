import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User } from '../../domain/entities/user.entity';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email.value-object';
import { UserRole } from '../../domain/value-objects/user-role';
import { EmailAlreadyRegisteredException } from '../exceptions/email-already-registered.exception';
import { PASSWORD_HASHER, PasswordHasher } from '../ports/password-hasher.port';

export interface RegisterUserCommand {
  email: string;
  password: string;
  role?: UserRole;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    const email = Email.create(command.email);
    if (await this.users.findByEmail(email)) {
      throw new EmailAlreadyRegisteredException(email.value);
    }

    const user = new User({
      id: randomUUID(),
      email,
      passwordHash: await this.passwordHasher.hash(command.password),
      role: command.role ?? UserRole.HOME_USER,
      createdAt: new Date(),
    });
    await this.users.save(user);
    return user;
  }
}
