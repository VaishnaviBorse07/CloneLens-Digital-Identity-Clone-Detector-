import React from 'react';
import { Layers, Network, BookOpen, CheckCircle, Database } from 'lucide-react';

export default function ModelInfoCard({ health }) {
  const cnnStatus = health?.models?.image_custom_cnn?.status || 'Training required';

  return (
    <div className="glass-panel model-info-container">
      <div className="model-info-header">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-cyan-primary" />
          <h3 className="font-heading font-semibold text-lg">System Architecture & Research Framework</h3>
        </div>
        <span className="badge badge-cyan">B.Tech Final Year Capstone</span>
      </div>

      <div className="architecture-grid">
        <div className="arch-card">
          <div className="arch-card-title">
            <Layers size={16} className="text-cyan-primary" />
            <h4>Custom PyTorch CNN</h4>
          </div>
          <p className="arch-desc">
            4-Block Convolutional Feature Extractor (32 &rarr; 64 &rarr; 128 &rarr; 256 filters) with Adaptive Pooling and regularized Dense Classification head.
          </p>
          <div className="arch-status-row">
            <span className="text-xs text-muted">Status:</span>
            <span className={`badge ${cnnStatus === 'Ready' ? 'badge-success' : 'badge-warning'}`}>
              {cnnStatus}
            </span>
          </div>
        </div>

        <div className="arch-card">
          <div className="arch-card-title">
            <Network size={16} className="text-indigo-primary" />
            <h4>Multi-Provider LLM & NLP Suite</h4>
          </div>
          <p className="arch-desc">
            {health?.models?.text_nlp_llm?.details || 'Extracts Shannon entropy, sentence-length burstiness, vocabulary richness (TTR), and AI transition markers with Gemini / OpenAI / Groq / Local LLM providers.'}
          </p>
          <div className="arch-status-row">
            <span className="text-xs text-muted">Status:</span>
            <span className="badge badge-success">
              {health?.models?.text_nlp_llm?.status || 'Ready (Multi-Provider)'}
            </span>
          </div>
        </div>

        <div className="arch-card">
          <div className="arch-card-title">
            <Database size={16} className="text-purple-primary" />
            <h4>Decision Fusion & Storage</h4>
          </div>
          <p className="arch-desc">
            Calibrated weighted interpolation: <code>Score = 0.60 &times; S_img + 0.40 &times; S_txt</code> with cross-modal variance penalty and SQLite/PostgreSQL audit trail.
          </p>
          <div className="arch-status-row">
            <span className="text-xs text-muted">Status:</span>
            <span className="badge badge-success">Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
