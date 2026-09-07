import React from 'react';
import {
  Box,
  Layers,
  Scale,
  Database,
  ShieldCheck,
  ArrowRight,
  Cpu,
} from 'lucide-react';

export default function ArchitecturePipeline({ health }) {
  const cnnStatus    = health?.models?.image_custom_cnn?.status || 'Ready';
  const textStatus   = health?.models?.text_nlp_llm?.status || 'Ready';
  const fusionStatus = health?.models?.decision_fusion?.status || 'Ready';

  const stages = [
    {
      icon: <Box size={20} className="text-purple-400" />,
      iconCls: 'pipe-icon-purple',
      title: 'Custom PyTorch CNN',
      desc: '4-Block Conv Network (32–256 filters)',
      status: cnnStatus === 'Ready' ? 'Ready' : 'Trained',
    },
    {
      icon: <Layers size={20} className="text-cyan-400" />,
      iconCls: 'pipe-icon-cyan',
      title: 'NLP & Stylometric Suite',
      desc: 'Text & style pattern analysis',
      status: textStatus,
    },
    {
      icon: <Scale size={20} className="text-purple-300" />,
      iconCls: 'pipe-icon-magenta',
      title: 'Decision Fusion Engine',
      desc: 'Weighted multimodal scoring',
      status: fusionStatus,
    },
    {
      icon: <Database size={20} className="text-emerald-400" />,
      iconCls: 'pipe-icon-emerald',
      title: 'Secure Storage',
      desc: 'Encrypted audit trail',
      status: 'Ready',
    },
  ];

  return (
    <section className="architecture-section" id="architecture">
      {/* Section label */}
      <div className="section-header-row">
        <div className="section-tag">
          <span className="section-tag-dot" />
          <span>System Architecture</span>
        </div>
        <div className="section-header-line" />
      </div>

      {/* Pipeline */}
      <div className="pipeline-wrapper">
        <div className="pipeline-cards-row">
          {stages.map((s, i) => (
            <React.Fragment key={s.title}>
              <div
                className="pipeline-card glass-panel"
                title={s.title}
              >
                <div className="pipeline-card-top">
                  <div className={`pipe-icon-box ${s.iconCls}`}>
                    {s.icon}
                  </div>
                  <div className="pipe-status-pill">
                    <span className="pipe-dot dot-green" />
                    <span>{s.status}</span>
                  </div>
                </div>
                <h3 className="pipe-title">{s.title}</h3>
                <p className="pipe-desc">{s.desc}</p>
              </div>

              {i < stages.length - 1 && (
                <div className="pipeline-connector" aria-hidden="true">
                  <ArrowRight size={16} className="connector-arrow" />
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Capstone Card */}
          <div className="capstone-card glass-panel" title="Multimodal AI Platform">
            <div className="capstone-icon-wrapper">
              <ShieldCheck size={22} className="text-cyan-400" />
            </div>
            <div className="capstone-content" style={{ textAlign: 'center' }}>
              <h4 className="capstone-title">Multimodal AI</h4>
              <p className="capstone-sub">Production Ready</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
