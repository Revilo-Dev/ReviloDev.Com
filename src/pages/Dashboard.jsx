import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Clock3, Eye, Globe, LockKeyhole, LogOut, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import useAdminStore from '../store/AdminStore.js';
import './Dashboard.css';

async function api(path, options = {}) {
  const response = await fetch(`/api/admin/${path}`, { credentials: 'same-origin', cache: 'no-store', ...options });
  let data;
  try { data = response.status === 204 ? {} : await response.json(); }
  catch { throw new Error('The dashboard backend is not connected. Please try again once it is configured.'); }
  if (!response.ok) {
    const error = new Error(data.error || 'Unable to load the dashboard.');
    error.status = response.status;
    throw error;
  }
  return data;
}

const duration = (ms) => {
  const seconds = Math.round(ms / 1000);
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};
const number = (value) => new Intl.NumberFormat().format(value);

export default function Dashboard() {
  const { admin, setAdmin, checking, sessionError } = useAdminStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);
  const [refresh, setRefresh] = useState(0);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots'; meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { meta.remove(); };
  }, []);

  useEffect(() => {
    if (!admin) return;
    let current = true;
    setLoadingStats(true);
    setStats(null);
    setError('');
    api(`stats?days=${days}`).then((data) => { if (current) setStats(data); })
      .catch((failure) => {
        if (!current) return;
        if (failure.status === 401) { setAdmin(null); setStats(null); }
        setError(failure.message);
      }).finally(() => { if (current) setLoadingStats(false); });
    return () => { current = false; };
  }, [admin, days, refresh, setAdmin]);

  const daily = useMemo(() => {
    if (!stats) return [];
    const found = new Map(stats.daily.map((day) => [day.day, day]));
    return Array.from({ length: days }, (_, index) => {
      const date = new Date(`${stats.since}T00:00:00Z`);
      date.setUTCDate(date.getUTCDate() + index);
      const day = date.toISOString().slice(0, 10);
      return found.get(day) || { day, visits: 0, views: 0 };
    });
  }, [stats, days]);

  const login = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const data = await api('login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      setAdmin(data.username); setUsername('');
    } catch (failure) { setError(failure.message); }
    finally { setPassword(''); setBusy(false); }
  };
  const logout = async () => {
    setBusy(true); setError('');
    try { await api('logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }); setAdmin(null); setStats(null); }
    catch (failure) {
      if (failure.status === 401) { setAdmin(null); setStats(null); }
      else setError(failure.message);
    } finally { setBusy(false); }
  };

  if (checking) return <main className="dashboard-page"><p role="status" className="dashboard-loading"><span className="loading loading-spinner loading-sm" />Checking your session…</p></main>;

  if (!admin) return <main className="dashboard-page dashboard-login-wrap">
    <section className="card bg-base-300 dashboard-login">
      <div className="dashboard-lock text-primary bg-base-200"><LockKeyhole size={28} aria-hidden="true" /></div>
      <p className="dashboard-eyebrow">ADMIN ACCESS</p>
      <h1>Site dashboard</h1>
      <p className="dashboard-muted">Sign in to view your website analytics.</p>
      <form onSubmit={login} className="dashboard-login-form">
        <label>Username<input className="input input-bordered w-full" name="username" autoComplete="username" required maxLength={100} value={username} onChange={(event) => setUsername(event.target.value)} /></label>
        <label>Password<input className="input input-bordered w-full" name="password" type="password" autoComplete="current-password" required maxLength={256} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {(error || sessionError) && <p role="alert" className="text-error text-sm">{error || sessionError}</p>}
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? <span className="loading loading-spinner loading-xs" /> : <ShieldCheck size={17} aria-hidden="true" />}Sign in</button>
      </form>
    </section>
  </main>;

  const maxVisits = Math.max(1, ...daily.map((day) => day.visits));
  return <main className="dashboard-page">
    <header className="dashboard-header">
      <div><p className="dashboard-eyebrow"><ShieldCheck size={15} aria-hidden="true" />PRIVATE ANALYTICS</p><h1>Site dashboard</h1><p className="dashboard-muted">Welcome, {admin}. Here’s how your site is doing.</p></div>
      <div className="dashboard-controls">
        <select className="select select-bordered" aria-label="Analytics date range" value={days} onChange={(event) => setDays(Number(event.target.value))}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select>
        <button className="btn btn-soft" aria-label="Refresh analytics" onClick={() => setRefresh((value) => value + 1)} disabled={loadingStats}><RefreshCw size={17} aria-hidden="true" /></button>
        <button className="btn btn-soft" onClick={logout} disabled={busy}><LogOut size={17} aria-hidden="true" />Sign out</button>
      </div>
    </header>
    {error && <div role="alert" className="alert alert-error mb-5">{error}</div>}
    {loadingStats && <p role="status" className="dashboard-loading"><span className="loading loading-spinner loading-sm" />Loading analytics…</p>}
    {stats && <>
      {stats.development && <div className="alert mb-5">Local preview data. These are not production visits.</div>}
      <div className="dashboard-metrics">
        {[{ label: 'Visits', value: number(stats.visits), icon: Users }, { label: 'Page views', value: number(stats.views), icon: Eye }, { label: 'Avg. time per visit', value: duration(stats.visits ? stats.activeMs / stats.visits : 0), icon: Clock3 }, { label: 'Referral sources', value: number(stats.sources.length), icon: Globe }].map((metric) => {
          const Icon = metric.icon;
          return <div className="card bg-base-300 dashboard-metric" key={metric.label}><Icon size={20} className="text-primary" aria-hidden="true" /><span>{metric.label}</span><strong>{metric.value}</strong></div>;
        })}
      </div>
      <section className="card bg-base-300 dashboard-section">
        <h2><BarChart3 size={19} aria-hidden="true" />Visits over time</h2>
        {stats.visits === 0 ? <p className="dashboard-empty">No visits recorded in this period. Analytics begin collecting after deployment.</p> : <div className="dashboard-chart" role="img" aria-label={`Daily site visits over the last ${days} days. Total: ${stats.visits}.`}>
          {daily.map((day) => <div key={day.day} className="dashboard-chart-column" title={`${day.day}: ${day.visits} visits, ${day.views} page views`}><span style={{ height: `${day.visits / maxVisits * 100}%` }} /></div>)}
        </div>}
        <div className="dashboard-chart-dates dashboard-muted"><span>{stats.since}</span><span>{daily.at(-1)?.day} · UTC</span></div>
      </section>
      <div className="dashboard-tables">
        <section className="card bg-base-300 dashboard-section"><h2><Globe size={19} aria-hidden="true" />Where visits come from</h2>
          {!stats.sources.length ? <p className="dashboard-empty">Referral sources will appear with your first visits.</p> : <div className="overflow-x-auto"><table className="table table-sm"><thead><tr><th>Source</th><th>Visits</th><th>Share</th></tr></thead><tbody>{stats.sources.map((source) => <tr key={source.label}><td className="dashboard-source">{source.label === 'direct' ? 'Direct / unknown' : source.label}</td><td>{number(source.visits)}</td><td>{stats.visits ? Math.round(source.visits / stats.visits * 100) : 0}%</td></tr>)}</tbody></table></div>}
        </section>
        <section className="card bg-base-300 dashboard-section"><h2><Eye size={19} aria-hidden="true" />Pages visited</h2>
          {!stats.pages.length ? <p className="dashboard-empty">Page views will appear as people browse your site.</p> : <div className="overflow-x-auto"><table className="table table-sm"><thead><tr><th>Page</th><th>Views</th><th>Avg. time</th></tr></thead><tbody>{stats.pages.map((page) => <tr key={page.label}><td className="dashboard-path">{page.label}</td><td>{number(page.views)}</td><td>{duration(page.views ? page.activeMs / page.views : 0)}</td></tr>)}</tbody></table></div>}
        </section>
      </div>
      <p className="dashboard-footnote dashboard-muted">Visits are anonymous browsing sessions, renewed after 30 minutes of inactivity. Time measures visible page time and is approximate. Hidden tabs, dashboard pages, and visitors with Do Not Track or Global Privacy Control are excluded. Sources use the referral domain or utm_source; missing referrals appear as direct / unknown. No historical data is available before tracking starts.</p>
    </>}
  </main>;
}
