// Loads demo data through the API Gateway (never touches the database
// directly) and walks the Sprint 1 flow. Run it manually against a local
// environment with the four services up:  pnpm demo:seed
// Never run it against production.

const GATEWAY = process.env.GATEWAY_URL ?? 'http://localhost:3000';
const EMAIL = process.env.DEMO_EMAIL ?? 'demo@example.com';
const PASSWORD = process.env.DEMO_PASSWORD ?? 'DemoPassword123';

async function call(method, path, { body, token, expect = [200, 201] } = {}) {
  const res = await fetch(`${GATEWAY}/api/v1${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;
  console.log(`${method} ${path} -> ${res.status}`);
  if (!expect.includes(res.status)) {
    throw new Error(`Unexpected ${res.status}: ${text}`);
  }
  return data;
}

const register = await call('POST', '/auth/register', {
  body: { email: EMAIL, password: PASSWORD, role: 'HOME_USER' },
  expect: [201, 409], // 409: already seeded
});
if (register?.statusCode === 409) console.log('  user already exists');

const { accessToken } = await call('POST', '/auth/login', {
  body: { email: EMAIL, password: PASSWORD },
});
const me = await call('GET', '/users/me', { token: accessToken });
console.log(`  logged in as ${me.email} (${me.role})`);

const readings = [
  ['device-001', 3.75, '2026-10-06T08:00:00.000Z'],
  ['device-001', 4.25, '2026-10-06T09:00:00.000Z'],
  ['device-002', 2.5, '2026-10-06T10:00:00.000Z'],
  ['device-002', 6.0, '2026-10-06T11:00:00.000Z'],
  ['device-003', 4.0, '2026-10-06T12:00:00.000Z'],
];
for (const [deviceId, consumptionKwh, measuredAt] of readings) {
  await call('POST', '/measurements', {
    body: { deviceId, consumptionKwh, measuredAt },
  });
}
console.log('  summary:', await call('GET', '/measurements/summary'));

const rules = await call('GET', '/alert-rules');
if (!rules.some((r) => r.name === 'High consumption')) {
  await call('POST', '/alert-rules', {
    body: { name: 'High consumption', thresholdKwh: 5.0 },
  });
}

const evaluation = await call('POST', '/alerts/evaluate', {
  body: { deviceId: 'device-002', consumptionKwh: 8.2 },
});
console.log(`  alerts generated: ${evaluation.alerts.length}`);
console.log('Demo data ready.');
