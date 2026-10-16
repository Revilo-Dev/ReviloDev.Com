import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
export const hashToken = (token) => createHash('sha256').update(token).digest('hex');
export const newToken = () => randomBytes(32).toString('hex');

export async function hashPassword(password) {
  const salt = randomBytes(32).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password, encoded) {
  const [type, salt, hash] = String(encoded || '').split(':');
  if (type !== 'scrypt' || !/^[a-f0-9]{64}$/.test(salt || '') || !/^[a-f0-9]{128}$/.test(hash || '')) throw new Error('Admin password hash is not configured');
  if (typeof password !== 'string' || password.length > 256) return false;
  const actual = await scrypt(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(hash, 'hex'));
}

export function normalizeEvent(body) {
  const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
  if (!uuid.test(body?.visitId) || !uuid.test(body?.viewId)) return null;
  if (typeof body.path !== 'string' || !/^\/(?!\/)[^?#\s]{0,199}$/.test(body.path) || /^\/dashboard(?:\/|$)/i.test(body.path)) return null;
  if (!Number.isFinite(body.activeMs) || body.activeMs < 0 || body.activeMs > 86400000) return null;
  const source = typeof body.source === 'string' && /^[a-z0-9][a-z0-9. _-]{0,79}$/i.test(body.source) ? body.source.toLowerCase() : 'direct';
  return { visitId: body.visitId, viewId: body.viewId, path: body.path, source, activeMs: Math.floor(body.activeMs) };
}

export function aggregateEvent({ event, view, visit, daily, now }) {
  const firstView = !view;
  const firstVisit = !visit;
  const previousMs = view?.activeMs || 0;
  const allowedMs = view ? Math.max(0, now - view.updatedAt) + 5000 : 60000;
  const activeMs = Math.max(previousMs, Math.min(event.activeMs, previousMs + allowedMs));
  const delta = activeMs - previousMs;
  const stats = structuredClone(daily || { visits: 0, views: 0, activeMs: 0, sources: {}, pages: {} });
  const pageKey = hashToken(event.path);
  const page = stats.pages[pageKey] || { label: event.path, views: 0, activeMs: 0 };
  page.views += firstView ? 1 : 0;
  page.activeMs += delta;
  stats.pages[pageKey] = page;
  stats.visits += firstVisit ? 1 : 0;
  stats.views += firstView ? 1 : 0;
  stats.activeMs += delta;
  if (firstVisit) {
    const key = hashToken(event.source);
    const source = stats.sources[key] || { label: event.source, visits: 0 };
    source.visits += 1;
    stats.sources[key] = source;
  }
  return { stats, view: { path: event.path, activeMs, updatedAt: now }, firstVisit };
}

export function summarize(days) {
  const total = { visits: 0, views: 0, activeMs: 0, sources: {}, pages: {}, daily: [] };
  for (const { day, ...data } of days) {
    total.visits += data.visits || 0;
    total.views += data.views || 0;
    total.activeMs += data.activeMs || 0;
    total.daily.push({ day, visits: data.visits || 0, views: data.views || 0 });
    for (const [key, source] of Object.entries(data.sources || {})) {
      total.sources[key] ||= { label: source.label, visits: 0 };
      total.sources[key].visits += source.visits;
    }
    for (const [key, page] of Object.entries(data.pages || {})) {
      total.pages[key] ||= { label: page.label, views: 0, activeMs: 0 };
      total.pages[key].views += page.views;
      total.pages[key].activeMs += page.activeMs;
    }
  }
  return { ...total, sources: Object.values(total.sources).sort((a, b) => b.visits - a.visits), pages: Object.values(total.pages).sort((a, b) => b.views - a.views), daily: total.daily.sort((a, b) => a.day.localeCompare(b.day)) };
}
