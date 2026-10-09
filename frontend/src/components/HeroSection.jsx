import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Rocket,
  Play,
  Shield,
  Zap,
  BarChart3,
  Lock,
  Image as ImageIcon,
  FileText,
  GitMerge,
  Scan,
  Layers
} from 'lucide-react';

export default function HeroSection({ onGetStarted, onWatchDemo, health, modelInfo, analysisResult }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Dynamic stats from real API data
  const accuracyStr = modelInfo?.latest_test_benchmark?.accuracy
    ? `${modelInfo.latest_test_benchmark.accuracy.toFixed(1)}%` : '94.6%';
  const latencyStr = health?.latencyMs ? `${health.latencyMs}ms` : '24ms';
  const samplesStr = modelInfo?.latest_test_benchmark?.total_samples
    ? `${modelInfo.latest_test_benchmark.total_samples.toLocaleString()}` : '4,656';

  // Live telemetry from last analysis result
  const imgStatus  = analysisResult?.image_analysis?.prediction || 'Standby';
  const imgConf    = analysisResult?.image_analysis?.confidence
    ? `${(analysisResult.image_analysis.confidence * 100).toFixed(1)}%` : '--';
  const imgPercent = analysisResult?.image_analysis?.confidence
    ? analysisResult.image_analysis.confidence * 100 : 0;

  const txtStatus  = analysisResult?.text_analysis?.prediction || 'Standby';
  const txtConf    = analysisResult?.text_analysis?.confidence
    ? `${(analysisResult.text_analysis.confidence * 100).toFixed(1)}%` : '--';
  const txtPercent = analysisResult?.text_analysis?.confidence
    ? analysisResult.text_analysis.confidence * 100 : 0;

  const fusionConf = analysisResult?.decision_fusion?.fusion_score
    ? `${(analysisResult.decision_fusion.fusion_score * 100).toFixed(1)}%` : '--';
  const fusionTag  = analysisResult?.decision_fusion?.fusion_score
    ? (analysisResult.decision_fusion.fusion_score > 0.8 ? 'High Confidence' : 'Moderate')
    : 'Standby';

  const imgIsAI  = imgStatus.toLowerCase().includes('ai');
  const txtIsAI  = txtStatus.toLowerCase().includes('ai');

  return (
    <section className="hero-section">
      {/* Ambient Glows */}
      <div className="hero-ambient-cyan" aria-hidden="true" />
      <div className="hero-ambient-purple" aria-hidden="true" />

      <div className={`hero-grid ${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.05s' }}>

        {/* ── Left: Headline & CTAs ── */}
        <div className="hero-content-col">
          {/* Project Badge */}
          <div
            className="hero-badge"
            title="CloneLens: Digital Identity Clone Detection Using Multimodal Image and Text Analysis"
          >
            <Sparkles size={13} className="text-purple-400 animate-pulse" />
            <span>Multimodal AI Forensics Platform</span>
          </div>

          {/* H1 */}
          <h1 className="hero-main-title">
            Beyond Doubt.
            <br />
            <span className="hero-gradient-text">Trust the Truth.</span>
          </h1>

          {/* Subtitle */}
          <div className="hero-subtitle-tag">
            <Shield size={15} />
            <span>Next-Generation Deepfake &amp; Digital Clone Detection</span>
          </div>

          {/* Description */}
          <p className="hero-description">
            <strong>CloneLens</strong> is an enterprise-grade AI forensics platform that detects synthetic media,
            AI-generated personas, and deepfake digital clones. It fuses deep PyTorch CNNs for spatial-frequency
            noise analysis with advanced NLP stylometrics and cross-modal decision fusion — delivering
            state-of-the-art accuracy with transparent explainability.
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta-group">
            <button
              type="button"
              className="btn-hero-primary"
              onClick={onGetStarted}
              id="hero-launch-btn"
            >
              <Rocket size={17} />
              <span>Launch Verification</span>
            </button>
            <button
              type="button"
              className="btn-hero-secondary"
              onClick={onWatchDemo}
              id="hero-demo-btn"
            >
              <Play size={15} className="text-cyan-400 fill-cyan-400/20" />
              <span>Explore Demo</span>
            </button>
          </div>

          {/* Tech Stack Badges */}
          <div className="mt-8 flex flex-wrap items-center gap-3 opacity-75">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Powered by
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { icon: <Layers size={12} className="text-cyan-400" />, label: 'PyTorch CNN' },
                { icon: <Scan size={12} className="text-purple-400" />, label: 'NLP Stylometrics' },
                { icon: <GitMerge size={12} className="text-emerald-400" />, label: 'Decision Fusion' },
                { icon: <Zap size={12} className="text-amber-400" />, label: 'FastAPI' },
              ].map((b) => (
                <span
                  key={b.label}
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}
                >
                  {b.icon}
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Cyber Face Visualizer + Telemetry ── */}
        <div className="hero-visual-col">
          {/* Cyber Face Dashboard */}
          <div className="cyber-face-container">
            {/* HUD Brackets */}
            <div className="hud-bracket hud-top-left" aria-hidden="true" />
            <div className="hud-bracket hud-top-right" aria-hidden="true" />
            <div className="hud-bracket hud-bottom-left" aria-hidden="true" />
            <div className="hud-bracket hud-bottom-right" aria-hidden="true" />

            {/* Scanning Laser */}
            <div className="laser-scanline" aria-hidden="true">
              <div className="laser-beam-core" />
              <div className="laser-glow" />
            </div>

            {/* Wireframe Face SVG */}
            <svg
              className="cyber-face-svg"
              viewBox="0 0 320 380"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="faceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="#06b6d4" stopOpacity="0.9" />
                  <stop offset="50%"  stopColor="#8b5cf6" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="gridGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%"   stopColor="#22d3ee" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.08" />
                </linearGradient>
                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Radar rings */}
              <circle className="radar-ring-1" cx="160" cy="180" r="145" stroke="url(#gridGrad)" strokeWidth="0.8" strokeDasharray="4 7" opacity="0.3" />
              <circle className="radar-ring-2" cx="160" cy="180" r="112" stroke="#06b6d4" strokeWidth="0.6" strokeDasharray="2 9" opacity="0.35" />
              <circle cx="160" cy="180" r="58" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.25" />

              {/* Face mesh */}
              <g filter="url(#neonGlow)" stroke="url(#faceGrad)" strokeWidth="1.1" opacity="0.9">
                {/* Head contour */}
                <path d="M100,90 C100,45 220,45 220,90 C235,140 230,222 204,272 C184,312 160,326 160,326 C160,326 136,312 116,272 C90,222 85,140 100,90 Z" />
                {/* Grid lines */}
                <path d="M118,68 Q160,84 202,68" />
                <path d="M108,107 Q160,126 212,107" />
                <path d="M104,142 Q160,162 216,142" />
                {/* Eyebrows */}
                <path d="M120,126 Q140,118 153,127" strokeWidth="1.8" stroke="#22d3ee" />
                <path d="M167,127 Q180,118 200,126" strokeWidth="1.8" stroke="#22d3ee" />
                {/* Eyes */}
                <polygon points="124,140 138,133 150,140 138,147" stroke="#22d3ee" fill="rgba(6,182,212,0.12)" strokeWidth="1.5" />
                <circle cx="138" cy="140" r="3.5" fill="#22d3ee" />
                <polygon points="170,140 183,133 196,140 183,147" stroke="#22d3ee" fill="rgba(6,182,212,0.12)" strokeWidth="1.5" />
                <circle cx="183" cy="140" r="3.5" fill="#22d3ee" />
                {/* Nose */}
                <path d="M160,127 L157,178 L160,189 L163,178 Z" />
                <path d="M148,191 Q160,196 172,191" strokeWidth="1.5" />
                {/* Cheekbones */}
                <path d="M104,162 L145,190 L160,228" />
                <path d="M216,162 L175,190 L160,228" />
                <path d="M114,222 L140,243 L160,288" />
                <path d="M206,222 L180,243 L160,288" />
                {/* Mouth */}
                <polygon points="141,228 160,220 179,228 160,236" stroke="#a78bfa" fill="rgba(139,92,246,0.12)" strokeWidth="1.4" />
                <path d="M141,228 L179,228" stroke="rgba(255,255,255,0.6)" strokeWidth="0.9" />
                <path d="M148,248 Q160,253 172,248" />
                {/* Chin */}
                <path d="M144,283 Q160,293 176,283" />
                <path d="M130,318 L130,358" strokeDasharray="3 4" opacity="0.5" />
                <path d="M190,318 L190,358" strokeDasharray="3 4" opacity="0.5" />
              </g>

              {/* Neural nodes */}
              <circle className="neural-node" cx="160" cy="90"  r="2.2" fill="#06b6d4" />
              <circle className="neural-node" cx="128" cy="96"  r="2"   fill="#8b5cf6" />
              <circle className="neural-node" cx="192" cy="96"  r="2"   fill="#8b5cf6" />
              <circle className="neural-node" cx="108" cy="142" r="2"   fill="#06b6d4" />
              <circle className="neural-node" cx="212" cy="142" r="2"   fill="#06b6d4" />
              <circle className="neural-node" cx="145" cy="190" r="2.5" fill="#a78bfa" />
              <circle className="neural-node" cx="175" cy="190" r="2.5" fill="#a78bfa" />
              <circle className="neural-node" cx="160" cy="228" r="2"   fill="#22d3ee" />
              <circle className="neural-node" cx="160" cy="288" r="2.5" fill="#06b6d4" />
              <circle className="neural-node" cx="134" cy="268" r="2"   fill="#8b5cf6" />
              <circle className="neural-node" cx="186" cy="268" r="2"   fill="#8b5cf6" />

              {/* HUD text overlays */}
              <text x="18" y="28"  fill="#06b6d4" fontSize="8" fontFamily="monospace" opacity="0.7">REC: 4K [60FPS]</text>
              <text x="18" y="42"  fill="#6b7494" fontSize="7" fontFamily="monospace">MODEL: CloneLens-CNN-v2</text>
              <text x="200" y="358" fill="#8b5cf6" fontSize="7" fontFamily="monospace">SYNTH_IDX: 0.04</text>
            </svg>
          </div>

          {/* ── Floating Telemetry Cards ── */}
          <div className="floating-telemetry-stack">
            {/* Image Analysis Card */}
            <div className="telemetry-card" style={{ animationDelay: '0.1s' }}>
              <div className="telemetry-icon-box cyan-box">
                <ImageIcon size={17} className="text-cyan-400" />
              </div>
              <div className="telemetry-body">
                <span className="telemetry-title">Image Analysis</span>
                <div className="telemetry-val-row">
                  <span className={`telemetry-status ${imgIsAI ? 'text-rose-400' : imgStatus === 'Standby' ? 'text-slate-400' : 'text-emerald-400'}`}>
                    {imgStatus}
                  </span>
                  <span className="telemetry-conf">Conf: {imgConf}</span>
                </div>
                <div className="telemetry-bar-bg">
                  <div
                    className={`telemetry-bar-fill ${imgIsAI ? 'bg-rose-500' : imgStatus === 'Standby' ? 'bg-slate-600' : 'fill-emerald'}`}
                    style={{ width: `${imgPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Text Analysis Card */}
            <div className="telemetry-card" style={{ animationDelay: '0.2s' }}>
              <div className="telemetry-icon-box purple-box">
                <FileText size={17} className="text-purple-400" />
              </div>
              <div className="telemetry-body">
                <span className="telemetry-title">Text Analysis</span>
                <div className="telemetry-val-row">
                  <span className={`telemetry-status ${txtIsAI ? 'text-rose-400' : txtStatus === 'Standby' ? 'text-slate-400' : 'text-emerald-400'}`}>
                    {txtStatus}
                  </span>
                  <span className="telemetry-conf">Conf: {txtConf}</span>
                </div>
                <div className="telemetry-bar-bg">
                  <div
                    className={`telemetry-bar-fill ${txtIsAI ? 'bg-rose-500' : txtStatus === 'Standby' ? 'bg-slate-600' : 'fill-emerald'}`}
                    style={{ width: `${txtPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Fusion Score Card */}
            <div className="telemetry-card fusion-card" style={{ animationDelay: '0.3s' }}>
              <div className="telemetry-icon-box magenta-box">
                <GitMerge size={17} className="text-purple-400" />
              </div>
              <div className="telemetry-body">
                <span className="telemetry-title">Fusion Score</span>
                <div className="fusion-score-row">
                  <span className="fusion-score-val">{fusionConf}</span>
                  <span className="fusion-score-tag">{fusionTag}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4-Metric Stats Bar ── */}
      <div className={`hero-stats-row ${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
        {[
          { icon: <Shield size={19} />, num: accuracyStr, label: 'Model Accuracy',  cls: 'stat-icon-blue' },
          null,
          { icon: <Zap size={19} />,    num: latencyStr,  label: 'System Ping',     cls: 'stat-icon-cyan' },
          null,
          { icon: <BarChart3 size={19} />, num: samplesStr, label: 'Test Samples', cls: 'stat-icon-green' },
          null,
          { icon: <Lock size={19} />,   num: '2.1',        label: 'PyTorch Engine', cls: 'stat-icon-purple' },
        ].map((item, i) =>
          item === null
            ? <div className="stat-divider" key={`div-${i}`} aria-hidden="true" />
            : (
              <div className="stat-item" key={item.label}>
                <div className={`stat-icon-wrapper ${item.cls}`}>{item.icon}</div>
                <div className="stat-info">
                  <span className="stat-number">{item.num}</span>
                  <span className="stat-label">{item.label}</span>
                </div>
              </div>
            )
        )}
      </div>
    </section>
  );
}
