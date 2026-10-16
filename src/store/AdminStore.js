import { create } from 'zustand';

let revision = 0;
let sessionRequest;

// Authentication is confirmed by the server, never restored from localStorage.
const useAdminStore = create((set) => ({
  admin: null,
  checking: true,
  sessionError: '',
  setAdmin: (admin) => {
    revision += 1;
    set({ admin, checking: false, sessionError: '' });
  },
  checkSession: () => {
    if (sessionRequest) return sessionRequest;
    const requestRevision = revision;
    sessionRequest = (async () => {
      let admin = null;
      let sessionError = '';
      try {
        const response = await fetch('/api/admin/session', { credentials: 'same-origin', cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          if (typeof data.username !== 'string' || !data.username) throw new Error('Invalid session');
          admin = data.username;
        } else if (response.status !== 401) throw new Error('Session unavailable');
      } catch {
        sessionError = 'The dashboard backend is unavailable. Please try again shortly.';
      }
      // A check started before a login/logout must not overwrite its result.
      if (requestRevision === revision) set({ admin, checking: false, sessionError });
    })().finally(() => { sessionRequest = undefined; });
    return sessionRequest;
  },
}));

export default useAdminStore;
