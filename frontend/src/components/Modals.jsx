import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Info, 
  Mail, 
  Play, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  FileCode, 
  Scale, 
  Database,
  Send,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export default function Modals({ modalType, onClose, onLoadDemoSample }) {
  const [contactSent, setContactSent] = useState(false);
  const [demoStep, setDemoStep] = useState(1);

  if (!modalType) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            {modalType === 'about' && <Info className="text-cyan-primary" size={20} />}
            {modalType === 'docs' && <FileCode className="text-purple-bright" size={20} />}
            {modalType === 'contact' && <Mail className="text-emerald-bright" size={20} />}
            {modalType === 'demo' && <Play className="text-cyan-primary" size={20} />}
            <h3 className="modal-title">
              {modalType === 'about' && 'About CloneLens Research System'}
              {modalType === 'docs' && 'Architecture & Technical Documentation'}
              {modalType === 'contact' && 'Contact & Engineering Team'}
              {modalType === 'demo' && 'Interactive Forensic Demo Walkthrough'}
            </h3>
          </div>

          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose} 
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* ABOUT MODAL */}
          {modalType === 'about' && (
            <div className="modal-content-section">
              <p className="modal-lead">
                <strong>CloneLens</strong> is a multimodal artificial intelligence system engineered to counter the proliferation of digital identity theft, high-fidelity deepfake portraits, and automated social bot masquerading.
              </p>

              <div className="modal-grid-two">
                <div className="modal-info-box">
                  <h4 className="font-heading font-semibold text-cyan-primary mb-1">Key Research Contributions</h4>
                  <ul className="text-xs space-y-1.5 text-secondary list-disc pl-4">
                    <li>4-Block Custom PyTorch CNN specialized in high-frequency pixel noise residual analysis.</li>
                    <li>Dual-branch linguistic stylometry (Shannon entropy, TTR, sentence variance) with LLM heuristics.</li>
                    <li>Weighted Decision Fusion Engine with cross-modal conflict calibration.</li>
                  </ul>
                </div>

                <div className="modal-info-box">
                  <h4 className="font-heading font-semibold text-purple-bright mb-1">Academic Context</h4>
                  <p className="text-xs text-secondary leading-relaxed">
                    Developed as a <strong>B.Tech Final Year Engineering Capstone Project</strong> in Computer Science and Engineering, adhering to responsible AI evaluation protocols and zero-storage privacy standards.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* DOCS MODAL */}
          {modalType === 'docs' && (
            <div className="modal-content-section">
              <div className="docs-subhead">
                <span className="badge badge-purple">API Spec &amp; Pipeline</span>
                <span className="text-xs text-muted">Version 1.0.0</span>
              </div>

              <div className="code-block-wrapper">
                <p className="text-xs text-secondary mb-1"><strong>REST API Endpoints:</strong></p>
                <pre className="cyber-code-block">
{`POST /api/analyze/image      -> Multipart file (JPEG/PNG/WEBP <= 10MB)
POST /api/analyze/text       -> JSON { "text": "..." }
POST /api/analyze/multimodal -> Multipart file + Form text
GET  /api/health             -> Diagnostic health status & ML model latency
GET  /api/results/{id}       -> Query persisted audit record by ID`}
                </pre>
              </div>

              <div className="mt-4">
                <p className="text-xs text-secondary mb-1"><strong>Decision Fusion Formula:</strong></p>
                <div className="p-3 bg-tertiary rounded-md border border-subtle font-mono text-xs text-cyan-primary">
                  F = (0.60 &times; S_image) + (0.40 &times; S_text) &plusmn; &Delta;cross_modal_penalty
                </div>
              </div>
            </div>
          )}

          {/* CONTACT MODAL */}
          {modalType === 'contact' && (
            <div className="modal-content-section">
              {!contactSent ? (
                <form 
                  onSubmit={(e) => { e.preventDefault(); setContactSent(true); }}
                  className="space-y-3"
                >
                  <p className="text-xs text-secondary">
                    Get in touch with the CloneLens capstone research team for queries, peer review, or integration questions.
                  </p>
                  <div>
                    <label className="text-xs text-muted block mb-1">Your Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Dr. Jane Smith" 
                      className="modal-input" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted block mb-1">Your Email</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="e.g. jane@institution.edu" 
                      className="modal-input" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted block mb-1">Message</label>
                    <textarea 
                      rows={3} 
                      required 
                      placeholder="Share feedback or inquiry..." 
                      className="modal-input"
                    ></textarea>
                  </div>
                  <button type="submit" className="btn-hero-primary w-full py-2">
                    <Send size={15} />
                    <span>Send Message</span>
                  </button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle size={40} className="text-emerald-bright mx-auto mb-2" />
                  <h4 className="font-heading text-lg font-bold">Message Sent!</h4>
                  <p className="text-xs text-secondary mt-1">Thank you for your interest in CloneLens.</p>
                </div>
              )}
            </div>
          )}

          {/* DEMO MODAL */}
          {modalType === 'demo' && (
            <div className="modal-content-section">
              <p className="modal-lead">
                Walk through an interactive simulation of CloneLens detecting synthetic identity clones.
              </p>

              <div className="demo-steps-box">
                <div className="demo-step-badge">Step {demoStep} of 3</div>
                {demoStep === 1 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-cyan-primary">1. Multimodal Verification Input</h4>
                    <p className="text-xs text-secondary">
                      Upload a facial image and associated social bio text. The input module validates aspect ratios, sensor noise levels, and syntactic structure.
                    </p>
                  </div>
                )}
                {demoStep === 2 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-purple-bright">2. Neural CNN &amp; NLP Extraction</h4>
                    <p className="text-xs text-secondary">
                      The Custom PyTorch CNN extracts 256 high-dimensional artifact feature vectors while the NLP engine computes Shannon entropy and burstiness metrics.
                    </p>
                  </div>
                )}
                {demoStep === 3 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-emerald-bright">3. Fusion &amp; Explainable Verdict</h4>
                    <p className="text-xs text-secondary">
                      The Decision Fusion Engine weighs cross-modal probabilities to deliver a comprehensive authenticity assessment with clear forensic rationale.
                    </p>
                  </div>
                )}
              </div>

              <div className="demo-actions-row">
                {demoStep < 3 ? (
                  <button 
                    type="button" 
                    className="btn-hero-primary" 
                    onClick={() => setDemoStep(demoStep + 1)}
                  >
                    <span>Next Step &rarr;</span>
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="btn-hero-primary" 
                    onClick={() => { onClose(); onLoadDemoSample(); }}
                  >
                    <Play size={15} />
                    <span>Try Demo in Workspace</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
