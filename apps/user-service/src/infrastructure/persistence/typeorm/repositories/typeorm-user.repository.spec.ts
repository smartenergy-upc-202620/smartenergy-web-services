import { QueryFailedError, Repository } from 'typeorm';
import { EmailAlreadyRegisteredException } from '../../../../application/exceptions/email-already-registered.exception';
import { User } from '../../../../domain/entities/user.entity';
import { Email } from '../../../../domain/value-objects/email.value-object';
import { UserRole } from '../../../../domain/value-objects/user-role';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { TypeOrmUserRepository } from './typeorm-user.repository';

describe('TypeOrmUserRepository', () => {
  const user = new User({
    id: 'user-1',
    email: Email.create('user@example.com'),
    passwordHash: 'hash',
    role: UserRole.HOME_USER,
    createdAt: new Date('2026-01-01T00:00:00Z'),
  });
  let orm: jest.Mocked<Pick<Repository<UserOrmEntity>, 'save' | 'findOneBy'>>;
  let repository: TypeOrmUserRepository;

  beforeEach(() => {
    orm = { save: jest.fn(), findOneBy: jest.fn() };
    repository = new TypeOrmUserRepository(
      orm as unknown as Repository<UserOrmEntity>,
    );
  });

  it('saves the persistence model of the user', async () => {
    await repository.save(user);

    expect(orm.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-1', email: 'user@example.com' }),
    );
  });

  it('finds a user by normalized email and maps it to the domain', async () => {
    orm.findOneBy.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hash',
      role: 'HOME_USER',
      createdAt: new Date(),
    });

    const found = await repository.findByEmail(
      Email.create('USER@example.com'),
    );

    expect(orm.findOneBy).toHaveBeenCalledWith({ email: 'user@example.com' });
    expect(found).toBeInstanceOf(User);
  });

  it('returns null when nothing is found', async () => {
    orm.findOneBy.mockResolvedValue(null);

    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('translates a unique violation into EmailAlreadyRegisteredException', async () => {
    orm.save.mockRejectedValue(
      new QueryFailedError('INSERT', [], { code: '23505' } as never),
    );

    await expect(repository.save(user)).rejects.toThrow(
      EmailAlreadyRegisteredException,
    );
  });
});
