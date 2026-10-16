import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, NavLink, Routes } from 'react-router-dom';
import useThemeStore from './store/ThemeStore.js';
import usePreferencesStore from './store/PreferencesStore.js';
import useAdminStore from './store/AdminStore.js';
import Dashboard from './pages/Dashboard.jsx';
import AnalyticsTracker from './components/AnalyticsTracker.jsx';
import ThemeDropdown from './components/ThemeDropDown.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Projects from './pages/Projects.jsx';
import Modding from './pages/Modding.jsx';
import Links from './pages/Gallery.jsx';
import NoMatch from './pages/NoMatch.jsx';
import Footer from './components/Footer';
import { Home as HomeIcon, Info, Folder, Hammer, Images, ShieldCheck } from 'lucide-react';
import AboutRunic from './pages/modding/runic/aboutrunic.jsx';
import AboutBoundless from './pages/modding/boundless/aboutboundless.jsx';
import RunicWiki from './pages/modding/runic/runicwiki.jsx';
import AuraWiki from './pages/modding/aura/aurawiki.jsx';
import LevelUpWiki from './pages/modding/levelup/levelupwiki.jsx';
import BoundlessWiki from './pages/modding/boundless/boundlesswiki.jsx';
import UnderDevelopment from './pages/UnderDevelopment.jsx';
import FlowPrivacyPolicy from './pages/FlowPrivacyPolicy.jsx';
import OneWidgetPrivacyPolicy from './pages/OneWidgetPrivacyPolicy.jsx';
import EnforcedWiki from './pages/modding/enforced/enforcedwiki.jsx';
import ArsenalWiki from './pages/modding/arsenal/arsenalwiki.jsx';
import './components/MicroInteractions.css';
import './Preferences.css';






const navItems = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/About', label: 'About', icon: Info },
  { to: '/Projects', label: 'Projects', icon: Folder },
  { to: '/Modding', label: 'Modding', icon: Hammer },
  { to: '/Gallery', label: 'Gallery', icon: Images },
];

function App() {
  const { theme } = useThemeStore();
  const { cardLayout, animationsEnabled, blurEnabled } = usePreferencesStore();
  const admin = useAdminStore((state) => state.admin);
  const checkSession = useAdminStore((state) => state.checkSession);

  useEffect(() => {
    checkSession();
    const refreshSession = () => {
      if (document.visibilityState === 'visible' && useAdminStore.getState().admin) checkSession();
    };
    const timer = setInterval(refreshSession, 60000);
    window.addEventListener('focus', refreshSession);
    document.addEventListener('visibilitychange', refreshSession);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refreshSession);
      document.removeEventListener('visibilitychange', refreshSession);
    };
  }, [checkSession]);

  return (
    <Router>
      <AnalyticsTracker />
      <div data-theme={theme} data-card-layout={cardLayout} data-animations={animationsEnabled ? 'enabled' : 'disabled'} data-blur={blurEnabled ? 'enabled' : 'disabled'} className="bg-base-200 min-h-max flex flex-col">

        <nav>
          <div className="NavBar">
            {navItems.map(({ to, label, icon }) => <NavLink key={to} to={to} end className={({ isActive }) => `btn btn-soft AH-Underline nav-tab ${isActive ? 'nav-tab-active' : ''}`}>
              {React.createElement(icon, { className: 'icon', 'aria-hidden': true })}
              <span className="label">{label}</span>
            </NavLink>)}
            {admin && <NavLink to="/dashboard" aria-label="Admin dashboard" title="Admin dashboard" className={({ isActive }) => `btn btn-soft AH-Underline nav-tab admin-nav-tab ${isActive ? 'nav-tab-active' : ''}`}>
              <ShieldCheck className="icon" aria-hidden="true" />
            </NavLink>}
          </div>
        </nav>

        <div className="ThemeButton">
          <ThemeDropdown />
        </div>

        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Home />} />
          <Route path="/About" element={<About />} />
          <Route path="/Projects" element={<Projects />} />
          <Route path="/flow-privacy-policy" element={<FlowPrivacyPolicy />} />
          <Route path="/onewidget-privacy-policy" element={<OneWidgetPrivacyPolicy />} />
          <Route path="/Modding" element={<Modding />} />
          <Route path="/Gallery" element={<Links />} />
          <Route path="*" element={<NoMatch />} />
          <Route path="/Under-Development" element={<UnderDevelopment />} />
          <Route path="/About-Runic" element={<AboutRunic />} />
          <Route path="/About-Boundless" element={<AboutBoundless />} />
          <Route path="/Runic-Wiki" element={<RunicWiki />} />
          <Route path="/projects/runic/wiki" element={<RunicWiki />} />
          <Route path="/projects/runic/wiki/:slug" element={<RunicWiki />} />
          <Route path="/projects/aura/wiki" element={<AuraWiki />} />
          <Route path="/projects/aura/wiki/:slug" element={<AuraWiki />} />
          <Route path="/projects/levelup/wiki" element={<LevelUpWiki />} />
          <Route path="/projects/levelup/wiki/:slug" element={<LevelUpWiki />} />
          <Route path="/projects/enforced/wiki" element={<EnforcedWiki />} />
          <Route path="/projects/enforced/wiki/:slug" element={<EnforcedWiki />} />
          <Route path="/projects/arsenal/wiki" element={<ArsenalWiki />} />
          <Route path="/projects/arsenal/wiki/:slug" element={<ArsenalWiki />} />
          <Route path="/Boundless-Wiki" element={<BoundlessWiki />} />
          <Route path="/Gallery" element={<Links />} />
        </Routes>


        <Footer />
      </div>
    </Router>
  );
}

export default App;
