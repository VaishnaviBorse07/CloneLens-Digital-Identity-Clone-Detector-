import React from 'react';
import { 
  ShieldCheck, 
  Scan, 
  Github, 
  Linkedin, 
  Mail, 
  Heart,
  ExternalLink 
} from 'lucide-react';

export default function Footer({ onOpenModal, onNavClick }) {
  return (
    <footer className="site-footer">
      <div className="footer-top-grid">
        {/* Brand & Socials */}
        <div className="footer-brand-col">
          <div className="footer-logo-row">
            <div className="footer-icon-box">
              <Scan size={18} className="text-cyan-primary" />
            </div>
            <span className="footer-brand-title">CloneLens</span>
          </div>

          <p className="footer-brand-desc">
            Multimodal AI system for digital identity clone and synthetic media detection.
          </p>

          <div className="footer-social-row">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="social-btn" 
              title="GitHub Repository"
              aria-label="GitHub Repository"
            >
              <Github size={16} />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noreferrer" 
              className="social-btn" 
              title="LinkedIn"
              aria-label="LinkedIn"
            >
              <Linkedin size={16} />
            </a>
            <button 
              type="button" 
              className="social-btn" 
              onClick={() => onOpenModal('contact')} 
              title="Contact Developers"
              aria-label="Email / Contact"
            >
              <Mail size={16} />
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Quick Links</h4>
          <ul className="footer-links-list">
            <li>
              <button type="button" className="footer-link-btn" onClick={() => onNavClick('home')}>
                Home
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={() => onOpenModal('about')}>
                About
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={() => onOpenModal('docs')}>
                Docs
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={() => onOpenModal('contact')}>
                Contact
              </button>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Resources</h4>
          <ul className="footer-links-list">
            <li>
              <a href="/docs" target="_blank" rel="noreferrer" className="footer-link-btn flex-inline items-center gap-1">
                <span>API Documentation</span>
                <ExternalLink size={11} className="opacity-70" />
              </a>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={() => onOpenModal('docs')}>
                Research Paper
              </button>
            </li>
            <li>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="footer-link-btn flex-inline items-center gap-1">
                <span>GitHub Repository</span>
                <ExternalLink size={11} className="opacity-70" />
              </a>
            </li>
          </ul>
        </div>

        {/* Project Details */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Project</h4>
          <p className="footer-project-text">B.Tech Final Year</p>
          <p className="footer-project-text">Capstone Project</p>
          <p className="footer-project-text text-muted">Computer Engineering</p>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="footer-bottom-bar">
        <span className="copyright-text">&copy; 2025 CloneLens. All rights reserved.</span>
        <div className="built-with-text">
          <span>Built with</span>
          <Heart size={14} className="text-rose-500 fill-rose-500 mx-1 inline" />
          <span>for a more secure digital world.</span>
        </div>
      </div>
    </footer>
  );
}
