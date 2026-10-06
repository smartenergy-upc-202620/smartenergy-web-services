import { BcryptPasswordHasher } from './bcrypt-password-hasher';

describe('BcryptPasswordHasher', () => {
  const hasher = new BcryptPasswordHasher();

  it('never returns the plain password and verifies it', async () => {
    const hash = await hasher.hash('StrongPassword123');

    expect(hash).not.toContain('StrongPassword123');
    expect(hash).toMatch(/^\$2[aby]\$10\$/);
    await expect(hasher.compare('StrongPassword123', hash)).resolves.toBe(true);
  });

  it('rejects a different password', async () => {
    const hash = await hasher.hash('StrongPassword123');

    await expect(hasher.compare('OtherPassword123', hash)).resolves.toBe(false);
  });

  it('salts every hash', async () => {
    const [a, b] = await Promise.all([
      hasher.hash('StrongPassword123'),
      hasher.hash('StrongPassword123'),
    ]);

    expect(a).not.toBe(b);
  });
});
