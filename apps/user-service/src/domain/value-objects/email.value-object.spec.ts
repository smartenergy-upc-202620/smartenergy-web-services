import { InvalidEmailException } from '../exceptions/invalid-email.exception';
import { Email } from './email.value-object';

describe('Email', () => {
  it('normalizes the address', () => {
    expect(Email.create('  User@Example.COM ').value).toBe('user@example.com');
  });

  it('compares by value', () => {
    expect(Email.create('a@b.com').equals(Email.create('A@B.com'))).toBe(true);
  });

  it('rejects an invalid address', () => {
    expect(() => Email.create('not-an-email')).toThrow(InvalidEmailException);
  });
});
