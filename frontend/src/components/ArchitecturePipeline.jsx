import React from 'react';
import { 
  Box, 
  Layers, 
  Scale, 
  Database, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  FileCode,
  Network
} from 'lucide-react';

export default function ArchitecturePipeline({ health }) {
  const cnnStatus = health?.models?.image_custom_cnn?.status || 'Ready';
  const textStatus = health?.models?.text_nlp_llm?.status || 'Ready';
  const fusionStatus = health?.models?.decision_fusion?.status || 'Ready';

  return (
    <section className="architecture-section">
      {/* Section Header Tag */}
      <div className="section-header-row">
        <div className="section-tag">
          <span className="section-tag-dot"></span>
          <span>SYSTEM ARCHITECTURE</span>
        </div>
        <div className="section-header-line"></div>
      </div>

      {/* 4-Stage Interactive Pipeline & Capstone Card */}
      <div className="pipeline-wrapper">
        <div className="pipeline-cards-row">
          {/* Stage 1: Custom PyTorch CNN */}
          <div className="pipeline-card glass-panel" title="Analyzes spatial frequency noise & synthetic facial artifacts">
            <div className="pipeline-card-top">
              <div className="pipe-icon-box pipe-icon-purple">
                <Box size={22} className="text-purple-bright" />
              </div>
              <div className="pipe-status-pill">
                <span className="pipe-dot dot-green"></span>
                <span>{cnnStatus === 'Ready' ? 'Ready' : 'Trained'}</span>
              </div>
            </div>
            <h3 className="pipe-title">Custom PyTorch CNN</h3>
            <p className="pipe-desc">4-Block Convolutional Network (32–256 filters)</p>
          </div>

          {/* Flow Connector Arrow */}
          <div className="pipeline-connector" aria-hidden="true">
            <ArrowRight size={18} className="connector-arrow" />
          </div>

          {/* Stage 2: NLP & Stylometric Suite */}
          <div className="pipeline-card glass-panel" title="Extracts Shannon entropy, TTR, and stylistic markers">
            <div className="pipeline-card-top">
              <div className="pipe-icon-box pipe-icon-cyan">
                <Layers size={22} className="text-cyan-primary" />
              </div>
              <div className="pipe-status-pill">
                <span className="pipe-dot dot-green"></span>
                <span>Ready</span>
              </div>
            </div>
            <h3 className="pipe-title">NLP &amp; Stylometric Suite</h3>
            <p className="pipe-desc">Text &amp; style pattern analysis</p>
          </div>

          {/* Flow Connector Arrow */}
          <div className="pipeline-connector" aria-hidden="true">
            <ArrowRight size={18} className="connector-arrow" />
          </div>

          {/* Stage 3: Decision Fusion */}
          <div className="pipeline-card glass-panel" title="Dynamic weighted multimodal interpolation & confidence calibration">
            <div className="pipeline-card-top">
              <div className="pipe-icon-box pipe-icon-magenta">
                <Scale size={22} className="text-purple-bright" />
              </div>
              <div className="pipe-status-pill">
                <span className="pipe-dot dot-green"></span>
                <span>Ready</span>
              </div>
            </div>
            <h3 className="pipe-title">Decision Fusion &amp; Storage</h3>
            <p className="pipe-desc">Weighted multimodal scoring</p>
          </div>

          {/* Flow Connector Arrow */}
          <div className="pipeline-connector" aria-hidden="true">
            <ArrowRight size={18} className="connector-arrow" />
          </div>

          {/* Stage 4: Secure Storage */}
          <div className="pipeline-card glass-panel" title="Stores audit records with SHA256 integrity checks">
            <div className="pipeline-card-top">
              <div className="pipe-icon-box pipe-icon-emerald">
                <Database size={22} className="text-emerald-bright" />
              </div>
              <div className="pipe-status-pill">
                <span className="pipe-dot dot-green"></span>
                <span>Ready</span>
              </div>
            </div>
            <h3 className="pipe-title">Secure Storage</h3>
            <p className="pipe-desc">Encrypted results &amp; audit trail</p>
          </div>

          {/* Capstone Badge Card */}
          <div className="capstone-card glass-panel">
            <div className="capstone-icon-wrapper">
              <GraduationCap size={24} className="text-amber-400" />
            </div>
            <div className="capstone-content">
              <h4 className="capstone-title">B.Tech Final Year Capstone</h4>
              <p className="capstone-sub">Engineering Excellence</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
