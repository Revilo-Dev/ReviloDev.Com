import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, before, test } from 'node:test';
import { createApi } from '../api.mjs';
import { aggregateEvent, hashPassword, normalizeEvent, summarize, verifyPassword } from '../security.mjs';

const origin = 'https://example.test';
let base, server, encoded;
const sessions = new Map();
const counters = new Map();
const store = {
  async createSession(key, session) { sessions.set(key, session); },
  async getSession(key) { return sessions.get(key); },
  async deleteSession(key) { sessions.delete(key); },
  async allowRequest(key, max) { const value = (counters.get(key) || 0) + 1; counters.set(key, value); return value <= max; },
  async recordEvent() {},
  async readDays() { return [{ day: '2026-10-16', visits: 2, views: 3, activeMs: 60000, pages: {}, sources: {} }]; },
};
before(async () => {
  encoded = await hashPassword('test-only-password');
  const app = createApi({ store, username: 'test-admin', passwordHash: encoded, origins: [origin] });
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());
const post = (path, body, requestOrigin = origin) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: requestOrigin }, body: JSON.stringify(body) });

test('salted password hashes verify without exposing the password', async () => {
  assert.equal(await verifyPassword('test-only-password', encoded), true);
  assert.equal(await verifyPassword('wrong', encoded), false);
  assert.notEqual(await hashPassword('test-only-password'), encoded);
  assert.equal(encoded.includes('test-only-password'), false);
});

test('private endpoints reject unauthenticated and forged sessions', async () => {
  for (const path of ['/api/admin/session', '/api/admin/stats']) {
    assert.equal((await fetch(base + path)).status, 401);
    assert.equal((await fetch(base + path, { headers: { Cookie: `__session=${'a'.repeat(64)}` } })).status, 401);
  }
});

test('login, private stats, session expiry, and logout are enforced server-side', async () => {
  assert.equal((await post('/api/admin/login', { username: 'test-admin', password: 'wrong' })).status, 401);
  const login = await post('/api/admin/login', { username: 'test-admin', password: 'test-only-password' });
  assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/); assert.match(cookie, /Secure/); assert.match(cookie, /SameSite=Strict/); assert.match(cookie, /Path=\/api\/admin/);
  const headers = { Cookie: cookie.split(';')[0] };
  const stats = await fetch(base + '/api/admin/stats?days=7', { headers });
  assert.equal(stats.status, 200);
  assert.match(stats.headers.get('cache-control'), /no-store/);
  assert.equal((await stats.json()).visits, 2);
  assert.equal((await fetch(base + '/api/admin/stats?days=999', { headers })).status, 400);
  const logout = await fetch(base + '/api/admin/logout', { method: 'POST', headers: { ...headers, Origin: origin, 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(logout.status, 204);
  assert.equal((await fetch(base + '/api/admin/stats', { headers })).status, 401);
  const newLogin = await post('/api/admin/login', { username: 'test-admin', password: 'test-only-password' });
  const newCookie = newLogin.headers.get('set-cookie').split(';')[0];
  for (const session of sessions.values()) session.expiresAt = Date.now() - 1;
  assert.equal((await fetch(base + '/api/admin/stats', { headers: { Cookie: newCookie } })).status, 401);
});

test('cross-origin requests, malformed JSON and unsupported events are rejected', async () => {
  assert.equal((await post('/api/admin/login', {}, 'https://attacker.test')).status, 403);
  assert.equal((await fetch(base + '/api/admin/login', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{' })).status, 400);
  assert.equal((await post('/api/analytics/event', { path: '/dashboard' })).status, 400);
});

test('login attempts are rate limited', async () => {
  counters.clear();
  for (let count = 0; count < 5; count++) assert.equal((await post('/api/admin/login', { username: 'bad', password: 'wrong' })).status, 401);
  assert.equal((await post('/api/admin/login', { username: 'bad', password: 'wrong' })).status, 429);
});

test('analytics count a visit once and ignore duplicate/out-of-order timing events', () => {
  const event = { visitId: randomUUID(), viewId: randomUUID(), path: '/Projects', source: 'github.com', activeMs: 0 };
  assert.deepEqual(normalizeEvent(event), event);
  assert.equal(normalizeEvent({ ...event, path: '/dashboard' }), null);
  assert.equal(normalizeEvent({ ...event, path: '/x?private=value' }), null);
  assert.equal(normalizeEvent({ ...event, activeMs: -1 }), null);
  let result = aggregateEvent({ event, now: 1000 });
  assert.equal(result.stats.visits, 1); assert.equal(result.stats.views, 1);
  result = aggregateEvent({ event: { ...event, activeMs: 30000 }, view: result.view, visit: {}, daily: result.stats, now: 31000 });
  result = aggregateEvent({ event: { ...event, activeMs: 30000 }, view: result.view, visit: {}, daily: result.stats, now: 32000 });
  result = aggregateEvent({ event: { ...event, activeMs: 10000 }, view: result.view, visit: {}, daily: result.stats, now: 33000 });
  assert.equal(result.stats.activeMs, 30000); assert.equal(result.stats.views, 1); assert.equal(result.stats.visits, 1);
  result = aggregateEvent({ event: { ...event, viewId: randomUUID(), path: '/About', activeMs: 0 }, visit: {}, daily: result.stats, now: 34000 });
  assert.equal(result.stats.views, 2); assert.equal(result.stats.visits, 1);
  const totals = summarize([{ day: '2026-10-16', ...result.stats }]);
  assert.equal(totals.sources[0].visits, 1); assert.equal(totals.pages.length, 2); assert.equal(totals.activeMs, 30000);
});
