import { useEffect } from 'react';
import { History } from 'lucide-react';
import { projectRepositories } from '../data/projectRepositories.js';
import { formatRepositoryDate, latestRepositoryUpdate } from '../lib/repositoryUpdates.js';
import useRepositoryUpdatesStore from '../store/RepositoryUpdatesStore.js';

export default function RepositoryUpdated({ projectTitle }) {
  const { dates, refresh } = useRepositoryUpdatesStore();
  const repositories = projectRepositories[projectTitle];
  useEffect(() => {
    if (!repositories?.length) return;
    refresh();
    const timer = setInterval(refresh, 60 * 60 * 1000);
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [repositories, refresh]);
  if (!repositories?.length) return null;
  const latest = latestRepositoryUpdate(repositories || [], dates);
  return <div className="project-card-meta bg-base-200">
    <History size={16} aria-hidden="true" />
    <p><b>Last updated:</b>{' '}{latest ? <a href={`https://github.com/${latest.repository}`} target="_blank" rel="noopener noreferrer" className="hover:underline" title="Latest GitHub push · Brisbane time">
      <time dateTime={latest.date}>{formatRepositoryDate(latest.date)}</time>
    </a> : <span title="GitHub date is temporarily unavailable">Not available</span>}</p>
  </div>;
}
