# Private dashboard backend

`/dashboard` is a public login screen. All analytics and the admin session are protected by the server API. No credentials or analytics database are included in the frontend bundle. The configured username and salted scrypt password hash live in Google Secret Manager. The plaintext password is never stored in this repository.

## Local preview

1. Run `npm install --prefix functions`.
2. The ignored `functions/.secret.local` has already been created for the requested account. Keep this file private. Firebase Functions automatically loads it in the emulator.
3. Run `firebase emulators:start --only "functions,firestore" --project demo-revilo` from the repository root. This demo project cannot access production data. The emulators listen on localhost only (Functions 5001, Firestore 8088).
4. Run `npm run dev` and open `/dashboard`. Vite proxies `/api` to the local function. Emulator cookies omit Secure only on localhost; production cookies always use Secure.
5. Run `npm test --prefix functions` for the authentication and counting tests.

To also test real database transactions and Firestore read protection while the emulator is running, set `$env:FIRESTORE_EMULATOR_HOST='127.0.0.1:8088'` in PowerShell before running the tests. Without that variable, the emulator integration test is skipped.

Local analytics are separate from production and labeled accordingly. No sample visits are fabricated in the dashboard. The dashboard stays locked if the backend or secrets are unavailable.

## Deployment

Use a Firebase account with access to the `revilodev` project. A billing-enabled Firebase plan, Cloud Functions, Secret Manager, and a Firestore **Native mode** database are required. Do not deploy these rules over an existing database without checking whether other applications use it; the rules supplied here permit no browser access.

1. Sign in to the correct account with `firebase login:add`, then select it using `firebase login:use <email>`.
2. Create the Firestore default database if it does not exist. Select the appropriate location for the site.
3. Store the prepared credentials directly in Secret Manager (the ignored files contain the username and **hash**, not the plaintext password):

   ```powershell
   firebase functions:secrets:set DASHBOARD_ADMIN_USERNAME --data-file .dashboard-local/username --project revilodev
   firebase functions:secrets:set DASHBOARD_ADMIN_PASSWORD_HASH --data-file .dashboard-local/password-hash --project revilodev
   ```

4. Run `npm run build`, then deploy `firebase deploy --only "functions:dashboard,firestore,hosting" --project revilodev` using the account with project access (`--account <email>` if needed).
5. The deployed `firestore.indexes.json` enables TTL policies on `deleteAfter` for `dashboardSessions`, `dashboardRateLimits`, `analyticsViews`, `analyticsVisits`, and `analyticsDays`. Sessions and rate limits are checked by the API even before TTL deletion runs. Raw anonymous visit/view state expires after 1/7 days; daily aggregates after 100 days. Verify these policies remain enabled when changing database configuration.
6. Verify `/api/admin/stats` returns 401 without a session, sign in at `/dashboard`, verify a visit from another browser appears, then sign out and verify the old session cannot read analytics.

Only deploy the supplied Hosting configuration together with the function: `/api/**` must rewrite to `dashboardApi` before the SPA fallback. Do not publish `functions/.secret.local` or `.dashboard-local`. Do not use `VITE_` variables for secrets. Add new production domains to the explicit origin allowlist in `index.mjs` if the domain changes.

## Measurement

- A visit is a random per-tab browsing session renewed after 30 minutes of inactivity. It is not a unique person. Counts can differ from other analytics tools and can include bots that execute JavaScript.
- Page views track pathname changes; query strings and fragments are excluded. A view's elapsed visible time is sent every 30 seconds, when the tab becomes hidden, on navigation, and at page exit. Delivery at exit is best effort.
- Average visit time is total visible time divided by visits in the selected UTC date range. It is an estimate, not a record of continuous attention. Sessions spanning midnight may contribute time to a day after their visit was counted.
- Attribution uses the first `utm_source` (limited to 80 safe characters) or external referring hostname. Unknown/missing referrals are direct. No full referrer URLs, IP addresses, user agents, names, or query strings are stored as analytics. Rate limiting uses short-lived hashed IP buckets, separate from analytics.
- Do Not Track and Global Privacy Control exclude analytics. Dashboard paths are excluded. Session IDs use sessionStorage, with an in-memory fallback when storage is blocked. Analytics starts only after deployment; historical visits cannot be recovered.
- The public ingestion endpoint accepts only small, validated events from approved origins and rate limits requests. Anonymous telemetry can still be spoofed; it is not suitable for financial or billing decisions.

## Authentication

The API verifies a salted scrypt hash server-side, limits login attempts, and creates a cryptographically random eight-hour session. Only its hash is stored in Firestore. The browser receives an HttpOnly, Secure, SameSite=Strict `__session` cookie (Firebase Hosting forwards this cookie). Admin responses are `private, no-store`; POSTs require an approved Origin and JSON content type. Logout revokes the server session. Firestore denies direct client reads and writes. Changing the password hash requires redeploying the function and deleting existing `dashboardSessions` to revoke active sessions.

Firebase documentation: [secrets](https://firebase.google.com/docs/functions/config-env), [Hosting function rewrites](https://firebase.google.com/docs/hosting/functions), [Hosting cookies/cache](https://firebase.google.com/docs/hosting/manage-cache), [server access and Firestore rules](https://firebase.google.com/docs/firestore/security/get-started).
