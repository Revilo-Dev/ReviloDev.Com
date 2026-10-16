import { useLayoutEffect, useRef, useState } from 'react';
import { Gamepad2, Globe, Hammer, LayoutGrid, Smartphone, Tags } from 'lucide-react';
import './ProjectCards.css';

const tagIcons = { All: LayoutGrid, Websites: Globe, Apps: Smartphone, Modding: Hammer, Games: Gamepad2 };

const TagSelector = ({ tags, onTagSelect }) => {
  const [selectedTag, setSelectedTag] = useState('All');
  const barRef = useRef(null);
  const highlightRef = useRef(null);

  useLayoutEffect(() => {
    const bar = barRef.current;
    const highlight = highlightRef.current;
    const updateHighlight = () => {
      const selected = bar.querySelector('[aria-pressed="true"]');
      if (!selected) return;
      highlight.style.width = `${selected.offsetWidth}px`;
      highlight.style.height = `${selected.offsetHeight}px`;
      highlight.style.transform = `translate(${selected.offsetLeft}px, ${selected.offsetTop}px)`;
    };
    updateHighlight();
    const frame = requestAnimationFrame(() => { highlight.dataset.ready = 'true'; });
    const observer = new ResizeObserver(updateHighlight);
    observer.observe(bar);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [selectedTag]);

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    onTagSelect(tag);
  };

  return (
    <div ref={barRef} className="project-filters bg-base-300" role="group" aria-label="Filter projects by category">
      <span ref={highlightRef} className="project-filter-highlight" aria-hidden="true" />
      {['All', ...tags].map((tag) => {
        const Icon = tagIcons[tag] || Tags;
        return <button
          key={tag}
          type="button"
          aria-pressed={selectedTag === tag}
          className="btn btn-sm btn-ghost project-filter"
          onClick={() => handleTagClick(tag)}
        >
          <Icon size={17} aria-hidden="true" />{tag}
        </button>;
      })}
    </div>
  );
};

export default TagSelector;
