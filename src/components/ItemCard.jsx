import { Link } from 'react-router-dom';
import { ChevronRight, ExternalLink } from 'lucide-react';
import RepositoryUpdated from './RepositoryUpdated';
import './ProjectCards.css';

const ItemCard = ({ image, title, links }) => {
  return (
    <article className="card bg-base-300 project-card">
      <div className="project-card-art">
        <img src={image} alt={title} className="project-card-icon" loading="lazy" />
      </div>
      <div className="card-body project-card-body">
        <div className="project-card-heading">
          <h3 className="card-title text-primary">{title}</h3>
        </div>
        <div className="project-card-details">
          <RepositoryUpdated projectTitle={title} />
          {links.map((link) => {
            const external = /^https?:\/\//.test(link.to);
            const className = `btn ${external ? 'btn-secondary' : 'btn-soft'} project-card-action`;
            const content = <>
              {link.icon && <link.icon size={16} aria-hidden="true" />}
              <span className="flex-1 text-left">{link.label}</span>
              {external ? <ExternalLink size={16} aria-hidden="true" /> : <ChevronRight size={16} className="micro-arrow" aria-hidden="true" />}
            </>;
            return external ? (
              <a key={link.label} href={link.to} className={className} target="_blank" rel="noopener noreferrer">{content}</a>
            ) : (
              <Link key={link.label} to={link.to} className={className}>{content}</Link>
            );
          })}
        </div>
      </div>
    </article>
  );
};

export default ItemCard;
