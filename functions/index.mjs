import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { createApi } from './api.mjs';
import { createStore } from './store.mjs';

initializeApp();
const adminUsername = defineSecret('DASHBOARD_ADMIN_USERNAME');
const adminPasswordHash = defineSecret('DASHBOARD_ADMIN_PASSWORD_HASH');
let app;

export const dashboardApi = onRequest({
  region: 'us-central1',
  secrets: [adminUsername, adminPasswordHash],
  maxInstances: 3,
  memory: '256MiB',
  timeoutSeconds: 30,
  invoker: 'public',
}, (req, res) => {
  const local = process.env.FUNCTIONS_EMULATOR === 'true';
  app ||= createApi({
    store: createStore(getFirestore()),
    username: adminUsername.value(),
    passwordHash: adminPasswordHash.value(),
    origins: ['https://revilodev.com', 'https://www.revilodev.com', 'https://revilodev.web.app', 'https://revilodev.firebaseapp.com', ...(local ? ['http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://localhost:5173', 'http://127.0.0.1:5000'] : [])],
    secure: !local,
    development: local,
  });
  return app(req, res);
});
