import { Email } from '../value-objects/email.value-object';
import { User } from './user.entity';

describe('User', () => {
  it('exposes its identity data', () => {
    const createdAt = new Date('2026-01-01T00:00:00Z');
    const user = new User({
      id: 'user-1',
      email: Email.create('user@example.com'),
      passwordHash: 'hashed-value',
      createdAt,
    });

    expect(user.id).toBe('user-1');
    expect(user.email.value).toBe('user@example.com');
    expect(user.passwordHash).toBe('hashed-value');
    expect(user.createdAt).toBe(createdAt);
  });
});
