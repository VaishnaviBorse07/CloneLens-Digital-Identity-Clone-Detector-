import React from 'react';
import { Network, ScanText, GitMerge } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    icon: <Network size={28} className="text-cyan-400" />,
    iconCls: 'cyan',
    cardCls: 'cyan-card',
    title: '1. Spatial Frequency CNN',
    desc: 'Our custom 4-block PyTorch CNN scans facial imagery for high-frequency checkerboard artifacts and spectral anomalies — telltale signatures of GAN and diffusion model synthesis.',
  },
  {
    num: '02',
    icon: <ScanText size={28} className="text-purple-400" />,
    iconCls: 'purple',
    cardCls: 'purple-card',
    title: '2. NLP Stylometrics',
    desc: 'Advanced NLP engines analyze text for synthetic transitional markers, abnormal Shannon entropy, low clause-length variance, and unnatural vocabulary richness distributions.',
  },
  {
    num: '03',
    icon: <GitMerge size={28} className="text-emerald-400" />,
    iconCls: 'green',
    cardCls: 'green-card',
    title: '3. Decision Fusion',
    desc: 'A weighted probabilistic fusion matrix cross-calibrates visual and linguistic signals, interpolating confidence scores to render a final, highly-accurate authenticity verdict.',
  },
];

export default function HowItWorks() {
  return (
    <section className="hiw-section" id="how-it-works">
      <div className="hiw-bg" aria-hidden="true" />

      <div className="hiw-inner">
        {/* Header */}
        <div className="hiw-header">
          <span className="hiw-label">Multimodal Forensic Pipeline</span>
          <h2 className="hiw-title">How CloneLens Operates</h2>
          <p className="hiw-desc">
            <strong>CloneLens</strong> executes a state-of-the-art dual-branch pipeline that analyzes visual
            frequencies and linguistic patterns simultaneously, exposing deepfakes and AI-generated identities
            with transparent, explainable results.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="hiw-steps-grid">
          {/* Desktop connector line */}
          <div className="hiw-connector" aria-hidden="true" />

          {STEPS.map((step) => (
            <div key={step.num} className={`hiw-step-card ${step.cardCls}`}>
              <div className={`hiw-icon-box ${step.iconCls}`}>
                {step.icon}
              </div>
              <span className="hiw-step-number">Step {step.num}</span>
              <h3 className="hiw-step-title">{step.title}</h3>
              <p className="hiw-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
