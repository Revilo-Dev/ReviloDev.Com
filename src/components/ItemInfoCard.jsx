import { BookOpen, CalendarDays, ExternalLink, History, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import RepositoryUpdated from './RepositoryUpdated';
import './ProjectCards.css';

const ItemInfoCard = ({ img, title, subtitle, description, row1, row2, row3, showLastUpdated, linkUrl, linkname, policyLinkUrl, policyLinkName }) => {
  const PolicyIcon = policyLinkName === 'Wiki' ? BookOpen : ShieldCheck;
  const policyContent = <><PolicyIcon size={16} aria-hidden="true" /><span>{policyLinkName || 'Privacy Policy'}</span></>;

  return (
    <article className="card bg-base-300 project-card">
      <div className="project-card-art">
        {img && <img src={img} alt={title} className="project-card-icon" loading="lazy" />}
      </div>
      <div className="card-body project-card-body">
        <div className="project-card-heading">
          <h3 className="card-title text-primary">{title}</h3>
          {subtitle && <p className="project-card-subtitle">{subtitle}</p>}
          {description && <p className="project-card-subtitle">{description}</p>}
        </div>
        <div className="project-card-details">
          {[row1, row2, row3].map((row, index) => {
            const Icon = index === 1 ? History : CalendarDays;
            return row && <div className="project-card-meta bg-base-200" key={index}>
              <Icon size={16} aria-hidden="true" /><div>{row}</div>
            </div>;
          })}
          {showLastUpdated && <RepositoryUpdated projectTitle={title} />}
          {linkUrl && <a href={linkUrl} className="btn btn-secondary project-card-action" target="_blank" rel="noopener noreferrer">
            <span>{linkname || 'Visit'}</span><ExternalLink size={16} aria-hidden="true" />
          </a>}
          {policyLinkUrl && (policyLinkUrl.startsWith('/') ? (
            <Link to={policyLinkUrl} className="btn btn-soft project-card-action">{policyContent}</Link>
          ) : (
            <a href={policyLinkUrl} className="btn btn-soft project-card-action" target="_blank" rel="noopener noreferrer">
              {policyContent}<ExternalLink size={16} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </article>
  );
};

export default ItemInfoCard;
