import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email.value-object';
import { UserRole } from '../../domain/value-objects/user-role';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { GetCurrentUserUseCase } from './get-current-user.use-case';

describe('GetCurrentUserUseCase', () => {
  const users: jest.Mocked<UserRepository> = {
    save: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
  };
  const useCase = new GetCurrentUserUseCase(users);

  it('returns the user of the given id', async () => {
    const user = new User({
      id: 'user-1',
      email: Email.create('user@example.com'),
      passwordHash: 'hash',
      role: UserRole.HOME_USER,
      createdAt: new Date(),
    });
    users.findById.mockResolvedValue(user);

    await expect(useCase.execute('user-1')).resolves.toBe(user);
    expect(users.findById).toHaveBeenCalledWith('user-1');
  });

  it('fails when the user does not exist', async () => {
    users.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toThrow(
      UserNotFoundException,
    );
  });
});
