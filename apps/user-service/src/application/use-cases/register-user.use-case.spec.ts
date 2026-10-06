import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email.value-object';
import { UserRole } from '../../domain/value-objects/user-role';
import { EmailAlreadyRegisteredException } from '../exceptions/email-already-registered.exception';
import { PasswordHasher } from '../ports/password-hasher.port';
import { RegisterUserUseCase } from './register-user.use-case';

describe('RegisterUserUseCase', () => {
  let users: jest.Mocked<UserRepository>;
  let hasher: jest.Mocked<PasswordHasher>;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    users = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue(null),
    };
    hasher = {
      hash: jest.fn().mockResolvedValue('hashed-password'),
      compare: jest.fn(),
    };
    useCase = new RegisterUserUseCase(users, hasher);
  });

  it('stores a new user with the hashed password', async () => {
    const user = await useCase.execute({
      email: ' User@Example.com ',
      password: 'StrongPassword123',
      role: UserRole.BUSINESS_ADMIN,
    });

    expect(hasher.hash).toHaveBeenCalledWith('StrongPassword123');
    expect(users.save).toHaveBeenCalledWith(user);
    expect(user.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(user.email.value).toBe('user@example.com');
    expect(user.passwordHash).toBe('hashed-password');
    expect(user.role).toBe(UserRole.BUSINESS_ADMIN);
  });

  it('defaults the role to HOME_USER', async () => {
    const user = await useCase.execute({
      email: 'user@example.com',
      password: 'StrongPassword123',
    });

    expect(user.role).toBe(UserRole.HOME_USER);
  });

  it('rejects an email that is already registered', async () => {
    users.findByEmail.mockResolvedValue(
      new User({
        id: 'existing',
        email: Email.create('user@example.com'),
        passwordHash: 'x',
        role: UserRole.HOME_USER,
        createdAt: new Date(),
      }),
    );

    await expect(
      useCase.execute({ email: 'user@example.com', password: 'whatever1' }),
    ).rejects.toThrow(EmailAlreadyRegisteredException);
    expect(users.save).not.toHaveBeenCalled();
  });
});
