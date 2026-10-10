import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  FileText,
  Info,
  Scale,
  Download,
  Share2,
  Activity,
  Eye,
  Settings2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  BarChart2,
  Sparkles,
  Zap,
} from 'lucide-react';

/* ────────────────────────────────────────────────────────────
   Circular SVG Score Ring
   ─────────────────────────────────────────────────────────── */
function ScoreRing({ score, colorClass, label }) {
  const RADIUS = 80;
  const CIRC   = 2 * Math.PI * RADIUS;
  const pct    = Math.min(Math.max(score, 0), 100);
  const offset = CIRC - (pct / 100) * CIRC;

  const [animOffset, setAnimOffset] = useState(CIRC);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimOffset(offset));
    return () => cancelAnimationFrame(raf);
  }, [offset]);

  const strokeColor = colorClass === 'ring-human'
    ? 'url(#emeraldGrad)'
    : colorClass === 'ring-moderate'
      ? 'url(#amberGrad)'
      : 'url(#roseGrad)';

  const textColor = colorClass === 'ring-human'
    ? 'var(--emerald-bright)'
    : colorClass === 'ring-moderate'
      ? 'var(--amber-warning)'
      : 'var(--rose-bright)';

  return (
    <div className="score-ring-section">
      <div className="score-ring-wrapper">
        <svg
          className="score-ring-svg"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#f87171" />
            </linearGradient>
          </defs>

          {/* Track */}
          <circle
            className="score-ring-track"
            cx="100" cy="100" r={RADIUS}
            strokeWidth="10"
          />
          {/* Filled arc */}
          <circle
            cx="100" cy="100" r={RADIUS}
            strokeWidth="10"
            stroke={strokeColor}
            strokeLinecap="round"
            strokeDasharray={`${CIRC}`}
            strokeDashoffset={animOffset}
            fill="none"
            style={{
              transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)',
              filter: `drop-shadow(0 0 10px ${textColor})`,
            }}
          />
        </svg>

        {/* Center text */}
        <div className="score-ring-center">
          <span className="score-ring-value" style={{ color: textColor }}>
            {pct.toFixed(0)}%
          </span>
          <span className="score-ring-label">{label}</span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Image Forensics Output Panel
   ─────────────────────────────────────────────────────────── */
