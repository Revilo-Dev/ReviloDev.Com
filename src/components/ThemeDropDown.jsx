import React, { useEffect, useRef, useState } from 'react';
import useThemeStore from '../store/ThemeStore.js';
import usePreferencesStore from '../store/PreferencesStore.js';
import { Check, Layers, LayoutGrid, List, Palette, Settings2, Sparkles } from 'lucide-react';
import './ThemeDropDown.css';

const themes = [
  'light', 'dark', 'coffee', 'caramellatte', 'business', 'corporate',
  'lofi', 'black', 'nord', 'luxury', 'dim', 'sunset',
];

const themeLabel = (name) => name === 'caramellatte' ? 'Caramel Latte' : name.replace(/^./, (letter) => letter.toUpperCase());

function ThemeDropdown() {
  const { theme, setTheme } = useThemeStore();
  const { cardLayout, setCardLayout, animationsEnabled, setAnimationsEnabled, blurEnabled, setBlurEnabled } = usePreferencesStore();
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
      <div className="theme-picker-section-title"><Palette size={16} aria-hidden="true" /><h2>Themes</h2></div>
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
      <section className="theme-preferences" aria-labelledby="preferences-heading">
        <div className="theme-picker-section-title"><Settings2 size={16} aria-hidden="true" /><h2 id="preferences-heading">Preferences</h2></div>
        <fieldset className="theme-layout-preference">
          <legend>Project & modding cards</legend>
          <div className="theme-layout-options" role="group" aria-label="Card layout">
            <button type="button" className={`btn btn-sm ${cardLayout === 'grid' ? 'btn-primary' : 'btn-soft'}`} aria-pressed={cardLayout === 'grid'} onClick={() => setCardLayout('grid')}><LayoutGrid size={16} aria-hidden="true" />Grid</button>
            <button type="button" className={`btn btn-sm ${cardLayout === 'list' ? 'btn-primary' : 'btn-soft'}`} aria-pressed={cardLayout === 'list'} onClick={() => setCardLayout('list')}><List size={16} aria-hidden="true" />List</button>
          </div>
        </fieldset>
        <label className="theme-preference-row">
          <Sparkles size={17} aria-hidden="true" />
          <span><strong>Animations</strong><small>Motion and hover effects</small></span>
          <input type="checkbox" className="toggle toggle-primary toggle-sm" checked={animationsEnabled} onChange={(event) => setAnimationsEnabled(event.target.checked)} />
        </label>
        <label className="theme-preference-row">
          <Layers size={17} aria-hidden="true" />
          <span><strong>Background blur</strong><small>Navigation and theme controls</small></span>
          <input type="checkbox" className="toggle toggle-primary toggle-sm" checked={blurEnabled} onChange={(event) => setBlurEnabled(event.target.checked)} />
        </label>
      </section>
    </div>}
    <button ref={triggerRef} type="button" className={`theme-picker-trigger btn btn-primary ${open ? 'is-open' : ''}`} onClick={() => setOpen((value) => !value)} aria-label="Theme and preferences" aria-expanded={open} aria-controls="theme-picker-panel" title={`Theme: ${themeLabel(theme)}`}><Palette size={20} aria-hidden="true" /></button>
  </div>;
}

export default ThemeDropdown;
