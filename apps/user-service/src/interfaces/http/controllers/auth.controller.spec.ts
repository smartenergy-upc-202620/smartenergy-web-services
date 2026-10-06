import {
  HttpTestApp,
  startHttpTestApp,
} from '../../../../../../test/support/http-test-app';
import {
  PASSWORD_HASHER,
  PasswordHasher,
} from '../../../application/ports/password-hasher.port';
import {
  AccessTokenPayload,
  TOKEN_SERVICE,
  TokenService,
} from '../../../application/ports/token-service.port';
import { GetCurrentUserUseCase } from '../../../application/use-cases/get-current-user.use-case';
import { LoginUserUseCase } from '../../../application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case';
import { User } from '../../../domain/entities/user.entity';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../../domain/repositories/user.repository';
import { Email } from '../../../domain/value-objects/email.value-object';
import { USER_ERROR_STATUSES } from '../error-statuses';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthController } from './auth.controller';
import { UsersController } from './users.controller';

class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();

  save(user: User): Promise<void> {
    this.users.set(user.id, user);
    return Promise.resolve();
  }

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.get(id) ?? null);
  }

  findByEmail(email: Email): Promise<User | null> {
    const user = [...this.users.values()].find((u) => u.email.equals(email));
    return Promise.resolve(user ?? null);
  }
}

// Fakes for the ports: interfaces must not depend on infrastructure, and the
// real bcrypt / JWT adapters have their own tests.
class FakePasswordHasher implements PasswordHasher {
  hash(plain: string): Promise<string> {
    return Promise.resolve(`hashed:${plain}`);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return Promise.resolve(hash === `hashed:${plain}`);
  }
}

class FakeTokenService implements TokenService {
  private readonly issued = new Map<string, AccessTokenPayload>();

  issue(payload: AccessTokenPayload): Promise<string> {
    const token = `token-${this.issued.size + 1}`;
    this.issued.set(token, payload);
    return Promise.resolve(token);
  }

  verify(token: string): Promise<AccessTokenPayload | null> {
    return Promise.resolve(this.issued.get(token) ?? null);
  }
}

describe('Auth & Users HTTP API (user-service)', () => {
  const credentials = {
    email: 'user@example.com',
    password: 'StrongPassword123',
  };
  let api: HttpTestApp;

  beforeAll(async () => {
    api = await startHttpTestApp(
      {
        controllers: [AuthController, UsersController],
        providers: [
          RegisterUserUseCase,
          LoginUserUseCase,
          GetCurrentUserUseCase,
          JwtAuthGuard,
          { provide: USER_REPOSITORY, useValue: new InMemoryUserRepository() },
          { provide: PASSWORD_HASHER, useClass: FakePasswordHasher },
          { provide: TOKEN_SERVICE, useClass: FakeTokenService },
        ],
      },
      USER_ERROR_STATUSES,
    );
  });

  afterAll(() => api.close());

  it('POST /auth/register creates a user without exposing the password', async () => {
    const res = await api.request('POST', '/api/v1/auth/register', {
      body: { ...credentials, role: 'HOME_USER' },
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: expect.any(String),
      email: 'user@example.com',
      role: 'HOME_USER',
      createdAt: expect.any(String),
    });
    expect(JSON.stringify(res.body)).not.toMatch(/password/i);
  });

  it('POST /auth/register returns 409 for a duplicated email', async () => {
    const res = await api.request('POST', '/api/v1/auth/register', {
      body: credentials,
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Conflict');
  });

  it('POST /auth/register returns 400 for invalid data', async () => {
    const res = await api.request('POST', '/api/v1/auth/register', {
      body: { email: 'not-an-email', password: 'short', role: 'ROOT' },
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual(
      expect.arrayContaining([
        'email must be an email',
        'password must be longer than or equal to 8 characters',
      ]),
    );
  });

  it('POST /auth/login returns 401 for wrong credentials', async () => {
    const res = await api.request('POST', '/api/v1/auth/login', {
      body: { ...credentials, password: 'WrongPassword123' },
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('POST /auth/login + GET /users/me returns the authenticated user', async () => {
    const login = await api.request('POST', '/api/v1/auth/login', {
      body: credentials,
    });
    expect(login.status).toBe(200);
    expect(login.body.accessToken).toEqual(expect.any(String));
    expect(login.body.user.email).toBe('user@example.com');

    const me = await api.request('GET', '/api/v1/users/me', {
      headers: { authorization: `Bearer ${login.body.accessToken}` },
    });

    expect(me.status).toBe(200);
    expect(me.body).toEqual(login.body.user);
  });

  it('GET /users/me returns 401 without a valid token', async () => {
    const missing = await api.request('GET', '/api/v1/users/me');
    const invalid = await api.request('GET', '/api/v1/users/me', {
      headers: { authorization: 'Bearer invalid' },
    });

    expect(missing.status).toBe(401);
    expect(invalid.status).toBe(401);
  });
});
