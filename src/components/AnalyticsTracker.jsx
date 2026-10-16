import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const VISIT_KEY = 'revilo-visit';
const timeout = 30 * 60 * 1000;
let memoryVisit;

function source() {
  try {
    const campaign = new URLSearchParams(location.search).get('utm_source');
    if (campaign && /^[a-z0-9][a-z0-9. _-]{0,79}$/i.test(campaign)) return campaign;
    const referrer = document.referrer && new URL(document.referrer);
    return referrer && referrer.hostname !== location.hostname ? referrer.hostname : 'direct';
  } catch { return 'direct'; }
}

function getVisit() {
  let visit = memoryVisit;
  try { visit = JSON.parse(sessionStorage.getItem(VISIT_KEY)) || visit; } catch { /* Storage may be blocked. */ }
  if (!visit || Date.now() - visit.lastSeen > timeout) visit = { id: crypto.randomUUID(), source: source() };
  visit.lastSeen = Date.now();
  memoryVisit = visit;
  try { sessionStorage.setItem(VISIT_KEY, JSON.stringify(visit)); } catch { /* Use the in-memory visit. */ }
  return visit;
}

export default function AnalyticsTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (/^\/dashboard(?:\/|$)/i.test(pathname) || navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return;
    let visit;
    let viewId;
    try { visit = getVisit(); viewId = crypto.randomUUID(); } catch { return; }
    let activeMs = 0;
    let started = false;
    let previous = performance.now();
    let visible = document.visibilityState === 'visible';
    const send = () => {
      started = true;
      const now = performance.now();
      if (visible) activeMs += Math.min(now - previous, 35000);
      previous = now;
      // A visit expires after 30 minutes without an active page.
      if (visible) {
        const current = getVisit();
        if (current.id !== visit.id) { visit = current; viewId = crypto.randomUUID(); activeMs = 0; }
      }
      fetch('/api/analytics/event', {
        method: 'POST', credentials: 'omit', keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitId: visit.id, viewId, path: pathname, source: visit.source, activeMs: Math.round(activeMs) }),
      }).catch(() => {});
    };
    const visibility = () => { send(); visible = document.visibilityState === 'visible'; previous = performance.now(); };
    const heartbeat = setInterval(() => { if (visible) send(); }, 30000);
    // Deferring avoids double counting React StrictMode's development effect check.
    const initial = setTimeout(send, 0);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', send);
    return () => {
      clearTimeout(initial);
      clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', send);
      if (started) send();
    };
  }, [pathname]);
  return null;
}
