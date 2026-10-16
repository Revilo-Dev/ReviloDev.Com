import express from 'express';
import { hashToken, newToken, normalizeEvent, summarize, verifyPassword } from './security.mjs';

export function createApi({ store, username, passwordHash, origins, secure = true, development = false }) {
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.set({ 'Cache-Control': 'private, no-store, max-age=0', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer' });
    if (req.method === 'POST' && (!origins.includes(req.get('origin')) || !req.is('application/json'))) return res.status(403).json({ error: 'Request not allowed.' });
    next();
  });
  app.use(express.json({ limit: '4kb' }));
  const cookieOptions = { httpOnly: true, secure, sameSite: 'strict', path: '/api/admin', maxAge: 8 * 60 * 60 * 1000 };
  const getToken = (req) => req.headers.cookie?.split(';').map((value) => value.trim()).find((value) => value.startsWith('__session='))?.slice(10);
  const authenticate = async (req, res, next) => {
    const token = getToken(req);
    if (!/^[a-f0-9]{64}$/.test(token || '')) return res.status(401).json({ error: 'Please sign in.' });
    const session = await store.getSession(hashToken(token));
    if (!session || session.expiresAt <= Date.now()) return res.status(401).json({ error: 'Please sign in.' });
    req.adminTokenHash = hashToken(token);
    next();
  };
  const rateLimit = (kind, max) => async (req, res, next) => {
    const key = hashToken(`${kind}:${req.ip}:${Math.floor(Date.now() / 60000)}`);
    if (!await store.allowRequest(key, max)) return res.status(429).set('Retry-After', '60').json({ error: 'Too many requests. Try again in a minute.' });
    next();
  };

  app.post('/api/admin/login', rateLimit('login', 5), async (req, res) => {
    const validPassword = await verifyPassword(req.body?.password, passwordHash);
    if (req.body?.username !== username || !validPassword) return res.status(401).json({ error: 'Incorrect username or password.' });
    const token = newToken();
    await store.createSession(hashToken(token), { expiresAt: Date.now() + cookieOptions.maxAge });
    res.cookie('__session', token, cookieOptions).json({ username });
  });
  app.get('/api/admin/session', authenticate, (req, res) => res.json({ username }));
  app.post('/api/admin/logout', authenticate, async (req, res) => {
    await store.deleteSession(req.adminTokenHash);
    res.clearCookie('__session', { ...cookieOptions, maxAge: undefined }).status(204).end();
  });
  app.get('/api/admin/stats', authenticate, async (req, res) => {
    const range = Number(req.query.days || 30);
    if (![7, 30, 90].includes(range)) return res.status(400).json({ error: 'Invalid date range.' });
    const start = new Date();
    start.setUTCDate(start.getUTCDate() - range + 1);
    const since = start.toISOString().slice(0, 10);
    const stats = summarize(await store.readDays(since));
    res.json({ ...stats, range, since, timezone: 'UTC', development });
  });
  app.post('/api/analytics/event', rateLimit('analytics', 120), async (req, res) => {
    const event = normalizeEvent(req.body);
    if (!event) return res.status(400).json({ error: 'Invalid event.' });
    await store.recordEvent(event);
    res.status(204).end();
  });
  app.use((req, res) => res.status(404).json({ error: 'API endpoint not found.' }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    // Never log request bodies, passwords, cookies, or analytics payloads.
    res.status(error.type === 'entity.too.large' ? 413 : error.type === 'entity.parse.failed' ? 400 : 503).json({ error: 'The service is unavailable. Please try again shortly.' });
  });
  return app;
}
