import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Layers, 
  Cpu, 
  FileText, 
  Image as ImageIcon, 
  Info, 
  Scale, 
  Clock, 
  Fingerprint,
  ShieldAlert
} from 'lucide-react';

export default function ResultsDisplay({ result, onReset }) {
  if (!result) return null;

  const {
    analysis_id,
    timestamp,
    input_type,
    final_prediction,
    authenticity_score_percent,
    confidence_percent,
    image_analysis,
    text_analysis,
    decision_fusion,
    explanation,
    disclaimer
  } = result;

  // Determine styling based on verdict
  let verdictBadgeClass = 'badge-success';
  let VerdictIcon = CheckCircle2;
  let scoreColorClass = 'text-emerald';

  if (final_prediction.toLowerCase().includes('ai-generated') || final_prediction.toLowerCase().includes('fake')) {
    verdictBadgeClass = 'badge-danger';
    VerdictIcon = XCircle;
    scoreColorClass = 'text-rose';
  } else if (final_prediction.toLowerCase().includes('potential') || final_prediction.toLowerCase().includes('suspect') || final_prediction.toLowerCase().includes('inconclusive')) {
    verdictBadgeClass = 'badge-warning';
    VerdictIcon = AlertTriangle;
    scoreColorClass = 'text-amber';
  }

  return (
    <div className="results-container">
      {/* Top Banner: Overall Verdict & Scores */}
      <div className="glass-panel results-summary-card">
        <div className="summary-header">
          <div className="summary-title-col">
            <span className="text-muted text-xs uppercase tracking-wider">Analysis Result</span>
            <div className="verdict-row">
              <VerdictIcon size={28} className={scoreColorClass} />
              <h2 className="verdict-title">{final_prediction}</h2>
            </div>
          </div>
          <div className="summary-badge-col">
            <span className={`badge ${verdictBadgeClass} text-sm px-3 py-1`}>
              {input_type.toUpperCase()} VERIFICATION
            </span>
          </div>
        </div>

        {/* Big Score Gauges */}
        <div className="scores-grid">
          <div className="score-box">
            <span className="score-label">Authenticity Score</span>
            <div className="score-value-row">
              <span className={`score-number ${scoreColorClass}`}>{authenticity_score_percent}%</span>
              <span className="score-sub">Authentic</span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className={`progress-bar-fill ${scoreColorClass}-bg`} 
                style={{ width: `${authenticity_score_percent}%` }}
              ></div>
            </div>
          </div>

          <div className="score-box">
            <span className="score-label">Confidence Assessment</span>
            <div className="score-value-row">
              <span className="score-number text-cyan-primary">{confidence_percent}%</span>
              <span className="score-sub">Model Confidence</span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill cyan-bg" 
                style={{ width: `${confidence_percent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Explainability Callout */}
        <div className="explanation-callout">
          <Info size={20} className="text-cyan-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="explanation-heading">Forensic Rationale</p>
            <p className="explanation-text">{explanation}</p>
          </div>
        </div>
      </div>

      {/* Multimodal Modality Breakdown Grid */}
      <div className="modality-breakdown-grid">
        {/* Image Analysis Card */}
        {image_analysis ? (
          <div className="glass-panel breakdown-card">
            <div className="card-top">
              <div className="card-top-title">
                <ImageIcon size={18} className="text-cyan-primary" />
                <h3>Facial Image Forensics</h3>
              </div>
              <span className={`badge ${image_analysis.prediction === 'Authentic' ? 'badge-success' : 'badge-danger'}`}>
                {image_analysis.prediction}
              </span>
            </div>

            <div className="breakdown-metrics">
              <div className="metric-row">
                <span className="text-muted">Authenticity Prob:</span>
                <span className="font-mono font-bold">{(image_analysis.authenticity_probability * 100).toFixed(1)}%</span>
              </div>
              <div className="metric-row">
                <span className="text-muted">Synthetic / AI Prob:</span>
                <span className="font-mono font-bold">{(image_analysis.ai_generated_probability * 100).toFixed(1)}%</span>
              </div>
              <div className="metric-row">
                <span className="text-muted">CNN Confidence:</span>
                <span className="font-mono font-bold">{(image_analysis.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="metric-row">
                <span className="text-muted">Model Status:</span>
                <span className={`badge ${image_analysis.model_status === 'Trained' ? 'badge-success' : 'badge-warning'}`}>
                  {image_analysis.model_status}
                </span>
              </div>
              {image_analysis.image_metadata && (
                <div className="metadata-tags">
                  <span className="meta-tag">Dim: {image_analysis.image_metadata.dimensions}</span>
                  <span className="meta-tag">Sharpness: {image_analysis.image_metadata.sharpness_gradient_metric}</span>
                  <span className="meta-tag">Device: {image_analysis.image_metadata.device}</span>
                </div>
              )}
            </div>
            <p className="sub-explanation">{image_analysis.explanation}</p>
          </div>
        ) : (
          <div className="glass-panel breakdown-card muted-card">
            <div className="card-top">
              <div className="card-top-title">
                <ImageIcon size={18} className="text-muted" />
                <h3 className="text-muted">Image Forensics</h3>
              </div>
              <span className="badge badge-warning">Not Provided</span>
            </div>
            <p className="text-muted text-sm mt-4">No facial image was submitted in this analysis request.</p>
          </div>
        )}

        {/* Text Analysis Card */}
        {text_analysis ? (
          <div className="glass-panel breakdown-card">
            <div className="card-top">
              <div className="card-top-title">
                <FileText size={18} className="text-indigo-primary" />
                <h3>Text Stylometric Forensics</h3>
              </div>
              <span className={`badge ${text_analysis.prediction === 'Human-written' ? 'badge-success' : 'badge-danger'}`}>
                {text_analysis.prediction}
              </span>
            </div>

            <div className="breakdown-metrics">
              <div className="metric-row">
                <span className="text-muted">Human Probability:</span>
                <span className="font-mono font-bold">{(text_analysis.authenticity_probability * 100).toFixed(1)}%</span>
              </div>
              <div className="metric-row">
                <span className="text-muted">AI-Generated Prob:</span>
                <span className="font-mono font-bold">{(text_analysis.ai_generated_probability * 100).toFixed(1)}%</span>
              </div>
              <div className="metric-row">
                <span className="text-muted">Confidence:</span>
                <span className="font-mono font-bold">{(text_analysis.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="metric-row">
                <span className="text-muted">Provider / Suite:</span>
                <span className="badge badge-cyan">{text_analysis.provider.toUpperCase()}</span>
              </div>
              {text_analysis.linguistic_features && (
                <div className="metadata-tags">
                  <span className="meta-tag">Words: {text_analysis.linguistic_features.word_count}</span>
                  <span className="meta-tag">Sentences: {text_analysis.linguistic_features.sentence_count}</span>
                  <span className="meta-tag">Entropy: {text_analysis.linguistic_features.shannon_entropy}</span>
                  <span className="meta-tag">AI Phrases: {text_analysis.linguistic_features.ai_phrase_count}</span>
                </div>
              )}
            </div>
            <p className="sub-explanation">{text_analysis.explanation}</p>
          </div>
        ) : (
          <div className="glass-panel breakdown-card muted-card">
            <div className="card-top">
              <div className="card-top-title">
                <FileText size={18} className="text-muted" />
                <h3 className="text-muted">Text Forensics</h3>
              </div>
              <span className="badge badge-warning">Not Provided</span>
            </div>
            <p className="text-muted text-sm mt-4">No text content was submitted in this analysis request.</p>
          </div>
        )}

        {/* Decision Fusion Engine Card */}
        <div className="glass-panel breakdown-card fusion-card">
          <div className="card-top">
            <div className="card-top-title">
              <Scale size={18} className="text-purple-primary" />
              <h3>Decision Fusion Engine</h3>
            </div>
            <span className="badge badge-cyan">Active Fusion</span>
          </div>

          <div className="breakdown-metrics">
            <div className="metric-row">
              <span className="text-muted">Method:</span>
              <span className="font-mono text-xs text-primary">{decision_fusion.fusion_method}</span>
            </div>
            <div className="metric-row">
              <span className="text-muted">Image Modality Weight:</span>
              <span className="font-mono font-bold">{Math.round(decision_fusion.image_weight * 100)}%</span>
            </div>
            <div className="metric-row">
              <span className="text-muted">Text Modality Weight:</span>
              <span className="font-mono font-bold">{Math.round(decision_fusion.text_weight * 100)}%</span>
            </div>
            <div className="metric-row">
              <span className="text-muted">Fused Score Value:</span>
              <span className="font-mono font-bold text-cyan-primary">{decision_fusion.fusion_score}</span>
            </div>
          </div>
          <div className="equation-box">
            <code>F = ({decision_fusion.image_weight} × S_img) + ({decision_fusion.text_weight} × S_txt)</code>
          </div>
        </div>
      </div>

      {/* Audit & Disclaimer Card */}
      <div className="glass-panel report-meta-card">
        <div className="report-meta-grid">
          <div className="report-meta-item">
            <Fingerprint size={16} className="text-muted" />
            <span className="text-muted text-xs">Analysis ID:</span>
            <span className="font-mono text-xs truncate max-w-[180px]">{analysis_id}</span>
          </div>
          <div className="report-meta-item">
            <Clock size={16} className="text-muted" />
            <span className="text-muted text-xs">Timestamp:</span>
            <span className="font-mono text-xs">{new Date(timestamp).toLocaleString()}</span>
          </div>
          <div className="report-meta-item">
            <Cpu size={16} className="text-muted" />
            <span className="text-muted text-xs">Version:</span>
            <span className="font-mono text-xs">CloneLens v1.0.0</span>
          </div>
        </div>

        <div className="disclaimer-alert">
          <ShieldAlert size={18} className="text-amber-warning flex-shrink-0" />
          <p className="text-xs text-muted">{disclaimer}</p>
        </div>
      </div>
    </div>
  );
}
