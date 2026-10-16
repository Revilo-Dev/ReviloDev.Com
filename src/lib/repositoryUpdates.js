export const REPOSITORY_CACHE_MS = 60 * 60 * 1000;

export function repositoryDates(repositories) {
  if (!Array.isArray(repositories)) throw new Error('Invalid GitHub response');
  return Object.fromEntries(repositories.filter((repo) =>
    repo && typeof repo.full_name === 'string' && /^[\w.-]+\/[\w.-]+$/.test(repo.full_name) &&
    typeof repo.pushed_at === 'string' && Number.isFinite(Date.parse(repo.pushed_at))
  ).map((repo) => [repo.full_name.toLowerCase(), repo.pushed_at]));
}

export async function fetchRepositoryDates(fetcher = fetch) {
  const dates = {};
  // Fetch a shared list, rather than making a separate request for every card.
  for (let page = 1; page <= 10; page++) {
    const response = await fetcher(`https://api.github.com/users/Revilo-Dev/repos?per_page=100&type=owner&page=${page}`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('Repository dates are temporarily unavailable');
    const repos = await response.json();
    Object.assign(dates, repositoryDates(repos));
    if (repos.length < 100) return dates;
  }
  throw new Error('Repository list exceeded the pagination limit');
}

export function latestRepositoryUpdate(repositories, dates) {
  return repositories.map((repository) => ({ repository, date: dates[repository.toLowerCase()] }))
    .filter(({ date }) => typeof date === 'string' && Number.isFinite(Date.parse(date)))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0] || null;
}

export function formatRepositoryDate(value) {
  if (typeof value !== 'string' || !value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'Australia/Brisbane', month: 'short', day: 'numeric', year: 'numeric',
  }).formatToParts(date).map(({ type, value }) => [type, value]));
  return `${parts.month} ${parts.day} ${parts.year}`;
}
