import React from 'react';
import { 
  ShieldCheck, 
  Gauge, 
  BrainCircuit, 
  FlaskConical 
} from 'lucide-react';

export default function FeatureHighlights() {
  return (
    <section className="feature-highlights-section">
      <div className="feature-highlights-grid">
        {/* Card 1: Secure & Private */}
        <div className="feature-card glass-panel">
          <div className="feature-icon-wrapper icon-blue">
            <ShieldCheck size={22} className="text-cyan-primary" />
          </div>
          <div className="feature-text-block">
            <h4 className="feature-title">Secure &amp; Private</h4>
            <p className="feature-desc">End-to-end encryption &amp; data protection</p>
          </div>
        </div>

        {/* Card 2: Real-time Analysis */}
        <div className="feature-card glass-panel">
          <div className="feature-icon-wrapper icon-cyan">
            <Gauge size={22} className="text-cyan-bright" />
          </div>
          <div className="feature-text-block">
            <h4 className="feature-title">Real-time Analysis</h4>
            <p className="feature-desc">Lightning fast multimodal verification</p>
          </div>
        </div>

        {/* Card 3: Explainable AI */}
        <div className="feature-card glass-panel">
          <div className="feature-icon-wrapper icon-green">
            <BrainCircuit size={22} className="text-emerald-bright" />
          </div>
          <div className="feature-text-block">
            <h4 className="feature-title">Explainable AI</h4>
            <p className="feature-desc">Transparent, interpretable results you can trust</p>
          </div>
        </div>

        {/* Card 4: Research Prototype */}
        <div className="feature-card glass-panel">
          <div className="feature-icon-wrapper icon-purple">
            <FlaskConical size={22} className="text-purple-bright" />
          </div>
          <div className="feature-text-block">
            <h4 className="feature-title">Research Prototype</h4>
            <p className="feature-desc">B.Tech final year capstone project</p>
          </div>
        </div>
      </div>
    </section>
  );
}
