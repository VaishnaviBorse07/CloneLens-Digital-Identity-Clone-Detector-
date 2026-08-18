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
  CheckCircle2, 
  Scan,
  Layers
} from 'lucide-react';

export default function HeroSection({ onGetStarted, onWatchDemo }) {
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 100);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-section">
      {/* Background Cyber Ambient Glows */}
      <div className="hero-ambient-cyan"></div>
      <div className="hero-ambient-purple"></div>

      <div className="hero-grid">
        {/* Left Column: Headline & Action Buttons */}
        <div className="hero-content-col">
          {/* Pill Badge */}
          <div className="hero-badge">
            <Sparkles size={14} className="text-purple-bright animate-pulse" />
            <span>Multimodal AI Detection System</span>
          </div>

          {/* Main Title */}
          <h1 className="hero-main-title">
            Beyond Doubt.
            <br />
            <span className="hero-gradient-text">Trust the Truth.</span>
          </h1>

          {/* Description */}
          <p className="hero-description">
            Advanced multimodal AI system that detects identity clones, synthetic media, and AI-generated content with high accuracy and explainable results.
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta-group">
            <button 
              type="button" 
              className="btn-hero-primary"
              onClick={onGetStarted}
            >
              <Rocket size={18} />
              <span>Get Started</span>
            </button>

            <button 
              type="button" 
              className="btn-hero-secondary"
              onClick={onWatchDemo}
            >
              <Play size={16} className="text-cyan-primary fill-cyan-primary/20" />
              <span>Watch Demo</span>
            </button>
          </div>
        </div>

        {/* Center & Right Column: Holographic Cyber Face Visualizer & Telemetry Cards */}
        <div className="hero-visual-col">
          {/* Holographic Wireframe Cyber Face HUD */}
          <div className="cyber-face-container">
            {/* Target HUD Framing Brackets */}
            <div className="hud-bracket hud-top-left"></div>
            <div className="hud-bracket hud-top-right"></div>
            <div className="hud-bracket hud-bottom-left"></div>
            <div className="hud-bracket hud-bottom-right"></div>

            {/* Scanning Laser Beam */}
            <div className="laser-scanline">
              <div className="laser-beam-core"></div>
              <div className="laser-glow"></div>
            </div>

            {/* Glowing Face Wireframe Vector */}
            <svg 
              className="cyber-face-svg" 
              viewBox="0 0 320 380" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="faceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#818cf8" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="gridGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
                </linearGradient>
                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background circular radar reticle */}
              <circle cx="160" cy="180" r="140" stroke="url(#gridGrad)" strokeWidth="1" strokeDasharray="4 6" opacity="0.35" />
              <circle cx="160" cy="180" r="110" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="2 8" opacity="0.4" />
              <circle cx="160" cy="180" r="60" stroke="#a855f7" strokeWidth="0.5" opacity="0.3" />

              {/* Wireframe Facial Contour & Mesh Structure */}
              <g filter="url(#neonGlow)" stroke="url(#faceGrad)" strokeWidth="1.2" opacity="0.88">
                {/* Outer Head Contour */}
                <path d="M 100,90 C 100,45 220,45 220,90 C 235,140 230,220 205,270 C 185,310 160,325 160,325 C 160,325 135,310 115,270 C 90,220 85,140 100,90 Z" />

                {/* Forehead & Temple Grid */}
                <path d="M 120,70 Q 160,85 200,70" />
                <path d="M 110,105 Q 160,125 210,105" />
                <path d="M 105,140 Q 160,160 215,140" />

                {/* Eyebrows */}
                <path d="M 120,125 Q 140,118 152,126" strokeWidth="1.6" stroke="#38bdf8" />
                <path d="M 168,126 Q 180,118 200,125" strokeWidth="1.6" stroke="#38bdf8" />

                {/* Eyes Wireframe */}
                <polygon points="125,138 138,132 150,138 138,144" stroke="#00f2fe" fill="rgba(56,189,248,0.15)" strokeWidth="1.4" />
                <circle cx="138" cy="138" r="3" fill="#00f2fe" />

                <polygon points="170,138 182,132 195,138 182,144" stroke="#00f2fe" fill="rgba(56,189,248,0.15)" strokeWidth="1.4" />
                <circle cx="182" cy="138" r="3" fill="#00f2fe" />

                {/* Nose Bridge & Base */}
                <path d="M 160,126 L 157,175 L 160,186 L 163,175 Z" />
                <path d="M 148,188 Q 160,192 172,188" strokeWidth="1.4" />

                {/* Cheekbones & Jawline Mesh Lines */}
                <path d="M 105,160 L 145,188 L 160,225" />
                <path d="M 215,160 L 175,188 L 160,225" />
                <path d="M 115,220 L 140,240 L 160,285" />
                <path d="M 205,220 L 180,240 L 160,285" />

                {/* Mouth & Lips */}
                <polygon points="142,225 160,218 178,225 160,234" stroke="#c084fc" fill="rgba(192,132,252,0.15)" strokeWidth="1.4" />
                <path d="M 142,225 L 178,225" stroke="#f8fafc" strokeWidth="1" />
                <path d="M 148,245 Q 160,250 172,245" />

                {/* Chin & Neck Contours */}
                <path d="M 145,280 Q 160,290 175,280" />
                <path d="M 130,315 L 130,355" strokeDasharray="3 3" opacity="0.6" />
                <path d="M 190,315 L 190,355" strokeDasharray="3 3" opacity="0.6" />

                {/* Dense Neural Nodes Grid Dots */}
                <circle cx="160" cy="90" r="2" fill="#38bdf8" />
                <circle cx="130" cy="95" r="2" fill="#818cf8" />
                <circle cx="190" cy="95" r="2" fill="#818cf8" />
                <circle cx="110" cy="140" r="2" fill="#38bdf8" />
                <circle cx="210" cy="140" r="2" fill="#38bdf8" />
                <circle cx="145" cy="188" r="2.5" fill="#c084fc" />
                <circle cx="175" cy="188" r="2.5" fill="#c084fc" />
                <circle cx="160" cy="225" r="2" fill="#00f2fe" />
                <circle cx="160" cy="285" r="2.5" fill="#38bdf8" />
                <circle cx="135" cy="265" r="2" fill="#818cf8" />
                <circle cx="185" cy="265" r="2" fill="#818cf8" />
              </g>

              {/* Crosshair coordinate markers */}
              <text x="20" y="30" fill="#38bdf8" fontSize="9" fontFamily="monospace" opacity="0.7">REC: 1080P [60FPS]</text>
              <text x="20" y="44" fill="#64748b" fontSize="8" fontFamily="monospace">LAT: 37.77 N / LON: -122.41 W</text>
              <text x="220" y="355" fill="#a855f7" fontSize="8" fontFamily="monospace">SYNTH_SCORE: 0.04</text>
            </svg>
          </div>

          {/* Right Floating Live Telemetry Cards */}
          <div className="floating-telemetry-stack">
            {/* Card 1: Image Analysis */}
            <div className="telemetry-card glass-panel">
              <div className="telemetry-icon-box cyan-box">
                <ImageIcon size={18} className="text-cyan-primary" />
              </div>
              <div className="telemetry-body">
                <span className="telemetry-title">Image Analysis</span>
                <div className="telemetry-val-row">
                  <span className="telemetry-status text-emerald-bright">Authentic</span>
                  <span className="telemetry-conf">Confidence: 87%</span>
                </div>
                <div className="telemetry-bar-bg">
                  <div className="telemetry-bar-fill fill-emerald" style={{ width: '87%' }}></div>
                </div>
              </div>
            </div>

            {/* Card 2: Text Analysis */}
            <div className="telemetry-card glass-panel">
              <div className="telemetry-icon-box purple-box">
                <FileText size={18} className="text-purple-bright" />
              </div>
              <div className="telemetry-body">
                <span className="telemetry-title">Text Analysis</span>
                <div className="telemetry-val-row">
                  <span className="telemetry-status text-emerald-bright">Human-written</span>
                  <span className="telemetry-conf">Confidence: 82%</span>
                </div>
                <div className="telemetry-bar-bg">
                  <div className="telemetry-bar-fill fill-emerald" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>

            {/* Card 3: Fusion Score */}
            <div className="telemetry-card glass-panel fusion-card">
              <div className="telemetry-icon-box magenta-box">
                <GitMerge size={18} className="text-purple-bright" />
              </div>
              <div className="telemetry-body">
                <span className="telemetry-title">Fusion Score</span>
                <div className="fusion-score-row">
                  <span className="fusion-score-val">84%</span>
                  <span className="fusion-score-tag">High Confidence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Metric Statistics Row */}
      <div className="hero-stats-row glass-panel">
        <div className="stat-item">
          <div className="stat-icon-wrapper stat-icon-blue">
            <Shield size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-number">98.6%</span>
            <span className="stat-label">Model Accuracy</span>
          </div>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-item">
          <div className="stat-icon-wrapper stat-icon-cyan">
            <Zap size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-number">1.8s</span>
            <span className="stat-label">Avg. Analysis Time</span>
          </div>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-item">
          <div className="stat-icon-wrapper stat-icon-green">
            <BarChart3 size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Analyses Done</span>
          </div>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-item">
          <div className="stat-icon-wrapper stat-icon-purple">
            <Lock size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-number">100%</span>
            <span className="stat-label">Data Privacy</span>
          </div>
        </div>
      </div>
    </section>
  );
}
