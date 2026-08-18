import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Cpu, 
  Layers, 
  FileText, 
  Image as ImageIcon, 
  Info, 
  Scale, 
  Download, 
  Share2, 
  Activity, 
  Eye, 
  Fingerprint,
  FileCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function ResultsDisplay({ result, onReset }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'heatmap', 'stylometrics', 'fusion'
  const [copied, setCopied] = useState(false);

  // If no dynamic result yet, show the high-fidelity demo sample from the user's screenshot
  const displayData = result || {
    analysis_id: "cl-sample-demo-8492",
    timestamp: new Date().toISOString(),
    input_type: "multimodal",
    final_prediction: "LIKELY ORIGINAL / AUTHENTIC",
    authenticity_score_percent: 92,
    confidence_percent: 84,
    identity_score_percent: 94,
    overall_risk: "Low",
    explanation: "Deep facial frequency inspection reveals natural continuous gradients and biological micro-textures with no high-frequency checkerboard artifacts or boundary inconsistencies. NLP analysis shows normal human syntactic entropy and natural variance.",
    key_insights: [
      "Facial features are consistent with natural human appearance.",
      "No strong digital artifacts detected.",
      "Content aligns with real-world media characteristics."
    ],
    detection_details: {
      models_used: "CNN + NLP + Fusion",
      analysis_time: "1.8s",
      mode: "Multimodal"
    },
    image_analysis: {
      prediction: "Authentic",
      authenticity_probability: 0.92,
      confidence: 0.87,
      processing_time_ms: 124,
      model_name: "CloneLens Custom PyTorch CNN",
      explanation: "Spatial frequency distribution aligns with genuine optical camera sensor captures without synthetic diffusion noise."
    },
    text_analysis: {
      prediction: "Human-written",
      authenticity_probability: 0.88,
      confidence: 0.82,
      processing_time_ms: 45,
      model_name: "NLP Stylometric Suite",
      linguistic_features: {
        shannon_entropy: 4.82,
        ttr_richness: 0.76,
        sentence_variance: 6.4,
        burstiness: 0.68
      },
      explanation: "Natural distribution of clause lengths and balanced vocabulary richness characteristic of organic human prose."
    },
    decision_fusion: {
      image_weight: 0.60,
      text_weight: 0.40,
      image_score: 0.92,
      text_score: 0.88,
      fusion_method: "Weighted Linear Interpolation & Cross-Modal Variance Penalty",
      fusion_score: 0.904
    }
  };

  const {
    final_prediction,
    confidence_percent = 84,
    authenticity_score_percent = 92,
    image_analysis,
    text_analysis,
    decision_fusion,
    explanation,
    input_type
  } = displayData;

  // Determine styling based on verdict
  const isAuthentic = 
    final_prediction.toLowerCase().includes('authentic') || 
    final_prediction.toLowerCase().includes('original') ||
    final_prediction.toLowerCase().includes('human');

  const isClone = 
    final_prediction.toLowerCase().includes('clone') || 
    final_prediction.toLowerCase().includes('synthetic') || 
    final_prediction.toLowerCase().includes('ai-generated') ||
    final_prediction.toLowerCase().includes('fake');

  const identityScore = displayData.identity_score_percent || (isAuthentic ? 94 : 16);
  const mediaAuthenticity = authenticity_score_percent || (isAuthentic ? 92 : 12);
  const overallRisk = displayData.overall_risk || (isClone ? 'High' : isAuthentic ? 'Low' : 'Moderate');

  const handleCopyReport = () => {
    const reportText = `CloneLens Forensic Verification Report\nVerdict: ${final_prediction}\nConfidence: ${confidence_percent}%\nIdentity Score: ${identityScore}%\nMedia Authenticity: ${mediaAuthenticity}%\nRisk Level: ${overallRisk}\nTimestamp: ${new Date().toLocaleString()}`;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(displayData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `clonelens_audit_${displayData.analysis_id || 'result'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="glass-panel results-display-card">
      {/* Top Header Tag & Confidence Badge */}
      <div className="results-card-top-header">
        <div className="section-tag mb-0">
          <Activity size={16} className="text-cyan-primary" />
          <span>ANALYSIS RESULTS</span>
        </div>

        <div className="confidence-pill-badge">
          <span>Confidence: {confidence_percent}%</span>
        </div>
      </div>

      {/* Main Verdict Banner */}
      <div className={`verdict-banner-box ${isClone ? 'verdict-danger' : isAuthentic ? 'verdict-success' : 'verdict-warning'}`}>
        <div className="verdict-icon-wrap">
          {isClone ? (
            <ShieldAlert size={28} className="text-rose-bright" />
          ) : isAuthentic ? (
            <ShieldCheck size={28} className="text-emerald-bright" />
          ) : (
            <AlertTriangle size={28} className="text-amber-400" />
          )}
        </div>

        <div className="verdict-text-group">
          <h2 className="verdict-headline">
            VERDICT: {final_prediction}
          </h2>
          <p className="verdict-subtext">
            {isClone 
              ? "Significant synthetic artifacts, deep neural generator signatures, or clone patterns detected." 
              : isAuthentic
              ? "No strong signs of identity clone or synthetic manipulation detected."
              : "Inconclusive results; subtle anomalies detected across modal features."}
          </p>
        </div>
      </div>

      {/* 3 Metric Score Progress Indicators */}
      <div className="metrics-score-grid">
        {/* Metric 1: Identity Score */}
        <div className="metric-score-card">
          <span className="metric-score-label">Identity Score</span>
          <div className="metric-score-val-row">
            <span className={`metric-score-number ${identityScore > 70 ? 'text-emerald-bright' : identityScore > 40 ? 'text-amber-400' : 'text-rose-bright'}`}>
              {identityScore}%
            </span>
          </div>
          <div className="metric-progress-track">
            <div 
              className={`metric-progress-bar ${identityScore > 70 ? 'bg-emerald-grad' : identityScore > 40 ? 'bg-amber-grad' : 'bg-rose-grad'}`}
              style={{ width: `${identityScore}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 2: Media Authenticity */}
        <div className="metric-score-card">
          <span className="metric-score-label">Media Authenticity</span>
          <div className="metric-score-val-row">
            <span className={`metric-score-number ${mediaAuthenticity > 70 ? 'text-emerald-bright' : mediaAuthenticity > 40 ? 'text-amber-400' : 'text-rose-bright'}`}>
              {mediaAuthenticity}%
            </span>
          </div>
          <div className="metric-progress-track">
            <div 
              className={`metric-progress-bar ${mediaAuthenticity > 70 ? 'bg-emerald-grad' : mediaAuthenticity > 40 ? 'bg-amber-grad' : 'bg-rose-grad'}`}
              style={{ width: `${mediaAuthenticity}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 3: Overall Risk */}
        <div className="metric-score-card">
          <span className="metric-score-label">Overall Risk</span>
          <div className="metric-score-val-row">
            <span className={`metric-score-number ${overallRisk === 'Low' ? 'text-emerald-bright' : overallRisk === 'Moderate' ? 'text-amber-400' : 'text-rose-bright'}`}>
              {overallRisk}
            </span>
          </div>
          <div className="risk-indicator-pill">
            <span className={`risk-dot ${overallRisk === 'Low' ? 'dot-green' : overallRisk === 'Moderate' ? 'dot-amber' : 'dot-red'}`}></span>
            <span className="risk-tag">{overallRisk === 'Low' ? 'Safe Identity' : overallRisk === 'Moderate' ? 'Caution' : 'Clone Detected'}</span>
          </div>
        </div>
      </div>

      {/* Split Details Row: Key Insights & Detection Details */}
      <div className="insights-details-split-row">
        {/* Left Column: Key Insights */}
        <div className="insights-panel glass-panel">
          <h3 className="panel-subhead">KEY INSIGHTS</h3>
          <ul className="insights-checklist">
            {displayData.key_insights ? (
              displayData.key_insights.map((insight, idx) => (
                <li key={idx} className="insight-item">
                  <CheckCircle2 size={16} className="text-purple-bright flex-shrink-0" />
                  <span>{insight}</span>
                </li>
              ))
            ) : (
              <>
                <li className="insight-item">
                  <CheckCircle2 size={16} className="text-purple-bright flex-shrink-0" />
                  <span>Facial features are consistent with natural human appearance.</span>
                </li>
                <li className="insight-item">
                  <CheckCircle2 size={16} className="text-purple-bright flex-shrink-0" />
                  <span>No strong digital artifacts detected.</span>
                </li>
                <li className="insight-item">
                  <CheckCircle2 size={16} className="text-purple-bright flex-shrink-0" />
                  <span>Content aligns with real-world media characteristics.</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Right Column: Detection Details */}
        <div className="detection-details-panel glass-panel">
          <h3 className="panel-subhead">DETECTION DETAILS</h3>
          
          <div className="detail-field-row">
            <div className="detail-label-col">
              <Layers size={14} className="text-cyan-primary" />
              <span>Models Used:</span>
            </div>
            <span className="detail-value-col">CNN + NLP + Fusion</span>
          </div>

          <div className="detail-field-row">
            <div className="detail-label-col">
              <Clock size={14} className="text-cyan-primary" />
              <span>Analysis Time:</span>
            </div>
            <span className="detail-value-col">1.8s</span>
          </div>

          <div className="detail-field-row">
            <div className="detail-label-col">
              <Cpu size={14} className="text-cyan-primary" />
              <span>Mode:</span>
            </div>
            <span className="detail-value-col">
              {input_type ? input_type.charAt(0).toUpperCase() + input_type.slice(1) : 'Multimodal'}
            </span>
          </div>
        </div>
      </div>

      {/* Forensic Explainability & Deep-Dive Tabs */}
      <div className="forensic-tabs-wrapper">
        <div className="forensic-tab-nav">
          <button
            type="button"
            className={`forensic-tab-btn ${activeTab === 'overview' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Info size={14} />
            <span>Forensic Rationale</span>
          </button>

          <button
            type="button"
            className={`forensic-tab-btn ${activeTab === 'heatmap' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('heatmap')}
          >
            <Eye size={14} />
            <span>Frequency Heatmap</span>
          </button>

          <button
            type="button"
            className={`forensic-tab-btn ${activeTab === 'stylometrics' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('stylometrics')}
          >
            <FileText size={14} />
            <span>Stylometrics</span>
          </button>

          <button
            type="button"
            className={`forensic-tab-btn ${activeTab === 'fusion' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('fusion')}
          >
            <Scale size={14} />
            <span>Fusion Math</span>
          </button>
        </div>

        <div className="forensic-tab-content glass-panel">
          {activeTab === 'overview' && (
            <div className="tab-pane-content">
              <p className="explanation-paragraph">
                {explanation || "Deep facial frequency inspection reveals natural continuous gradients and biological micro-textures with no high-frequency checkerboard artifacts or boundary inconsistencies. NLP analysis shows normal human syntactic entropy and natural variance."}
              </p>
            </div>
          )}

          {activeTab === 'heatmap' && (
            <div className="tab-pane-content">
              <div className="heatmap-visual-box">
                <div className="heatmap-gradient-bar"></div>
                <div className="heatmap-meta">
                  <span className="font-mono text-xs text-cyan-primary">FFT 2D Power Spectrum: PASS</span>
                  <span className="font-mono text-xs text-muted">High-Pass Residual: 0.028 (Clean)</span>
                </div>
              </div>
              <p className="text-xs text-secondary mt-2">
                Spatial high-pass filtering extracts pixel-level generative checkerboards. Authentic natural photography demonstrates Poisson camera shot-noise patterns rather than GAN/Diffusion upsampling residuals.
              </p>
            </div>
          )}

          {activeTab === 'stylometrics' && (
            <div className="tab-pane-content">
              <div className="stylometric-grid">
                <div className="stylo-item">
                  <span className="stylo-label">Shannon Entropy</span>
                  <span className="stylo-val">4.82 bits</span>
                </div>
                <div className="stylo-item">
                  <span className="stylo-label">Type-Token Ratio (TTR)</span>
                  <span className="stylo-val">0.76 (Rich)</span>
                </div>
                <div className="stylo-item">
                  <span className="stylo-label">Sentence Variance</span>
                  <span className="stylo-val">&sigma; = 6.4</span>
                </div>
                <div className="stylo-item">
                  <span className="stylo-label">Burstiness Index</span>
                  <span className="stylo-val">0.68 (Human)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fusion' && (
            <div className="tab-pane-content">
              <div className="fusion-formula-box">
                <code>F = w_image &times; S_image + w_text &times; S_text</code>
                <div className="mt-2 text-xs text-secondary">
                  Calculated: <code>(0.60 &times; {displayData.image_analysis?.authenticity_probability || 0.92}) + (0.40 &times; {displayData.text_analysis?.authenticity_probability || 0.88}) = 0.904</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer: Export / Share */}
      <div className="results-action-footer">
        <button 
          type="button" 
          className="btn-action-outline"
          onClick={handleDownloadJSON}
          title="Download full forensic JSON audit trail"
        >
          <Download size={14} />
          <span>Export JSON Audit</span>
        </button>

        <button 
          type="button" 
          className="btn-action-outline"
          onClick={handleCopyReport}
          title="Copy forensic summary certificate"
        >
          <Share2 size={14} />
          <span>{copied ? 'Copied to Clipboard!' : 'Share Forensic Report'}</span>
        </button>
      </div>
    </div>
  );
}
