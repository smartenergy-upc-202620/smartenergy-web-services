import { User } from '../../../../domain/entities/user.entity';
import { Email } from '../../../../domain/value-objects/email.value-object';
import { UserRole } from '../../../../domain/value-objects/user-role';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { UserMapper } from './user.mapper';

describe('UserMapper', () => {
  const user = new User({
    id: '3f1c2a4e-8d4b-4c4f-9f7e-2b1a6c9d0e11',
    email: Email.create('user@example.com'),
    passwordHash: 'hash',
    role: UserRole.BUSINESS_ADMIN,
    createdAt: new Date('2026-01-01T00:00:00Z'),
  });

  it('maps a domain user to its persistence model', () => {
    const entity = UserMapper.toPersistence(user);

    expect(entity).toBeInstanceOf(UserOrmEntity);
    expect(entity).toEqual({
      id: user.id,
      email: 'user@example.com',
      passwordHash: 'hash',
      role: 'BUSINESS_ADMIN',
      createdAt: user.createdAt,
    });
  });

  it('maps the persistence model back to an equivalent domain user', () => {
    const restored = UserMapper.toDomain(UserMapper.toPersistence(user));

    expect(restored).toBeInstanceOf(User);
    expect(restored.email.equals(user.email)).toBe(true);
    expect(restored.role).toBe(UserRole.BUSINESS_ADMIN);
    expect(restored.createdAt).toEqual(user.createdAt);
  });
});
