import React from 'react';
import { 
  ShieldCheck, 
  Scan, 
  RefreshCw, 
  Sun, 
  Moon, 
  FileCode, 
  Info, 
  Mail, 
  Home, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  X
} from 'lucide-react';

export default function Header({ 
  health, 
  loadingHealth, 
  onRefreshHealth, 
  theme, 
  onToggleTheme,
  activeNav,
  onNavClick,
  onOpenModal
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const isOnline = health && (health.status === 'healthy' || health.status === 'online');
  const latency = health?.latencyMs || 24;

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand / Logo */}
        <div className="brand-group" onClick={() => onNavClick('home')} role="button" tabIndex={0}>
          <div className="brand-icon-wrapper">
            <div className="icon-reticle">
              <Scan className="reticle-frame" size={26} />
              <ShieldCheck className="reticle-center" size={16} />
            </div>
            <div className="icon-glow-ring"></div>
          </div>

          <div className="brand-text-block">
            <div className="brand-title-row">
              <span className="brand-title">CloneLens</span>
            </div>
            <div className="brand-divider"></div>
            <span className="brand-tagline">AI-Powered Identity &amp; Synthetic Media Detector</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <button 
            type="button"
            className={`nav-item ${activeNav === 'home' ? 'nav-item-active' : ''}`}
            onClick={() => onNavClick('home')}
          >
            <Home size={15} />
            <span>Home</span>
          </button>
          <button 
            type="button"
            className={`nav-item ${activeNav === 'about' ? 'nav-item-active' : ''}`}
            onClick={() => onOpenModal('about')}
          >
            <Info size={15} />
            <span>About</span>
          </button>
          <button 
            type="button"
            className={`nav-item ${activeNav === 'docs' ? 'nav-item-active' : ''}`}
            onClick={() => onOpenModal('docs')}
          >
            <FileCode size={15} />
            <span>Docs</span>
          </button>
          <button 
            type="button"
            className={`nav-item ${activeNav === 'contact' ? 'nav-item-active' : ''}`}
            onClick={() => onOpenModal('contact')}
          >
            <Mail size={15} />
            <span>Contact</span>
          </button>
        </nav>

        {/* Right Status & Controls */}
        <div className="header-actions">
          {/* Backend Status Pill */}
          <div 
            className={`backend-pill ${isOnline ? 'pill-online' : 'pill-offline'}`}
            title={`Backend Status: ${isOnline ? 'Connected' : 'Offline'} (${latency}ms)`}
          >
            <span className="pill-dot">
              <span className="pill-dot-ping"></span>
            </span>
            <span className="pill-text">
              {isOnline ? 'Backend Online' : 'Backend Offline'}
            </span>
            <button 
              type="button"
              className="pill-refresh-btn"
              onClick={(e) => { e.stopPropagation(); onRefreshHealth(); }}
              title="Ping Backend Health"
              disabled={loadingHealth}
            >
              <RefreshCw size={13} className={loadingHealth ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button 
            type="button"
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Cyber Dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={17} className="text-amber-400" />
            ) : (
              <Moon size={17} className="text-indigo-400" />
            )}
          </button>

          {/* Mobile Hamburger Toggle */}
          <button 
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer glass-panel">
          <button 
            type="button" 
            className={`mobile-nav-item ${activeNav === 'home' ? 'active' : ''}`}
            onClick={() => { onNavClick('home'); setMobileMenuOpen(false); }}
          >
            <Home size={16} />
            <span>Home</span>
          </button>
          <button 
            type="button" 
            className="mobile-nav-item"
            onClick={() => { onOpenModal('about'); setMobileMenuOpen(false); }}
          >
            <Info size={16} />
            <span>About</span>
          </button>
          <button 
            type="button" 
            className="mobile-nav-item"
            onClick={() => { onOpenModal('docs'); setMobileMenuOpen(false); }}
          >
            <FileCode size={16} />
            <span>Docs</span>
          </button>
          <button 
            type="button" 
            className="mobile-nav-item"
            onClick={() => { onOpenModal('contact'); setMobileMenuOpen(false); }}
          >
            <Mail size={16} />
            <span>Contact</span>
          </button>
        </div>
      )}
    </header>
  );
}