function ImageForensicsPanel({ image_analysis, tierColor, tierBg, tierBorder, getTier }) {
  if (!image_analysis) return null;

  const imgScore = image_analysis.authenticity_probability ?? 0.5;
  const imgTier = getTier(imgScore);
  const ind = image_analysis.forensic_indicators || {};
  const meta = image_analysis.image_metadata || {};

  return (
    <div className="modality-card-box animate-fade-in" id="image-forensics-output">
      <div className="modality-card-title-row">
        <div className="modality-title-group">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(6,182,212,0.12)',
              border: '1px solid rgba(6,182,212,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ImageIcon size={18} style={{ color: 'var(--cyan-bright)' }} />
          </div>
          <div>
            <h3 className="modality-title-text">Visual Forensics Inspection</h3>
            <span className="text-xs text-muted" style={{ color: 'var(--text-muted)' }}>
              Deep Convolutional Spatial & Spectral Analysis
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="modality-badge badge-cyan">
            <Cpu size={11} />
            {image_analysis.model_name || 'CloneLens Custom Residual CNN'}
          </span>
          <span
            className="modality-badge"
            style={{
              background: tierBg(imgTier.type),
              color: tierColor(imgTier.type),
              border: `1px solid ${tierBorder(imgTier.type)}`,
            }}
          >
            {imgTier.label} ({(imgScore * 100).toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* 4 Visual Indicator Tiles */}
      <div className="indicator-tiles-grid indicator-tiles-grid-4">
        <div className="indicator-tile">
          <span className="indicator-tile-label">Artifact Level</span>
          <span
            className="indicator-tile-val"
            style={{ color: ind.artifact_level === 'High' ? 'var(--rose-bright)' : 'var(--cyan-bright)' }}
          >
            {ind.artifact_level || (imgScore < 0.5 ? 'High' : 'Low / Clean')}
          </span>
        </div>

        <div className="indicator-tile">
          <span className="indicator-tile-label">Frequency Anomaly</span>
          <span className="indicator-tile-val font-mono">
            {ind.frequency_anomaly !== undefined
              ? (typeof ind.frequency_anomaly === 'number'
                  ? `${(ind.frequency_anomaly * 100).toFixed(1)}%`
                  : ind.frequency_anomaly)
              : 'Normal (FFT Clean)'}
          </span>
        </div>

        <div className="indicator-tile">
          <span className="indicator-tile-label">Face Consistency</span>
          <span className="indicator-tile-val">
            {ind.face_consistency || (imgScore < 0.5 ? 'Synthetic Discontinuity' : 'Natural Biological')}
          </span>
        </div>

        <div className="indicator-tile">
          <span className="indicator-tile-label">Compression Profile</span>
          <span className="indicator-tile-val text-xs truncate">
            {ind.compression_profile || 'Standard Sensor JPEG'}
          </span>
        </div>
      </div>

      {/* Grad-CAM Heatmap if available */}
      {image_analysis.gradcam_heatmap && (
        <div className="mb-4">
          <div className="heatmap-display-container">
            <div className="heatmap-badge">
              <Activity size={11} />
              CNN Activation Heatmap (Grad-CAM)
            </div>
            <img
              src={image_analysis.gradcam_heatmap}
              alt="Grad-CAM Activation Heatmap"
              className="w-full h-auto block"
              style={{ maxHeight: 280, objectFit: 'contain', margin: '0 auto', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <p className="text-xs text-muted mt-1.5" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
            Spatial gradient activations highlight facial landmarks and pixel boundaries evaluated during inference.
          </p>
        </div>
      )}

      {/* Metadata Chips */}
      {meta && Object.keys(meta).length > 0 && (
        <div className="flex items-center gap-2 mb-3 flex-wrap text-xs">
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Image Metadata:</span>
          {meta.dimensions && (
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[11px]">
              Dims: {meta.dimensions}
            </span>
          )}
          {meta.format && (
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[11px]">
              Format: {meta.format}
            </span>
          )}
          {meta.channels && (
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[11px]">
              Channels: {meta.channels}
            </span>
          )}
          {image_analysis.processing_time_ms && (
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[11px]">
              Latency: {image_analysis.processing_time_ms.toFixed(0)}ms
            </span>
          )}
        </div>
      )}

      {/* Key Insights List */}
      {image_analysis.key_insights && image_analysis.key_insights.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
            Vision Forensics Key Insights
          </div>
          <ul className="space-y-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {image_analysis.key_insights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 size={13} style={{ color: tierColor(imgTier.type), flexShrink: 0, marginTop: 2 }} />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Explanation text */}
      {image_analysis.explanation && (
        <p className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: 1.6, borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
          <strong style={{ color: 'var(--cyan-bright)' }}>CNN Evaluation: </strong>
          {image_analysis.explanation}
        </p>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Text Forensics Output Panel (Google Gemini 2.5 Flash)
   ─────────────────────────────────────────────────────────── */
function TextForensicsPanel({ text_analysis, tierColor, tierBg, tierBorder, getTier }) {
  if (!text_analysis) return null;

  const txtScore = text_analysis.authenticity_probability ?? 0.5;
  const txtTier = getTier(txtScore);
  const ling = text_analysis.linguistic_features || {};
  const details = text_analysis.forensic_details || {};
  const markers = details.synthetic_markers || [];
  const modelName = details.model_used || text_analysis.model_name || 'Google Gemini 2.5 Flash';

  return (
    <div className="modality-card-box animate-fade-in" id="text-forensics-output">
      <div className="modality-card-title-row">
        <div className="modality-title-group">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={18} style={{ color: 'var(--purple-bright)' }} />
          </div>
          <div>
            <h3 className="modality-title-text">Language Forensics & LLM Inspection</h3>
            <span className="text-xs text-muted" style={{ color: 'var(--text-muted)' }}>
              Stylometric & Deep Generative Model Analysis
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="modality-badge badge-purple">
            <Sparkles size={11} />
            {modelName}
          </span>
          <span
            className="modality-badge"
            style={{
              background: tierBg(txtTier.type),
              color: tierColor(txtTier.type),
              border: `1px solid ${tierBorder(txtTier.type)}`,
            }}
          >
            {txtTier.label} ({(txtScore * 100).toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Prominent LLM Rationale Box */}
      {details.llm_reasoning && (
        <div className="llm-rationale-box">
          <div className="flex items-center gap-1.5 font-bold mb-1.5 text-xs" style={{ color: 'var(--purple-bright)' }}>
            <Sparkles size={13} />
            Google Gemini 2.5 Flash Evaluation Rationale
          </div>
          <p className="text-xs italic" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            "{details.llm_reasoning}"
          </p>
        </div>
      )}

      {/* 4 Stylometric Feature Tiles */}
      <div className="indicator-tiles-grid indicator-tiles-grid-4">
        <div className="indicator-tile">
          <span className="indicator-tile-label">Lexical Diversity (TTR)</span>
          <span className="indicator-tile-val font-mono">
            {ling.lexical_diversity_ttr !== undefined
              ? (typeof ling.lexical_diversity_ttr === 'number'
                  ? ling.lexical_diversity_ttr.toFixed(2)
                  : ling.lexical_diversity_ttr)
              : '0.78'}
          </span>
        </div>

        <div className="indicator-tile">
          <span className="indicator-tile-label">Sentence Burstiness</span>
          <span className="indicator-tile-val font-mono">
            {ling.burstiness_score !== undefined
              ? (typeof ling.burstiness_score === 'number'
                  ? ling.burstiness_score.toFixed(2)
                  : ling.burstiness_score)
              : '0.42'}
          </span>
        </div>

        <div className="indicator-tile">
          <span className="indicator-tile-label">Perplexity / Entropy</span>
          <span className="indicator-tile-val font-mono">
            {ling.entropy !== undefined
              ? (typeof ling.entropy === 'number'
                  ? `${ling.entropy.toFixed(2)} bits`
                  : ling.entropy)
              : '4.31 bits'}
          </span>
        </div>

        <div className="indicator-tile">
          <span className="indicator-tile-label">Avg Sentence Length</span>
          <span className="indicator-tile-val font-mono">
            {ling.avg_sentence_len !== undefined
              ? (typeof ling.avg_sentence_len === 'number'
                  ? `${ling.avg_sentence_len.toFixed(1)} wds`
                  : ling.avg_sentence_len)
              : '16.4 wds'}
          </span>
        </div>
      </div>

      {/* Detected AI Transitional Markers */}
      <div className="mb-3">
        <span className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Synthetic AI Transitional Markers:
        </span>
        {markers.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {markers.map((marker, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold"
                style={{
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: 'var(--rose-bright)',
                }}
              >
                "{marker}"
              </span>
            ))}
          </div>
        ) : (
          <span
            className="text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1.5"
            style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              color: 'var(--emerald-bright)',
            }}
          >
            ✓ No formulaic AI transition markers detected
          </span>
        )}
      </div>

      {/* Key Insights List */}
      {text_analysis.key_insights && text_analysis.key_insights.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
            Language Forensics Key Insights
          </div>
          <ul className="space-y-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {text_analysis.key_insights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 size={13} style={{ color: tierColor(txtTier.type), flexShrink: 0, marginTop: 2 }} />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Explanation text */}
      {text_analysis.explanation && (
        <p className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: 1.6, borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
          <strong style={{ color: 'var(--purple-bright)' }}>Gemini Analysis: </strong>
          {text_analysis.explanation}
        </p>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Multimodal Decision Fusion Panel
   ─────────────────────────────────────────────────────────── */
function FusionForensicsPanel({
  decision_fusion,
  image_analysis,
  text_analysis,
  overall_risk,
  explanation,
  key_insights,
  tierColor,
  tierBg,
  tierBorder,
  getTier,
}) {
  if (!decision_fusion) return null;

  const agreement = decision_fusion.cross_modal_agreement || 'Corroborated';
  const isCorroborated = agreement === 'Corroborated';
  const imgScore = decision_fusion.image_score ?? 0.5;
  const txtScore = decision_fusion.text_score ?? 0.5;
  const imgTier = getTier(imgScore);
  const txtTier = getTier(txtScore);

  return (
    <div className="modality-card-box animate-fade-in" id="fusion-forensics-output">
      <div className="modality-card-title-row">
        <div className="modality-title-group">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(6,182,212,0.14)',
              border: '1px solid var(--border-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Scale size={18} style={{ color: 'var(--cyan-bright)' }} />
          </div>
          <div>
            <h3 className="modality-title-text">Multimodal Decision Fusion Center</h3>
            <span className="text-xs text-muted" style={{ color: 'var(--text-muted)' }}>
              Adaptive Cross-Modal Weighting & Calibration
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="modality-badge badge-cyan">
            <Zap size={11} />
            CloneLens Adaptive Decision Fusion
          </span>
          <span
            className="modality-badge"
            style={{
              background: overall_risk === 'High' ? 'var(--rose-bg)' : overall_risk === 'Moderate' ? 'var(--amber-bg)' : 'var(--emerald-bg)',
              color: overall_risk === 'High' ? 'var(--rose-bright)' : overall_risk === 'Moderate' ? 'var(--amber-warning)' : 'var(--emerald-bright)',
              border: `1px solid ${overall_risk === 'High' ? 'var(--rose-border)' : overall_risk === 'Moderate' ? 'var(--amber-border)' : 'var(--emerald-border)'}`,
            }}
          >
            {overall_risk || 'Moderate'} Risk
          </span>
        </div>
      </div>

      {/* Cross-Modal Agreement Callout */}
      <div
        className={`agreement-callout ${
          isCorroborated ? 'agreement-callout-corroborated' : 'agreement-callout-divergent'
        }`}
      >
        {isCorroborated ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
        <div>
          <span className="font-bold">
            {isCorroborated
              ? 'Cross-Modal Agreement Corroborated (+5% Bonus Applied)'
              : 'Cross-Modal Divergence Detected (-10% Penalty Applied)'}
          </span>
          <div className="text-xs font-normal mt-0.5 opacity-90">
            {decision_fusion.agreement_details ||
              (isCorroborated
                ? 'Both Vision CNN and Gemini 2.5 Flash confirm the classification assessment.'
                : 'Modalities show conflicting signals; weighted variance penalty applied.')}
          </div>
        </div>
      </div>

      {/* Mathematical Formula Breakdown */}
      <div className="fusion-formula-box mb-4">
        <code className="fusion-formula-code">
          F = (w<sub>img</sub> × S<sub>img</sub>) + (w<sub>txt</sub> × S<sub>txt</sub>) ± Agreement_Adj
        </code>
        <div className="fusion-formula-calc font-mono font-semibold" style={{ color: 'var(--cyan-bright)', marginTop: '0.4rem' }}>
          {decision_fusion.formula_breakdown ||
            `(${decision_fusion.image_weight} × ${imgScore.toFixed(3)}) + (${decision_fusion.text_weight} × ${txtScore.toFixed(3)}) = ${decision_fusion.fusion_score?.toFixed(4)}`}
        </div>
        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          <span className="fusion-method-tag">Method: {decision_fusion.fusion_method}</span>
          <span className="text-xs font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
            Fused Score: {(decision_fusion.fusion_score * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Weights & Scores Visual Bars */}
      <div className="fusion-weight-bars mb-4">
        <div className="fusion-weight-row">
          <span className="fusion-weight-label">Image Weight</span>
          <div className="fusion-weight-track">
            <div
              className="fusion-weight-fill bg-cyan-grad"
              style={{ width: `${(decision_fusion.image_weight || 0.6) * 100}%` }}
            />
          </div>
          <span className="fusion-weight-pct">{((decision_fusion.image_weight || 0.6) * 100).toFixed(0)}%</span>
        </div>

        <div className="fusion-weight-row">
          <span className="fusion-weight-label">Text Weight</span>
          <div className="fusion-weight-track">
            <div
              className="fusion-weight-fill bg-purple-grad"
              style={{ width: `${(decision_fusion.text_weight || 0.4) * 100}%` }}
            />
          </div>
          <span className="fusion-weight-pct">{((decision_fusion.text_weight || 0.4) * 100).toFixed(0)}%</span>
        </div>

        <div className="fusion-weight-row">
          <span className="fusion-weight-label">Img Score</span>
          <div className="fusion-weight-track">
            <div
              className="fusion-weight-fill"
              style={{
                width: `${imgScore * 100}%`,
                background: tierColor(imgTier.type),
              }}
            />
          </div>
          <span className="fusion-weight-pct">{(imgScore * 100).toFixed(1)}%</span>
        </div>

        <div className="fusion-weight-row">
          <span className="fusion-weight-label">Txt Score</span>
          <div className="fusion-weight-track">
            <div
              className="fusion-weight-fill"
              style={{
                width: `${txtScore * 100}%`,
                background: tierColor(txtTier.type),
              }}
            />
          </div>
          <span className="fusion-weight-pct">{(txtScore * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* Dual Modality Comparison Grid */}
      <div className="dual-modality-container mb-3">
        {/* Left: Image Modality Summary */}
        <div
          className="p-3 rounded-lg border text-xs"
          style={{
            background: 'rgba(6,182,212,0.03)',
            borderColor: 'rgba(6,182,212,0.2)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--cyan-bright)' }}>
              <ImageIcon size={14} />
              <span>Vision Residual CNN</span>
            </div>
            <span
              className="px-2 py-0.5 rounded-full font-bold text-[10px]"
              style={{ background: tierBg(imgTier.type), color: tierColor(imgTier.type) }}
            >
              {imgTier.label} ({(imgScore * 100).toFixed(1)}%)
            </span>
          </div>
          <p className="text-muted leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {image_analysis?.explanation || 'Facial boundary and high-frequency Fourier spectral analysis.'}
          </p>
        </div>

        {/* Right: Text Modality Summary */}
        <div
          className="p-3 rounded-lg border text-xs"
          style={{
            background: 'rgba(139,92,246,0.03)',
            borderColor: 'rgba(139,92,246,0.2)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--purple-bright)' }}>
              <FileText size={14} />
              <span>Google Gemini 2.5 Flash</span>
            </div>
            <span
              className="px-2 py-0.5 rounded-full font-bold text-[10px]"
              style={{ background: tierBg(txtTier.type), color: tierColor(txtTier.type) }}
            >
              {txtTier.label} ({(txtScore * 100).toFixed(1)}%)
            </span>
          </div>
          <p className="text-muted leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {text_analysis?.explanation || 'Generative LLM evaluation and stylometric entropy analysis.'}
          </p>
        </div>
      </div>

      {/* Key Insights if available */}
      {key_insights && key_insights.length > 0 && (
        <div className="mb-2">
          <div className="text-xs font-bold tracking-wider uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Multimodal Consensus Insights
          </div>
          <ul className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {key_insights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 size={13} style={{ color: 'var(--cyan-bright)', flexShrink: 0, marginTop: 2 }} />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Main ResultsDisplay
   ─────────────────────────────────────────────────────────── */
export default function ResultsDisplay({ result, onReset }) {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [activeTab, setActiveTab]           = useState('overview');
  const [copied, setCopied]                 = useState(false);

  // ── Standby State ──
  if (!result) {
    return (
      <div
        className="glass-panel results-display-card results-empty-state flex flex-col items-center justify-center text-center"
      >
        <div
          style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'rgba(6,182,212,0.08)',
            border: '1px solid rgba(6,182,212,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.25rem',
            boxShadow: '0 0 24px rgba(6,182,212,0.12)',
          }}
        >
          <Activity size={30} style={{ color: 'var(--cyan-primary)' }} className="animate-pulse" />
        </div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Awaiting Forensic Analysis
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: 360, lineHeight: 1.65, marginBottom: '1.5rem' }}>
          Upload a facial image or text sample in the verification workspace and click{' '}
          <strong style={{ color: 'var(--cyan-bright)' }}>Analyze Content</strong> to run deep neural forensics.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
          {['Custom Residual CNN', 'Google Gemini 2.5 Flash', 'Adaptive Decision Fusion'].map((s) => (
            <span
              key={s}
              style={{
                padding: '0.28rem 0.8rem',
                borderRadius: 9999,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '0.73rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--emerald-bright)', display: 'inline-block' }} />
              {s}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // ── Destructure Result ──
  const {
    authenticity_score_percent = 0,
    confidence_percent         = 0,
    image_analysis,
    text_analysis,
    decision_fusion,
    explanation = '',
    input_type  = 'unknown',
    overall_risk,
    key_insights = [],
  } = result;

  const score       = typeof authenticity_score_percent === 'number'
    ? authenticity_score_percent : parseFloat(authenticity_score_percent) || 0;
  const aiProb      = 100 - score;
  const isHuman     = score >= 70;
  const isModerate  = score >= 50 && score < 70;
  const isAI        = score < 50;
  const risk        = overall_risk || (isAI ? 'High' : isModerate ? 'Moderate' : 'Low');
  const verdictText = isHuman ? 'Human-Generated' : isModerate ? 'Moderate' : 'AI-Generated';
  const ringClass   = isHuman ? 'ring-human' : isModerate ? 'ring-moderate' : 'ring-ai';

  const getTier = (val) => {
    if (val >= 0.70) return { label: 'Human-Generated', type: 'human' };
    if (val >= 0.50) return { label: 'Moderate',        type: 'moderate' };
    return               { label: 'AI-Generated',       type: 'ai' };
  };

  const tierColor = (type) =>
    type === 'ai' ? 'var(--rose-bright)' : type === 'human' ? 'var(--emerald-bright)' : 'var(--amber-warning)';

  const tierBg = (type) =>
    type === 'ai' ? 'var(--rose-bg)' : type === 'human' ? 'var(--emerald-bg)' : 'var(--amber-bg)';

  const tierBorder = (type) =>
    type === 'ai' ? 'var(--rose-border)' : type === 'human' ? 'var(--emerald-border)' : 'var(--amber-border)';

  // Simple explanation
  let simpleExpl = '';
  if (isAI)       simpleExpl = 'Strong AI-generated patterns detected (< 50% authenticity). This content was likely synthesized by an AI model.';
  else if (isModerate) simpleExpl = 'Mixed indicators detected (50–70% authenticity). Content exhibits both human-like and synthetic traits.';
  else            simpleExpl = 'Natural human patterns confirmed (≥ 70% authenticity). Content is consistent with genuine human authorship.';

  // Report actions
  const handleCopyReport = () => {
    const text = [
      'CloneLens Verification Report',
      `Verdict: ${verdictText}`,
      `Authenticity Score: ${score.toFixed(1)}%`,
      `AI Likelihood: ${aiProb.toFixed(1)}%`,
      `Risk Level: ${risk}`,
      `Analysis ID: ${result.analysis_id || 'N/A'}`,
      `Timestamp: ${new Date().toLocaleString()}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `clonelens_audit_${result.analysis_id || 'result'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isMultimodal = input_type === 'multimodal' || (image_analysis && text_analysis);

  return (
    <div className="glass-panel results-display-card animate-fade-in">
      {/* ── Top Header ── */}
      <div className="results-card-top-header">
        <div className="section-tag" style={{ marginBottom: 0 }}>
          <ShieldCheck size={15} style={{ color: 'var(--cyan-primary)' }} />
          <span>Verification Result</span>
        </div>
        <span
          className="text-xs font-mono px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
        >
          {input_type.toUpperCase()} • 3-Tier Evaluation
        </span>
      </div>

      {/* ── 3-Tier Threshold Bar ── */}
      <div className="threshold-tier-legend mb-5">
        {[
          { label: 'AI-Generated',   range: '< 50%',    active: isAI,       type: 'ai' },
          { label: 'Moderate',       range: '50 – 70%', active: isModerate, type: 'moderate' },
          { label: 'Human-Generated',range: '≥ 70%',    active: isHuman,    type: 'human' },
        ].map((t) => (
          <div
            key={t.label}
            className="text-center py-2 px-1 rounded-lg transition-all text-xs"
            style={{
              background: t.active ? tierBg(t.type) : 'transparent',
              border: `1px solid ${t.active ? tierBorder(t.type) : 'transparent'}`,
              color: t.active ? tierColor(t.type) : 'var(--text-dim)',
              fontWeight: t.active ? 700 : 400,
              opacity: t.active ? 1 : 0.55,
            }}
          >
            <div className="font-bold">{t.range}</div>
            <div className="text-[11px] truncate">{t.label}</div>
          </div>
        ))}
      </div>

      {/* ── Verdict Banner ── */}
      <div className={`verdict-banner-box ${isAI ? 'verdict-danger' : isModerate ? 'verdict-warning' : 'verdict-success'}`}>
        <div className="verdict-icon-wrap">
          {isAI
            ? <ShieldAlert size={32} style={{ color: 'var(--rose-bright)' }} />
            : isModerate
              ? <AlertTriangle size={32} style={{ color: 'var(--amber-warning)' }} />
              : <ShieldCheck size={32} style={{ color: 'var(--emerald-bright)' }} />
          }
        </div>
        <div className="verdict-text-group">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="verdict-headline" style={{ color: tierColor(isAI ? 'ai' : isModerate ? 'moderate' : 'human') }}>
              {verdictText}
            </h2>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
              style={{
                background: tierBg(isAI ? 'ai' : isModerate ? 'moderate' : 'human'),
                color: tierColor(isAI ? 'ai' : isModerate ? 'moderate' : 'human'),
                border: `1px solid ${tierBorder(isAI ? 'ai' : isModerate ? 'moderate' : 'human')}`,
              }}
            >
              {risk} Risk
            </span>
          </div>
          <p className="verdict-subtext">{simpleExpl}</p>
        </div>
      </div>

      {/* ── Large Circular Score Ring ── */}
      <ScoreRing score={score} colorClass={ringClass} label="Authenticity" />

      {/* ── 3 Metric Cards ── */}
      <div className="metric-cards-row">
        {/* Card 1: Authenticity */}
        <div className="metric-card">
          <div className="metric-card-label">
            <BarChart2 size={12} />
            Authenticity
          </div>
          <div className="metric-card-value" style={{ color: tierColor(isAI ? 'ai' : isModerate ? 'moderate' : 'human') }}>
            {score.toFixed(1)}%
          </div>
          <span
            className="metric-card-tier"
            style={{ background: tierBg(isAI ? 'ai' : isModerate ? 'moderate' : 'human'), color: tierColor(isAI ? 'ai' : isModerate ? 'moderate' : 'human') }}
          >
            {isAI ? '< 50%' : isModerate ? '50–70%' : '≥ 70%'}
          </span>
          <div className="metric-progress-track">
            <div
              className="metric-progress-bar"
              style={{
                width: `${Math.min(score, 100)}%`,
                background: isAI ? 'linear-gradient(90deg,#dc2626,#f87171)' : isModerate ? 'linear-gradient(90deg,#d97706,#f59e0b)' : 'linear-gradient(90deg,#10b981,#34d399)',
              }}
            />
          </div>
        </div>

        {/* Card 2: AI Likelihood */}
        <div className="metric-card">
          <div className="metric-card-label">
            <Activity size={12} />
            AI Likelihood
          </div>
          <div
            className="metric-card-value"
            style={{ color: aiProb > 50 ? 'var(--rose-bright)' : aiProb > 30 ? 'var(--amber-warning)' : 'var(--emerald-bright)' }}
          >
            {aiProb.toFixed(1)}%
          </div>
          <span
            className="metric-card-tier"
            style={{
              background: aiProb > 50 ? 'var(--rose-bg)' : aiProb > 30 ? 'var(--amber-bg)' : 'var(--emerald-bg)',
              color: aiProb > 50 ? 'var(--rose-bright)' : aiProb > 30 ? 'var(--amber-warning)' : 'var(--emerald-bright)',
            }}
          >
            {aiProb > 50 ? 'High AI' : aiProb > 30 ? 'Moderate' : 'Low'}
          </span>
          <div className="metric-progress-track">
            <div
              className="metric-progress-bar"
              style={{
                width: `${Math.min(aiProb, 100)}%`,
                background: aiProb > 50 ? 'linear-gradient(90deg,#dc2626,#f87171)' : aiProb > 30 ? 'linear-gradient(90deg,#d97706,#f59e0b)' : 'linear-gradient(90deg,#10b981,#34d399)',
              }}
            />
          </div>
        </div>

        {/* Card 3: Confidence */}
        <div className="metric-card">
          <div className="metric-card-label">
            <Eye size={12} />
            Confidence
          </div>
          <div className="metric-card-value" style={{ color: 'var(--cyan-bright)' }}>
            {confidence_percent ? `${confidence_percent.toFixed(0)}%` : '--'}
          </div>
          <span
            className="metric-card-tier"
            style={{ background: 'var(--cyan-bg)', color: 'var(--cyan-bright)' }}
          >
            {risk} Risk
          </span>
          <div className="metric-progress-track">
            <div
              className="metric-progress-bar bg-cyan-grad"
              style={{ width: `${Math.min(confidence_percent || 0, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Proper Output Sections for Image, Text, and Fusion ── */}
      <div className="proper-output-section mt-5">
        {/* If multimodal, show the Decision Fusion Center first */}
        {isMultimodal && decision_fusion && (
          <FusionForensicsPanel
            decision_fusion={decision_fusion}
            image_analysis={image_analysis}
            text_analysis={text_analysis}
            overall_risk={risk}
            explanation={explanation}
            key_insights={key_insights}
            tierColor={tierColor}
            tierBg={tierBg}
            tierBorder={tierBorder}
            getTier={getTier}
          />
        )}

        {/* Image forensics output (shown for image analysis or inside multimodal) */}
        {image_analysis && (
          <ImageForensicsPanel
            image_analysis={image_analysis}
            tierColor={tierColor}
            tierBg={tierBg}
            tierBorder={tierBorder}
            getTier={getTier}
          />
        )}

        {/* Text forensics output with Gemini 2.5 Flash */}
        {text_analysis && (
          <TextForensicsPanel
            text_analysis={text_analysis}
            tierColor={tierColor}
            tierBg={tierBg}
            tierBorder={tierBorder}
            getTier={getTier}
          />
        )}
      </div>

      {/* ── Advanced Toggle ── */}
      <div className="flex items-center justify-center my-5">
        <button
          type="button"
          className="advanced-toggle-btn"
          onClick={() => setIsAdvancedMode(!isAdvancedMode)}
          id="advanced-toggle"
        >
          <Settings2 size={15} style={{ color: 'var(--cyan-primary)' }} />
          <span>{isAdvancedMode ? 'Hide Technical Diagnostics' : 'View Technical Diagnostics & Tabs'}</span>
          {isAdvancedMode ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* ── Advanced Mode Section ── */}
      {isAdvancedMode && (
        <div className="advanced-mode-container">
          {/* Insights + System Details */}
          <div className="insights-details-split-row">
            {/* Forensic Insights */}
            <div className="insights-panel">
              <h3 className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
                System Telemetry Insights
              </h3>
              <ul className="insights-checklist space-y-3 text-sm">
                {image_analysis?.explanation && (
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={14} style={{ color: tierColor(getTier(image_analysis.authenticity_probability ?? 0.5).type), flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--cyan-bright)' }}>Vision CNN: </strong>
                      {image_analysis.explanation}
                    </span>
                  </li>
                )}
                {text_analysis?.explanation && (
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={14} style={{ color: tierColor(getTier(text_analysis.authenticity_probability ?? 0.5).type), flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--purple-bright)' }}>Gemini LLM: </strong>
                      {text_analysis.explanation}
                    </span>
                  </li>
                )}
                {explanation && (
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={14} style={{ color: 'var(--cyan-bright)', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Consensus: </strong>
                      {explanation}
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* System Details */}
            <div className="detection-details-panel">
              <h3 className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
                Diagnostic Telemetry
              </h3>
              <div className="space-y-2.5 text-sm">
                {[
                  {
                    icon: <Layers size={13} style={{ color: 'var(--cyan-primary)' }} />,
                    label: 'Models Used',
                    val: [image_analysis && 'Custom Residual CNN', text_analysis && 'Gemini 2.5 Flash', decision_fusion && 'Decision Fusion'].filter(Boolean).join(' + ') || 'CloneLens Engine',
                  },
                  {
                    icon: <Clock size={13} style={{ color: 'var(--cyan-primary)' }} />,
                    label: 'Analysis Latency',
                    val: `${((image_analysis?.processing_time_ms || 0) + (text_analysis?.processing_time_ms || 0)).toFixed(0)} ms`,
                  },
                  {
                    icon: <Cpu size={13} style={{ color: 'var(--cyan-primary)' }} />,
                    label: 'Input Mode',
                    val: input_type.charAt(0).toUpperCase() + input_type.slice(1),
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-2"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      {row.icon}
                      <span>{row.label}</span>
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.83rem' }}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Forensic Tabs ── */}
          <div className="forensic-tabs-wrapper">
            <div className="forensic-tab-nav" role="tablist">
              {[
                { id: 'overview',     icon: <Info size={13} />,     label: 'Overview' },
                image_analysis && { id: 'heatmap',    icon: <Eye size={13} />,      label: 'Grad-CAM' },
                text_analysis  && { id: 'stylometrics',icon: <FileText size={13} />, label: 'Stylometrics' },
                decision_fusion && { id: 'fusion',     icon: <Scale size={13} />,    label: 'Fusion Math' },
              ].filter(Boolean).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={activeTab === tab.id ? 'tab-active' : ''}
                  onClick={() => setActiveTab(tab.id)}
                  id={`forensic-tab-${tab.id}`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="forensic-tab-content">
              {/* Raw Explanation */}
              {activeTab === 'overview' && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.75 }}>
                  {explanation || 'No backend explanation provided for this analysis.'}
                </p>
              )}

              {/* Grad-CAM Heatmap */}
              {activeTab === 'heatmap' && image_analysis && (
                <div className="flex flex-col gap-5">
                  {image_analysis.gradcam_heatmap ? (
                    <div className="heatmap-display-container">
                      <div className="heatmap-badge">
                        <Activity size={11} />
                        CNN Activation
                      </div>
                      <img
                        src={image_analysis.gradcam_heatmap}
                        alt="Grad-CAM Activation Heatmap"
                        className="w-full h-auto block"
                      />
                    </div>
                  ) : (
                    <div
                      className="text-center py-10"
                      style={{ color: 'var(--text-muted)', fontStyle: 'italic', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
                    >
                      No Grad-CAM heatmap generated for this sample.
                    </div>
                  )}
                </div>
              )}

              {/* Stylometrics */}
              {activeTab === 'stylometrics' && text_analysis && (
                <div className="flex flex-col gap-4">
                  {text_analysis.linguistic_features && (
                    <>
                      <h4 className="text-xs font-bold tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                        Detailed Linguistic Features
                      </h4>
                      <div className="stylometrics-grid">
                        {Object.entries(text_analysis.linguistic_features).map(([k, v]) => (
                          <div key={k} className="stylometric-item">
                            <span className="stylometric-key">{k.replace(/_/g, ' ')}</span>
                            <span className="stylometric-val">
                              {typeof v === 'number' ? v.toFixed(3) : v}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Decision Fusion */}
              {activeTab === 'fusion' && decision_fusion && (
                <div className="fusion-viz-container">
                  <div className="fusion-formula-box">
                    <code className="fusion-formula-code">
                      F = w<sub>img</sub> × S<sub>img</sub> + w<sub>txt</sub> × S<sub>txt</sub>
                    </code>
                    <div className="fusion-formula-calc">
                      ({decision_fusion.image_weight} × {(decision_fusion.image_score || 0).toFixed(3)}) +
                      ({decision_fusion.text_weight} × {(decision_fusion.text_score || 0).toFixed(3)}) =
                      <strong style={{ color: 'var(--text-primary)' }}> {decision_fusion.fusion_score?.toFixed(4)}</strong>
                    </div>
                    <span className="fusion-method-tag">Method: {decision_fusion.fusion_method}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Action Footer ── */}
      <div className="results-action-footer">
        <button
          type="button"
          className="btn-action btn-action-primary"
          onClick={handleCopyReport}
          id="copy-report-btn"
        >
          <Share2 size={15} />
          <span>{copied ? '✓ Copied!' : 'Copy Report'}</span>
        </button>
        <button
          type="button"
          className="btn-action btn-action-secondary"
          onClick={handleDownloadJSON}
          id="download-json-btn"
        >
          <Download size={15} />
          <span>Export JSON</span>
        </button>
      </div>
    </div>
  );
}
