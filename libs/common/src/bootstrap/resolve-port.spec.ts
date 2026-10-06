import { resolvePort } from './resolve-port';

describe('resolvePort', () => {
  const KEY = 'USER_SERVICE_PORT';

  it('uses the local default when nothing is set', () => {
    expect(resolvePort(KEY, 3001, {})).toBe(3001);
  });

  it('uses the service-specific variable locally', () => {
    expect(resolvePort(KEY, 3001, { [KEY]: '4001' })).toBe(4001);
  });

  it('gives PORT (cloud providers) precedence', () => {
    expect(resolvePort(KEY, 3001, { PORT: '8080', [KEY]: '4001' })).toBe(8080);
  });

  it('ignores an empty PORT', () => {
    expect(resolvePort(KEY, 3001, { PORT: '' })).toBe(3001);
  });

  it('rejects invalid ports', () => {
    expect(() => resolvePort(KEY, 3001, { PORT: 'abc' })).toThrow(
      'Invalid port "abc"',
    );
    expect(() => resolvePort(KEY, 3001, { PORT: '70000' })).toThrow();
  });
});
