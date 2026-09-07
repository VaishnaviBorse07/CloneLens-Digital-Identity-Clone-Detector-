import React from 'react';
import {
  ShieldCheck,
  Scan,
  Github,
  Linkedin,
  Mail,
  Heart,
  ExternalLink,
} from 'lucide-react';

export default function Footer({ onOpenModal, onNavClick }) {
  return (
    <footer className="site-footer" id="footer">
      <div className="footer-top-grid">
        {/* ── Brand & Socials ── */}
        <div className="footer-brand-col">
          <div className="footer-logo-row">
            <div className="footer-icon-box">
              <Scan size={17} style={{ color: 'var(--cyan-primary)' }} />
            </div>
            <span className="footer-brand-title">CloneLens</span>
          </div>

          <p className="footer-brand-desc">
            <strong>CloneLens: Digital Identity Clone Detection Using Multimodal Image and Text Analysis</strong> —
            An advanced AI forensics platform for deepfake and synthetic clone detection using
            PyTorch CNN, NLP stylometrics, and decision fusion.
          </p>

          <div className="footer-social-row">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="social-btn"
              title="GitHub Repository"
              aria-label="GitHub"
            >
              <Github size={15} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="social-btn"
              title="LinkedIn"
              aria-label="LinkedIn"
            >
              <Linkedin size={15} />
            </a>
            <button
              type="button"
              className="social-btn"
              onClick={() => onOpenModal('contact')}
              title="Contact"
              aria-label="Contact"
            >
              <Mail size={15} />
            </button>
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Quick Links</h4>
          <ul className="footer-links-list">
            {[
              { label: 'Home',        action: () => onNavClick('home') },
              { label: 'About',       action: () => onOpenModal('about') },
              { label: 'How It Works',action: () => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }) },
              { label: 'Architecture',action: () => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' }) },
            ].map((l) => (
              <li key={l.label}>
                <button type="button" className="footer-link-btn" onClick={l.action}>
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Resources ── */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Resources</h4>
          <ul className="footer-links-list">
            <li>
              <button type="button" className="footer-link-btn" onClick={() => onOpenModal('docs')}>
                API Documentation
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={() => onOpenModal('docs')}>
                Architecture Spec
              </button>
            </li>
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="footer-link-btn flex-inline items-center gap-1"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
              >
                GitHub Repository
                <ExternalLink size={10} style={{ opacity: 0.6 }} />
              </a>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={() => onOpenModal('contact')}>
                Contact Us
              </button>
            </li>
          </ul>
        </div>

        {/* ── Platform ── */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Platform</h4>
          <ul className="footer-links-list">
            {[
              'Multimodal AI Forensics',
              'Custom PyTorch CNN',
              'NLP Stylometrics',
              'Decision Fusion Engine',
              'Grad-CAM Explainability',
              'FastAPI Backend',
            ].map((t) => (
              <li key={t}>
                <span className="footer-project-text">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="footer-bottom-bar" style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <span className="copyright-text">
          © 2025–2026 CloneLens: Digital Identity Clone Detection. All rights reserved.
        </span>
        <div className="built-with-text">
          <span>Built with</span>
          <Heart size={13} className="text-rose-500 fill-rose-500" style={{ margin: '0 0.3rem', display: 'inline' }} />
          <span>for digital authenticity & media integrity.</span>
        </div>
      </div>
    </footer>
  );
}
