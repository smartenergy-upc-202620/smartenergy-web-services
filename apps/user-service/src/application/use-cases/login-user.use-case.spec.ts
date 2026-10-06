import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email.value-object';
import { UserRole } from '../../domain/value-objects/user-role';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';
import { PasswordHasher } from '../ports/password-hasher.port';
import { TokenService } from '../ports/token-service.port';
import { LoginUserUseCase } from './login-user.use-case';

describe('LoginUserUseCase', () => {
  const user = new User({
    id: 'user-1',
    email: Email.create('user@example.com'),
    passwordHash: 'hashed-password',
    role: UserRole.HOME_USER,
    createdAt: new Date(),
  });

  let users: jest.Mocked<UserRepository>;
  let hasher: jest.Mocked<PasswordHasher>;
  let tokens: jest.Mocked<TokenService>;
  let useCase: LoginUserUseCase;

  beforeEach(() => {
    users = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue(user),
    };
    hasher = { hash: jest.fn(), compare: jest.fn().mockResolvedValue(true) };
    tokens = {
      issue: jest.fn().mockResolvedValue('signed-token'),
      verify: jest.fn(),
    };
    useCase = new LoginUserUseCase(users, hasher, tokens);
  });

  it('returns an access token for valid credentials', async () => {
    const result = await useCase.execute({
      email: 'USER@example.com',
      password: 'StrongPassword123',
    });

    expect(hasher.compare).toHaveBeenCalledWith(
      'StrongPassword123',
      'hashed-password',
    );
    expect(tokens.issue).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'user@example.com',
      role: UserRole.HOME_USER,
    });
    expect(result).toEqual({ accessToken: 'signed-token', user });
  });

  it('rejects a wrong password', async () => {
    hasher.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'user@example.com', password: 'wrong' }),
    ).rejects.toThrow(InvalidCredentialsException);
    expect(tokens.issue).not.toHaveBeenCalled();
  });

  it('rejects an unknown email with the same error', async () => {
    users.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'nobody@example.com', password: 'x' }),
    ).rejects.toThrow(InvalidCredentialsException);
    expect(hasher.compare).not.toHaveBeenCalled();
  });
});
