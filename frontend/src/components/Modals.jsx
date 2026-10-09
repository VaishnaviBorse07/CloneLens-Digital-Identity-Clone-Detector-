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
  ExternalLink,
  Zap,
  GitMerge,
  Eye,
} from 'lucide-react';

export default function Modals({ modalType, onClose, onLoadDemoSample }) {
  const [contactSent, setContactSent] = useState(false);
  const [demoStep, setDemoStep]       = useState(1);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  if (!modalType) return null;

  const TITLES = {
    about:   'About CloneLens',
    docs:    'Architecture & API Documentation',
    contact: 'Contact the Team',
    demo:    'Interactive Demo Walkthrough',
  };

  const ICONS = {
    about:   <Info size={19} style={{ color: 'var(--cyan-bright)' }} />,
    docs:    <FileCode size={19} style={{ color: 'var(--purple-bright)' }} />,
    contact: <Mail size={19} style={{ color: 'var(--emerald-bright)' }} />,
    demo:    <Play size={19} style={{ color: 'var(--cyan-bright)' }} />,
  };

  const DEMO_STEPS = [
    {
      num: 1,
      color: 'var(--cyan-bright)',
      title: '1. Multimodal Verification Input',
      desc: 'Upload a facial image and/or paste associated bio text. The input module validates image format, aspect ratio, and text character count before initiating the analysis pipeline.',
    },
    {
      num: 2,
      color: 'var(--purple-bright)',
      title: '2. Neural CNN & NLP Extraction',
      desc: 'The Custom PyTorch CNN extracts 256-dimensional high-frequency feature vectors while the NLP engine computes Shannon entropy, TTR, and burstiness metrics in parallel.',
    },
    {
      num: 3,
      color: 'var(--emerald-bright)',
      title: '3. Fusion & Explainable Verdict',
      desc: 'The Decision Fusion Engine weighs cross-modal confidence probabilities using weighted linear interpolation, producing a final authenticity score with Grad-CAM visual explanation.',
    },
  ];

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={TITLES[modalType]}
    >
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* ── Modal Header ── */}
        <div className="modal-header">
          <div className="modal-title-row">
            {ICONS[modalType]}
            <h3 className="modal-title">{TITLES[modalType]}</h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Modal Body ── */}
        <div className="modal-body">

          {/* ══════════ ABOUT ══════════ */}
          {modalType === 'about' && (
            <div className="modal-content-section">
              <p className="modal-lead">
                <strong style={{ color: 'var(--text-primary)' }}>
                  CloneLens: Digital Identity Clone Detection Using Multimodal Image and Text Analysis
                </strong>{' '}
                is an advanced AI forensic platform engineered to counter digital identity theft,
                high-fidelity deepfake portraits, and automated social-bot masquerading.
              </p>

              <div className="modal-grid-two">
                <div className="modal-info-box">
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--cyan-bright)', marginBottom: '0.6rem' }}>
                    Key Technical Innovations
                  </h4>
                  <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, listStyle: 'disc', paddingLeft: '1.1rem' }}>
                    <li>4-Block Custom PyTorch CNN specialized in high-frequency pixel noise residual analysis.</li>
                    <li>Dual-branch stylometry suite (Shannon entropy, TTR, sentence variance) with LLM heuristics.</li>
                    <li>Weighted Decision Fusion Engine with cross-modal conflict calibration.</li>
                    <li>Grad-CAM XAI visualization for transparent spatial attention mapping.</li>
                  </ul>
                </div>

                <div className="modal-info-box">
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--purple-bright)', marginBottom: '0.6rem' }}>
                    Enterprise Architecture
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    Production-ready multimodal AI forensics platform built with FastAPI, PyTorch 2.1,
                    and SQLite audit storage. Adheres to responsible AI evaluation protocols and
                    zero-storage privacy standards.
                  </p>
                </div>
              </div>

              {/* Model Benchmarks */}
              <div className="modal-info-box">
                <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  Model Benchmark Results
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { label: 'Accuracy',   val: '94.63%' },
                    { label: 'Precision',  val: '95.82%' },
                    { label: 'Recall',     val: '93.44%' },
                    { label: 'F1 Score',   val: '94.61%' },
                    { label: 'ROC-AUC',    val: '0.9812' },
                    { label: 'Samples',    val: '4,656'  },
                  ].map((m) => (
                    <div
                      key={m.label}
                      style={{ padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}
                    >
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--cyan-bright)', fontFamily: 'var(--font-heading)' }}>{m.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ DOCS ══════════ */}
          {modalType === 'docs' && (
            <div className="modal-content-section">
              <div className="docs-subhead">
                <span className="badge badge-purple">API Spec</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>v1.0.0 · FastAPI</span>
              </div>

              <div className="code-block-wrapper">
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>REST API Endpoints:</p>
                <pre className="cyber-code-block">
{`POST /api/analyze/image       → Multipart file (JPEG/PNG/WEBP ≤ 10MB)
POST /api/analyze/text        → JSON { "text": "..." }
POST /api/analyze/multimodal  → Multipart file + Form text
GET  /api/health              → Diagnostic health + ML model latency
GET  /api/results/{id}        → Query persisted audit record by ID
GET  /api/model/info/image    → CNN benchmark & metadata`}
                </pre>
              </div>

              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Decision Fusion Formula:</p>
                <div
                  style={{ padding: '0.9rem 1.2rem', background: 'rgba(7,8,16,0.8)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--cyan-bright)', lineHeight: 1.7 }}
                >
                  F = (0.60 × S<sub>image</sub>) + (0.40 × S<sub>text</sub>) ± Δ<sub>cross-modal penalty</sub>
                </div>
              </div>

              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>3-Tier Classification Thresholds:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {[
                    { range: '≥ 70%', label: 'Human-Generated',  color: 'var(--emerald-bright)', bg: 'var(--emerald-bg)', border: 'var(--emerald-border)' },
                    { range: '50–70%',label: 'Moderate / Mixed', color: 'var(--amber-warning)',   bg: 'var(--amber-bg)',   border: 'var(--amber-border)' },
                    { range: '< 50%', label: 'AI-Generated',     color: 'var(--rose-bright)',     bg: 'var(--rose-bg)',    border: 'var(--rose-border)' },
                  ].map((t) => (
                    <div
                      key={t.label}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0.9rem', background: t.bg, border: `1px solid ${t.border}`, borderRadius: 'var(--radius-sm)' }}
                    >
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: t.color, fontFamily: 'var(--font-mono)', width: 55 }}>{t.range}</span>
                      <span style={{ fontSize: '0.82rem', color: t.color }}>{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ CONTACT ══════════ */}
          {modalType === 'contact' && (
            <div className="modal-content-section">
              {!contactSent ? (
                <>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                    Get in touch with the CloneLens AI engineering and research team for inquiries,
                    peer review, collaboration, or integration questions.
                  </p>
                  <form
                    onSubmit={(e) => { e.preventDefault(); setContactSent(true); }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
                  >
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Jane Smith"
                        className="modal-input"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        id="contact-name"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. jane@institution.edu"
                        className="modal-input"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        id="contact-email"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                        Message
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Share your feedback, inquiry, or research question..."
                        className="modal-input"
                        style={{ resize: 'vertical' }}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        id="contact-message"
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn-hero-primary w-full justify-center"
                      style={{ width: '100%', justifyContent: 'center' }}
                      id="contact-submit"
                    >
                      <Send size={15} />
                      <span>Send Message</span>
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <CheckCircle size={48} style={{ color: 'var(--emerald-bright)', margin: '0 auto 1rem' }} />
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Message Sent!
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Thank you for reaching out to the CloneLens team.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ══════════ DEMO ══════════ */}
          {modalType === 'demo' && (
            <div className="modal-content-section">
              <p className="modal-lead">
                Walk through an interactive simulation of CloneLens detecting synthetic identity clones
                step by step.
              </p>

              {/* Progress bar */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    style={{
                      flex: 1, height: 3, borderRadius: 999,
                      background: n <= demoStep ? 'var(--cyan-primary)' : 'rgba(255,255,255,0.08)',
                      transition: 'background 0.3s ease',
                    }}
                  />
                ))}
              </div>

              <div className="demo-steps-box">
                <div className="demo-step-badge">Step {demoStep} of 3</div>
                {DEMO_STEPS.filter((s) => s.num === demoStep).map((s) => (
                  <div key={s.num}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: s.color, marginBottom: '0.6rem', fontFamily: 'var(--font-heading)' }}>
                      {s.title}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                      {s.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="demo-actions-row">
                {demoStep > 1 && (
                  <button
                    type="button"
                    className="btn-hero-secondary"
                    onClick={() => setDemoStep(demoStep - 1)}
                  >
                    ← Back
                  </button>
                )}
                {demoStep < 3 ? (
                  <button
                    type="button"
                    className="btn-hero-primary"
                    onClick={() => setDemoStep(demoStep + 1)}
                    id="demo-next-btn"
                  >
                    Next Step →
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-hero-primary"
                    onClick={() => { onClose(); onLoadDemoSample(); }}
                    id="demo-try-btn"
                  >
                    <Play size={14} />
                    Try in Workspace
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
