import { create } from 'zustand';
import snapshot from '../data/repositoryUpdates.json';
import { fetchRepositoryDates, REPOSITORY_CACHE_MS } from '../lib/repositoryUpdates.js';

const cacheKey = 'revilo-repository-updates-v1';
let cached;
try {
  const value = JSON.parse(localStorage.getItem(cacheKey));
  if (value && Number.isFinite(value.fetchedAt) && value.fetchedAt <= Date.now() && value.dates && typeof value.dates === 'object' && !Array.isArray(value.dates)) cached = value;
} catch { /* The verified build snapshot is available without browser storage. */ }
let pendingRequest;
let lastAttempt = 0;

const useRepositoryUpdatesStore = create((set, get) => ({
  dates: { ...snapshot.dates, ...cached?.dates },
  fetchedAt: cached?.fetchedAt || 0,
  refresh: () => {
    if (Date.now() - get().fetchedAt < REPOSITORY_CACHE_MS || Date.now() - lastAttempt < 60000) return pendingRequest;
    if (pendingRequest) return pendingRequest;
    lastAttempt = Date.now();
    pendingRequest = fetchRepositoryDates().then((dates) => {
      const fetchedAt = Date.now();
      set({ dates, fetchedAt });
      try { localStorage.setItem(cacheKey, JSON.stringify({ dates, fetchedAt })); } catch { /* In-memory cache remains available. */ }
    }).catch(() => {
      // Preserve the last verified GitHub values on rate limits or network errors.
    }).finally(() => { pendingRequest = undefined; });
    return pendingRequest;
  },
}));

export default useRepositoryUpdatesStore;
