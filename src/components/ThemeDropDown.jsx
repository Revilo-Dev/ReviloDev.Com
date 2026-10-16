import React, { useEffect, useRef, useState } from 'react';
import useThemeStore from '../store/ThemeStore.js';
import { Check, Palette } from 'lucide-react';
import './ThemeDropDown.css';

const themes = [
  'light', 'dark', 'coffee', 'caramellatte', 'business', 'corporate',
  'lofi', 'black', 'nord', 'luxury', 'dim', 'sunset',
];

const themeLabel = (name) => name === 'caramellatte' ? 'Caramel Latte' : name.replace(/^./, (letter) => letter.toUpperCase());

function ThemeDropdown() {
  const { theme, setTheme } = useThemeStore();
  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!pickerRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const chooseTheme = (name) => {
    setTheme(name);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return <div className="theme-picker" ref={pickerRef}>
    {open && <div className="theme-picker-panel SlideUp bg-base-100" id="theme-picker-panel" role="group">
      <div className="theme-picker-grid">
        {themes.map((name) => <button
          key={name}
          type="button"
          className={`theme-option ${theme === name ? 'is-selected' : ''}`}
          onClick={() => chooseTheme(name)}
          aria-pressed={theme === name}
        >
          <span className="theme-option-preview" data-theme={name} aria-hidden="true"><span /><span /><span /></span>
          <span className="theme-option-name">{themeLabel(name)}</span>
          {theme === name && <Check size={15} aria-hidden="true" />}
        </button>)}
      </div>
    </div>}
    <button ref={triggerRef} type="button" className={`theme-picker-trigger btn btn-primary ${open ? 'is-open' : ''}`} onClick={() => setOpen((value) => !value)} aria-label="Choose theme" aria-expanded={open} aria-controls="theme-picker-panel" title={`Theme: ${themeLabel(theme)}`}><Palette size={20} aria-hidden="true" /></button>
  </div>;
}

export default ThemeDropdown;
