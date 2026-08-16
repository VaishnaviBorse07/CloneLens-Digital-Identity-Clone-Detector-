import React from 'react';
import { ShieldCheck, Cpu, Layers, Sparkles } from 'lucide-react';
import HealthStatusBadge from './HealthStatusBadge';

export default function Header({ health, loadingHealth, onRefreshHealth }) {
  return (
    <header className="header-container">
      <div className="header-content">
        <div className="logo-group">
          <div className="logo-icon-wrapper">
            <ShieldCheck className="logo-icon" size={28} />
          </div>
          <div>
            <div className="logo-title-row">
              <h1 className="logo-title">CloneLens</h1>
              <span className="badge badge-cyan">v1.0 Academic</span>
            </div>
            <p className="logo-subtitle">Multimodal Digital Identity Clone & Synthetic Media Detector</p>
          </div>
        </div>

        <div className="header-actions">
          <HealthStatusBadge 
            health={health} 
            loading={loadingHealth} 
            onRefresh={onRefreshHealth} 
          />
        </div>
      </div>
    </header>
  );
}
