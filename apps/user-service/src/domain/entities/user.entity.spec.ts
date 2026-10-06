import { InvalidUserException } from '../exceptions/invalid-user.exception';
import { Email } from '../value-objects/email.value-object';
import { UserRole } from '../value-objects/user-role';
import { User, UserProps } from './user.entity';

describe('User', () => {
  const createdAt = new Date('2026-01-01T00:00:00Z');
  const validProps = (): UserProps => ({
    id: 'user-1',
    email: Email.create('user@example.com'),
    passwordHash: 'hashed-value',
    role: UserRole.HOME_USER,
    createdAt,
  });

  it('exposes its identity data', () => {
    const user = new User(validProps());

    expect(user.id).toBe('user-1');
    expect(user.email.value).toBe('user@example.com');
    expect(user.passwordHash).toBe('hashed-value');
    expect(user.role).toBe(UserRole.HOME_USER);
    expect(user.createdAt).toBe(createdAt);
  });

  it('rejects an empty password hash', () => {
    expect(() => new User({ ...validProps(), passwordHash: ' ' })).toThrow(
      InvalidUserException,
    );
  });

  it('rejects an unknown role', () => {
    expect(
      () => new User({ ...validProps(), role: 'ROOT' as UserRole }),
    ).toThrow(InvalidUserException);
  });

  it('rejects an empty id', () => {
    expect(() => new User({ ...validProps(), id: '' })).toThrow(
      InvalidUserException,
    );
  });
});
