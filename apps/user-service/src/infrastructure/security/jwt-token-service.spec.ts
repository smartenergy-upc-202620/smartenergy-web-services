import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../domain/value-objects/user-role';
import { JwtTokenService } from './jwt-token-service';

describe('JwtTokenService', () => {
  const payload = {
    sub: 'user-1',
    email: 'user@example.com',
    role: UserRole.HOME_USER,
  };
  const tokens = new JwtTokenService(
    new JwtService({ secret: 'test-secret', signOptions: { expiresIn: '1h' } }),
  );

  it('issues a token that can be verified', async () => {
    const token = await tokens.issue(payload);

    await expect(tokens.verify(token)).resolves.toEqual(payload);
  });

  it('returns null for a token signed with another secret', async () => {
    const foreign = await new JwtService({ secret: 'other' }).signAsync(
      payload,
    );

    await expect(tokens.verify(foreign)).resolves.toBeNull();
  });

  it('returns null for garbage', async () => {
    await expect(tokens.verify('not-a-jwt')).resolves.toBeNull();
  });
});
