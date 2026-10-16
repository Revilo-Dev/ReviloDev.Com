import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fetchRepositoryDates, formatRepositoryDate, latestRepositoryUpdate, repositoryDates } from '../src/lib/repositoryUpdates.js';
import { projectRepositories } from '../src/data/projectRepositories.js';

test('dates use the requested month/day/year format in Brisbane time', () => {
  assert.equal(formatRepositoryDate('2026-10-16T07:20:45Z'), 'Oct 16 2026');
  assert.equal(formatRepositoryDate('2026-10-15T16:00:00Z'), 'Oct 16 2026');
  assert.equal(formatRepositoryDate('2026-02-28T16:00:00Z'), 'Mar 1 2026');
  assert.equal(formatRepositoryDate('invalid'), null);
  assert.equal(formatRepositoryDate(null), null);
});

test('GitHub push dates are used and malformed metadata is ignored', () => {
  assert.deepEqual(repositoryDates([
    { full_name: 'Revilo-Dev/RUNIC', pushed_at: '2026-10-05T04:27:27Z', updated_at: '2026-10-16T00:00:00Z' },
    null, { full_name: 'bad/repo', pushed_at: 'invalid' },
  ]), { 'revilo-dev/runic': '2026-10-05T04:27:27Z' });
  assert.throws(() => repositoryDates({ message: 'API error' }));
});

test('multiple version repositories use the latest valid update', () => {
  const repos = projectRepositories['Boundless Quests'];
  const latest = latestRepositoryUpdate(repos, {
    'revilo-dev/boundless': '2026-09-23T00:19:25Z',
    'revilo-dev/boundless-1.20.1': '2026-10-16T00:00:00Z',
  });
  assert.equal(latest.repository, 'Revilo-Dev/Boundless-1.20.1');
  assert.equal(latestRepositoryUpdate(repos, {}), null);
});

test('unmatched projects keep their manual text instead of borrowing another repo', () => {
  for (const title of ['Mythcraft 5', 'Mythcraft 6', 'Gateways to Avarice', 'Arsenal: Weaponry', 'Gilded Theme']) assert.equal(projectRepositories[title], undefined);
});

test('GitHub repository pagination is followed without per-card requests', async () => {
  const calls = [];
  const dates = await fetchRepositoryDates(async (url) => {
    calls.push(url);
    const repos = calls.length === 1 ? Array.from({ length: 100 }, (_, index) => ({ full_name: `Revilo-Dev/repo-${index}`, pushed_at: '2026-10-01T00:00:00Z' })) : [{ full_name: 'Revilo-Dev/RUNIC', pushed_at: '2026-10-05T04:27:27Z' }];
    return { ok: true, json: async () => repos };
  });
  assert.equal(calls.length, 2);
  assert.match(calls[1], /page=2$/);
  assert.equal(Object.keys(dates).length, 101);
});

test('GitHub failures reject cleanly so the last verified dates can remain visible', async () => {
  await assert.rejects(fetchRepositoryDates(async () => ({ ok: false, status: 403 })), /temporarily unavailable/);
});
