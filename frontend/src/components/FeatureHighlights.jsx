import React from 'react';
import { ShieldCheck, Gauge, BrainCircuit, FlaskConical } from 'lucide-react';

const FEATURES = [
  {
    icon: <ShieldCheck size={22} className="text-cyan-400" />,
    iconCls: 'icon-blue',
    title: 'Secure & Private',
    desc: 'End-to-end encryption with zero data storage. Your media is never retained.',
  },
  {
    icon: <Gauge size={22} className="text-cyan-300" />,
    iconCls: 'icon-cyan',
    title: 'Real-Time Analysis',
    desc: 'Sub-second multimodal forensic verification powered by optimized PyTorch inference.',
  },
  {
    icon: <BrainCircuit size={22} className="text-emerald-400" />,
    iconCls: 'icon-green',
    title: 'Explainable AI',
    desc: 'Transparent, interpretable Grad-CAM heatmaps and stylometric breakdowns you can trust.',
  },
  {
    icon: <FlaskConical size={22} className="text-purple-400" />,
    iconCls: 'icon-purple',
    title: 'Multimodal Fusion',
    desc: 'Dual-branch CNN & NLP with cross-modal confidence calibration for superior accuracy.',
  },
];

export default function FeatureHighlights() {
  return (
    <section className="feature-highlights-section" id="features">
      <div className="feature-highlights-grid">
        {FEATURES.map((f) => (
          <div key={f.title} className="feature-card glass-panel">
            <div className={`feature-icon-wrapper ${f.iconCls}`}>
              {f.icon}
            </div>
            <div className="feature-text-block">
              <h4 className="feature-title">{f.title}</h4>
              <p className="feature-desc">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
