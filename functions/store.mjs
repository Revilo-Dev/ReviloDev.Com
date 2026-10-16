import { Timestamp } from 'firebase-admin/firestore';
import { aggregateEvent } from './security.mjs';

export function createStore(db) {
  return {
    async createSession(key, session) {
      await db.collection('dashboardSessions').doc(key).set({ ...session, deleteAfter: Timestamp.fromMillis(session.expiresAt) });
    },
    async getSession(key) { return (await db.collection('dashboardSessions').doc(key).get()).data(); },
    async deleteSession(key) { await db.collection('dashboardSessions').doc(key).delete(); },
    async allowRequest(key, max) {
      const ref = db.collection('dashboardRateLimits').doc(key);
      return db.runTransaction(async (tx) => {
        const doc = await tx.get(ref);
        const count = doc.data()?.count || 0;
        if (count >= max) return false;
        tx.set(ref, { count: count + 1, deleteAfter: Timestamp.fromMillis(Date.now() + 120000) });
        return true;
      });
    },
    async recordEvent(event) {
      const now = Date.now();
      const day = new Date(now).toISOString().slice(0, 10);
      const dayRef = db.collection('analyticsDays').doc(day);
      const viewRef = db.collection('analyticsViews').doc(`${event.visitId}_${event.viewId}`);
      const visitRef = db.collection('analyticsVisits').doc(event.visitId);
      await db.runTransaction(async (tx) => {
        const [dayDoc, viewDoc, visitDoc] = await tx.getAll(dayRef, viewRef, visitRef);
        const view = viewDoc.data();
        if (view && view.path !== event.path) return;
        const daily = dayDoc.data();
        // Bound aggregate document sizes even when telemetry is abused.
        const boundedEvent = { ...event };
        if (Object.keys(daily?.pages || {}).length >= 400 && !Object.values(daily.pages).some((page) => page.label === event.path)) boundedEvent.path = '/other-pages';
        if (Object.keys(daily?.sources || {}).length >= 200 && !Object.values(daily.sources).some((source) => source.label === event.source)) boundedEvent.source = 'other';
        const result = aggregateEvent({ event: boundedEvent, view, visit: visitDoc.data(), daily, now });
        tx.set(dayRef, { ...result.stats, day, deleteAfter: Timestamp.fromMillis(now + 100 * 86400000) });
        tx.set(viewRef, { ...result.view, path: event.path, deleteAfter: Timestamp.fromMillis(now + 7 * 86400000) });
        if (result.firstVisit) tx.set(visitRef, { createdAt: now, deleteAfter: Timestamp.fromMillis(now + 86400000) });
      });
    },
    async readDays(since) {
      const snapshot = await db.collection('analyticsDays').where('day', '>=', since).orderBy('day').limit(90).get();
      return snapshot.docs.map((doc) => doc.data());
    },
  };
}
