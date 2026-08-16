import React from 'react';
import { ShieldCheck, Github, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-cyan-primary" />
            <span className="font-heading font-bold text-white">CloneLens</span>
          </div>
          <p className="text-xs text-muted mt-1">
            Research prototype for digital identity clone & synthetic media detection.
          </p>
        </div>

        <div className="footer-links">
          <a href="/docs" target="_blank" rel="noreferrer" className="footer-link">
            <span>FastAPI Docs (Swagger)</span>
            <ExternalLink size={12} />
          </a>
          <span className="text-muted text-xs">&bull;</span>
          <span className="text-xs text-muted">B.Tech Engineering Capstone Project</span>
        </div>
      </div>
    </footer>
  );
}
