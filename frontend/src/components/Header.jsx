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
        {/* ── Brand ── */}
        <div
          className="brand-group"
          onClick={() => onNavClick('home')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavClick('home')}
        >
          <div className="brand-icon-wrapper">
            <div className="icon-reticle">
              <Scan className="reticle-frame" size={24} />
              <ShieldCheck className="reticle-center" size={13} />
            </div>
          </div>

          <div className="brand-text-block">
            <span
              className="brand-title"
              title="CloneLens: Digital Identity Clone Detection Using Multimodal Image and Text Analysis"
            >
              CloneLens
            </span>
            <div className="brand-divider" />
            <span className="brand-tagline">
              Digital Identity Clone Detection
            </span>
          </div>
        </div>

        {/* ── Desktop Nav ── */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <button
            type="button"
            className={`nav-item ${activeNav === 'home' ? 'nav-item-active' : ''}`}
            onClick={() => onNavClick('home')}
            id="nav-home"
          >
            <Home size={14} />
            <span>Home</span>
          </button>
          <button
            type="button"
            className={`nav-item ${activeNav === 'about' ? 'nav-item-active' : ''}`}
            onClick={() => { onNavClick('about'); onOpenModal('about'); }}
            id="nav-about"
          >
            <Info size={14} />
            <span>About</span>
          </button>
          <button
            type="button"
            className={`nav-item ${activeNav === 'docs' ? 'nav-item-active' : ''}`}
            onClick={() => { onNavClick('docs'); onOpenModal('docs'); }}
            id="nav-docs"
          >
            <FileCode size={14} />
            <span>Docs</span>
          </button>
          <button
            type="button"
            className={`nav-item ${activeNav === 'contact' ? 'nav-item-active' : ''}`}
            onClick={() => { onNavClick('contact'); onOpenModal('contact'); }}
            id="nav-contact"
          >
            <Mail size={14} />
            <span>Contact</span>
          </button>
        </nav>

        {/* ── Right Controls ── */}
        <div className="header-actions">
          {/* Backend Status Pill */}
          <div
            className={`backend-pill ${isOnline ? 'pill-online' : 'pill-offline'}`}
            title={`Backend ${isOnline ? 'Online' : 'Offline'} — ${latency}ms`}
          >
            <span className="pill-dot">
              <span className="pill-dot-ping" />
            </span>
            <span className="pill-text">
              {isOnline ? `Online · ${latency}ms` : 'Offline'}
            </span>
            <button
              type="button"
              className="pill-refresh-btn"
              onClick={(e) => { e.stopPropagation(); onRefreshHealth(); }}
              title="Ping backend health"
              disabled={loadingHealth}
              aria-label="Refresh backend status"
            >
              <RefreshCw size={12} className={loadingHealth ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle color theme"
            id="theme-toggle"
          >
            {theme === 'dark'
              ? <Sun size={16} className="text-amber-400" />
              : <Moon size={16} className="text-indigo-400" />
            }
          </button>

          {/* Mobile Hamburger */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
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
            onClick={() => { onNavClick('about'); onOpenModal('about'); setMobileMenuOpen(false); }}
          >
            <Info size={16} />
            <span>About</span>
          </button>
          <button
            type="button"
            className="mobile-nav-item"
            onClick={() => { onNavClick('docs'); onOpenModal('docs'); setMobileMenuOpen(false); }}
          >
            <FileCode size={16} />
            <span>Documentation</span>
          </button>
          <button
            type="button"
            className="mobile-nav-item"
            onClick={() => { onNavClick('contact'); onOpenModal('contact'); setMobileMenuOpen(false); }}
          >
            <Mail size={16} />
            <span>Contact</span>
          </button>
        </div>
      )}
    </header>
  );
}
