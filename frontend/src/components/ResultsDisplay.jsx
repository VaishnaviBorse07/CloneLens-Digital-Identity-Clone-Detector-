import React, { useState } from 'react';
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
  Image as ImageIcon
} from 'lucide-react';

export default function ResultsDisplay({ result, onReset }) {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'heatmap', 'stylometrics', 'fusion'
  const [copied, setCopied] = useState(false);

  // If no result is passed yet, don't show the component or show a placeholder message
  if (!result) {
    return (
      <div className="glass-panel results-display-card flex items-center justify-center min-h-[400px]">
        <div className="text-center text-muted" style={{ padding: '4rem 0', opacity: 0.6 }}>
          <Activity size={32} className="mx-auto mb-3 text-cyan-primary animate-pulse" />
          <p>Awaiting media to verify...</p>
        </div>
      </div>
    );
  }

  const {
    final_prediction = "Moderate",
    confidence_percent = 0,
    authenticity_score_percent = 0,
    image_analysis,
    text_analysis,
    decision_fusion,
    explanation = "No explanation provided by backend.",
    input_type = "unknown"
  } = result;

  // 3-Tier Classification Thresholds:
  // >= 70%: Human-Generated (Authentic / Natural)
  // 50% - 70%: Moderate (Mixed / Inconclusive)
  // < 50%: AI-Generated (Synthetic / Clone)
  const score = typeof authenticity_score_percent === 'number' 
    ? authenticity_score_percent 
    : parseFloat(authenticity_score_percent) || 0;
  
  const isHumanGenerated = score >= 70;
  const isModerate = score >= 50 && score < 70;
  const isAIGenerated = score < 50;

  // Compute metrics based on calibrated 3-tier thresholds
  const aiProbability = 100 - score;
  const mediaAuthenticity = score;
  const overallRisk = isAIGenerated ? 'High' : isModerate ? 'Moderate' : 'Low';

  // Helper for unimodal sub-scores
  const getTierForScore = (val) => {
    if (val >= 0.70) return { label: 'Human-Generated', type: 'human' };
    if (val >= 0.50) return { label: 'Moderate', type: 'moderate' };
    return { label: 'AI-Generated', type: 'ai' };
  };

  const imgScore = image_analysis?.authenticity_probability ?? (image_analysis?.prediction?.toLowerCase().includes('ai') ? 0.2 : 0.8);
  const imgTier = getTierForScore(imgScore);

  const txtScore = text_analysis?.authenticity_probability ?? (text_analysis?.prediction?.toLowerCase().includes('ai') ? 0.2 : 0.8);
  const txtTier = getTierForScore(txtScore);

  const handleCopyReport = () => {
    const tierName = isHumanGenerated ? 'Human-Generated (>=70%)' : isModerate ? 'Moderate (50-70%)' : 'AI-Generated (<50%)';
    const reportText = `CloneLens Verification Report\nVerdict: ${isHumanGenerated ? 'Human-Generated' : isModerate ? 'Moderate' : 'AI-Generated'}\nThreshold Tier: ${tierName}\nAuthenticity Score: ${score.toFixed(1)}%\nAI Likelihood: ${aiProbability.toFixed(1)}%\nRisk Level: ${overallRisk}\nTimestamp: ${new Date().toLocaleString()}`;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `clonelens_audit_${result.analysis_id || 'result'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Simple human-readable explanation based on 3-tier thresholds
  let simpleExplanation = "";
  if (isAIGenerated) {
    simpleExplanation = "Our system detected strong patterns commonly created by Artificial Intelligence (<50% authenticity). This content was likely generated or heavily synthesized by an AI tool.";
  } else if (isModerate) {
    simpleExplanation = "Our system detected moderate or mixed indicators (50%–70% authenticity). The content exhibits both human-like and synthetic traits, or may be lightly edited or compressed.";
  } else {
    simpleExplanation = "Our system confirmed natural human patterns (≥70% authenticity). The content exhibits characteristics consistent with genuine human authorship or authentic camera sensor captures.";
  }

  return (
    <div className="glass-panel results-display-card">
      {/* Top Header */}
      <div className="results-card-top-header flex items-center justify-between">
        <div className="section-tag mb-0">
          <ShieldCheck size={16} className="text-cyan-primary" />
          <span>VERIFICATION RESULT</span>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
          3-Tier Evaluation Active
        </span>
      </div>

      {/* 3-Tier Threshold Indicator Bar */}
      <div className="threshold-tier-legend grid grid-cols-3 gap-2 my-4 p-2 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs">
        <div className={`text-center py-2 px-1 rounded-lg transition-all ${isAIGenerated ? 'bg-rose-500/20 border border-rose-500/60 text-rose-300 font-bold shadow-sm ring-1 ring-rose-500/40' : 'text-slate-400 opacity-60'}`}>
          <div className="font-semibold">&lt; 50%</div>
          <div className="text-[11px] truncate">AI-Generated</div>
        </div>
        <div className={`text-center py-2 px-1 rounded-lg transition-all ${isModerate ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300 font-bold shadow-sm ring-1 ring-amber-500/40' : 'text-slate-400 opacity-60'}`}>
          <div className="font-semibold">50% - 70%</div>
          <div className="text-[11px] truncate">Moderate</div>
        </div>
        <div className={`text-center py-2 px-1 rounded-lg transition-all ${isHumanGenerated ? 'bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 font-bold shadow-sm ring-1 ring-emerald-500/40' : 'text-slate-400 opacity-60'}`}>
          <div className="font-semibold">&ge; 70%</div>
          <div className="text-[11px] truncate">Human-Generated</div>
        </div>
      </div>

      {/* Main Verdict Banner */}
      <div className={`verdict-banner-box ${isAIGenerated ? 'verdict-danger' : isModerate ? 'verdict-warning' : 'verdict-success'} mb-8`}>
        <div className="verdict-icon-wrap">
          {isAIGenerated ? (
            <ShieldAlert size={36} className="text-rose-bright" />
          ) : isModerate ? (
            <AlertTriangle size={36} className="text-amber-400" />
          ) : (
            <ShieldCheck size={36} className="text-emerald-bright" />
          )}
        </div>

        <div className="verdict-text-group">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="verdict-headline text-2xl font-bold">
              {isAIGenerated ? "AI-Generated" : isModerate ? "Moderate" : "Human-Generated"}
            </h2>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${isAIGenerated ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : isModerate ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>
              {overallRisk} Risk
            </span>
          </div>
          <p className="verdict-subtext text-[1.05rem]">
            {simpleExplanation}
          </p>
        </div>
      </div>

      {/* Modality Breakdown for Multimodal */}
      {input_type === 'multimodal' && image_analysis && text_analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Image Result */}
          <div className={`p-5 rounded-xl border flex items-center gap-4 ${imgTier.type === 'ai' ? 'bg-rose-500/10 border-rose-500/30' : imgTier.type === 'human' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
             <div className={`p-3 rounded-lg ${imgTier.type === 'ai' ? 'bg-rose-500/20' : imgTier.type === 'human' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
               <ImageIcon size={28} className={imgTier.type === 'ai' ? 'text-rose-400' : imgTier.type === 'human' ? 'text-emerald-400' : 'text-amber-400'} />
             </div>
             <div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Image Result</div>
                <div className={`text-xl font-bold ${imgTier.type === 'ai' ? 'text-rose-400' : imgTier.type === 'human' ? 'text-emerald-400' : 'text-amber-400'}`}>
                   {imgTier.label} ({((image_analysis.authenticity_probability || 0) * 100).toFixed(1)}%)
                </div>
                {image_analysis.confidence && (
                  <div className="text-xs text-slate-400 mt-1">Confidence: {(image_analysis.confidence * 100).toFixed(1)}%</div>
                )}
             </div>
          </div>
          {/* Text Result */}
          <div className={`p-5 rounded-xl border flex items-center gap-4 ${txtTier.type === 'ai' ? 'bg-rose-500/10 border-rose-500/30' : txtTier.type === 'human' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
             <div className={`p-3 rounded-lg ${txtTier.type === 'ai' ? 'bg-rose-500/20' : txtTier.type === 'human' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
               <FileText size={28} className={txtTier.type === 'ai' ? 'text-rose-400' : txtTier.type === 'human' ? 'text-emerald-400' : 'text-amber-400'} />
             </div>
             <div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Text Result</div>
                <div className={`text-xl font-bold ${txtTier.type === 'ai' ? 'text-rose-400' : txtTier.type === 'human' ? 'text-emerald-400' : 'text-amber-400'}`}>
                   {txtTier.label} ({((text_analysis.authenticity_probability || 0) * 100).toFixed(1)}%)
                </div>
                {text_analysis.confidence && (
                  <div className="text-xs text-slate-400 mt-1">Confidence: {(text_analysis.confidence * 100).toFixed(1)}%</div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* 2 Simple Metric Score Progress Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Metric 1: Authenticity Score */}
        <div className="metric-score-card bg-slate-800/40 p-5 rounded-xl border border-slate-700/50">
          <div className="flex justify-between items-center">
            <span className="metric-score-label text-slate-300 font-medium">Authenticity Score</span>
            <span className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${isHumanGenerated ? 'bg-emerald-500/20 text-emerald-300' : isModerate ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'}`}>
              {isHumanGenerated ? '≥70% Human' : isModerate ? '50-70% Moderate' : '<50% AI'}
            </span>
          </div>
          <div className="metric-score-val-row mt-2 mb-3">
            <span className={`text-3xl font-bold ${mediaAuthenticity >= 70 ? 'text-emerald-bright' : mediaAuthenticity >= 50 ? 'text-amber-400' : 'text-rose-bright'}`}>
              {mediaAuthenticity.toFixed(1)}%
            </span>
          </div>
          <div className="metric-progress-track h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className={`h-full ${mediaAuthenticity >= 70 ? 'bg-emerald-grad' : mediaAuthenticity >= 50 ? 'bg-amber-grad' : 'bg-rose-grad'}`}
              style={{ width: `${Math.min(Math.max(mediaAuthenticity, 0), 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 2: AI Probability */}
        <div className="metric-score-card bg-slate-800/40 p-5 rounded-xl border border-slate-700/50">
          <div className="flex justify-between items-center">
            <span className="metric-score-label text-slate-300 font-medium">Likelihood of being AI</span>
            <span className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${aiProbability > 50 ? 'bg-rose-500/20 text-rose-300' : aiProbability > 30 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
              {aiProbability > 50 ? '>50% AI' : aiProbability > 30 ? 'Moderate' : 'Low'}
            </span>
          </div>
          <div className="metric-score-val-row mt-2 mb-3">
            <span className={`text-3xl font-bold ${aiProbability > 50 ? 'text-rose-bright' : aiProbability > 30 ? 'text-amber-400' : 'text-emerald-bright'}`}>
              {aiProbability.toFixed(1)}%
            </span>
          </div>
          <div className="metric-progress-track h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className={`h-full ${aiProbability > 50 ? 'bg-rose-grad' : aiProbability > 30 ? 'bg-amber-grad' : 'bg-emerald-grad'}`}
              style={{ width: `${Math.min(Math.max(aiProbability, 0), 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Advanced Toggle */}
      <div className="flex items-center justify-center mb-6">
        <button 
          onClick={() => setIsAdvancedMode(!isAdvancedMode)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800/50 hover:bg-slate-700/60 border border-slate-600/50 text-slate-300 transition-colors"
        >
          <Settings2 size={16} className="text-cyan-primary" />
          <span className="font-medium text-sm">
            {isAdvancedMode ? 'Hide Advanced Technical Details' : 'View Advanced Technical Details'}
          </span>
          {isAdvancedMode ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* ADVANCED MODE SECTION */}
      {isAdvancedMode && (
        <div className="advanced-mode-container bg-slate-900/50 p-6 rounded-2xl border border-cyan-primary/20 mb-6 shadow-inner animate-fade-in">
          
          {/* Split Details Row: Key Insights & Detection Details */}
          <div className="insights-details-split-row mb-6">
            {/* Left Column: Key Insights */}
            <div className="insights-panel bg-slate-800/60 p-5 rounded-xl border border-slate-700/50">
              <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4">Forensic Insights</h3>
              <ul className="insights-checklist space-y-3 text-sm">
                {image_analysis?.explanation && (
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className={`${image_analysis.prediction.includes('AI') ? 'text-rose-bright' : 'text-emerald-bright'} flex-shrink-0 mt-0.5`} />
                    <span className="text-slate-300"><strong className="text-cyan-primary font-semibold">Vision CNN:</strong> {image_analysis.explanation}</span>
                  </li>
                )}
                {text_analysis?.explanation && (
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className={`${text_analysis.prediction.includes('AI') ? 'text-rose-bright' : 'text-emerald-bright'} flex-shrink-0 mt-0.5`} />
                    <span className="text-slate-300"><strong className="text-purple-bright font-semibold">NLP Engine:</strong> {text_analysis.explanation}</span>
                  </li>
                )}
                {!image_analysis && !text_analysis && (
                  <li className="text-slate-500 italic">No modal-specific insights available.</li>
                )}
              </ul>
            </div>

            {/* Right Column: Detection Details */}
            <div className="detection-details-panel bg-slate-800/60 p-5 rounded-xl border border-slate-700/50">
              <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4">System Details</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Layers size={14} className="text-cyan-primary" />
                    <span>Models Triggered:</span>
                  </div>
                  <span className="text-slate-200 font-medium">
                    {[image_analysis && "CNN", text_analysis && "LLM"].filter(Boolean).join(" + ") || "Fusion"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={14} className="text-cyan-primary" />
                    <span>Analysis Time:</span>
                  </div>
                  <span className="text-slate-200 font-medium">
                    {((image_analysis?.processing_time_ms || 0) + (text_analysis?.processing_time_ms || 0)).toFixed(0)} ms
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Cpu size={14} className="text-cyan-primary" />
                    <span>Mode:</span>
                  </div>
                  <span className="text-slate-200 font-medium">
                    {input_type.charAt(0).toUpperCase() + input_type.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Forensic Explainability & Deep-Dive Tabs */}
          <div className="forensic-tabs-wrapper border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="forensic-tab-nav bg-slate-800/80 border-b border-slate-700/50 flex">
              <button
                type="button"
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'text-cyan-primary border-b-2 border-cyan-primary bg-slate-700/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/20'}`}
                onClick={() => setActiveTab('overview')}
              >
                <Info size={14} />
                <span>Raw Explanation</span>
              </button>

              {image_analysis && (
                <button
                  type="button"
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'heatmap' ? 'text-cyan-primary border-b-2 border-cyan-primary bg-slate-700/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/20'}`}
                  onClick={() => setActiveTab('heatmap')}
                >
                  <Eye size={14} />
                  <span>Grad-CAM Heatmap</span>
                </button>
              )}

              {text_analysis && (
                <button
                  type="button"
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'stylometrics' ? 'text-cyan-primary border-b-2 border-cyan-primary bg-slate-700/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/20'}`}
                  onClick={() => setActiveTab('stylometrics')}
                >
                  <FileText size={14} />
                  <span>Stylometrics</span>
                </button>
              )}

              {decision_fusion && (
                <button
                  type="button"
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'fusion' ? 'text-cyan-primary border-b-2 border-cyan-primary bg-slate-700/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/20'}`}
                  onClick={() => setActiveTab('fusion')}
                >
                  <Scale size={14} />
                  <span>Fusion Math</span>
                </button>
              )}
            </div>

            <div className="forensic-tab-content bg-slate-800/40 p-5 min-h-[250px]">
              {activeTab === 'overview' && (
                <div className="tab-pane-content text-slate-300 text-sm leading-relaxed">
                  <p>{explanation}</p>
                </div>
              )}

              {activeTab === 'heatmap' && image_analysis && (
                <div className="tab-pane-content flex flex-col gap-6">
                  {image_analysis.gradcam_heatmap ? (
                    <div className="heatmap-display-container relative max-w-sm rounded-lg overflow-hidden border border-slate-600/50 mx-auto shadow-lg">
                      <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur text-xs font-semibold px-2 py-1 rounded text-cyan-primary flex items-center gap-1.5 border border-cyan-primary/30 z-10">
                        <Activity size={12} /> <span>CNN Activation</span>
                      </div>
                      <img 
                        src={image_analysis.gradcam_heatmap} 
                        alt="Grad-CAM Activation Heatmap" 
                        className="w-full h-auto block" 
                      />
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-500 italic border border-dashed border-slate-600/50 rounded-lg">
                      No Grad-CAM Heatmap generated for this sample.
                    </div>
                  )}
                  
                  {image_analysis.forensic_indicators && (
                    <div className="forensic-indicators-box bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                      <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-3">Visual Forensic Indicators</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(image_analysis.forensic_indicators).map(([key, val]) => (
                          <div className="flex justify-between items-center bg-slate-800 p-2.5 rounded border border-slate-700" key={key}>
                            <span className="text-xs text-slate-300 capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="text-xs font-mono text-cyan-400">{typeof val === 'boolean' ? (val ? 'True' : 'False') : typeof val === 'number' ? val.toFixed(2) : val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'stylometrics' && text_analysis && (
                <div className="tab-pane-content flex flex-col gap-5">
                  {text_analysis.linguistic_features && (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(text_analysis.linguistic_features).map(([key, val]) => (
                        <div className="flex justify-between items-center bg-slate-800 p-2.5 rounded border border-slate-700" key={key}>
                          <span className="text-xs text-slate-300 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="text-xs font-mono text-purple-400">{typeof val === 'number' ? val.toFixed(2) : val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {text_analysis.forensic_details?.synthetic_markers?.length > 0 && (
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-rose-900/30">
                      <span className="text-xs font-bold tracking-wider text-rose-400 uppercase mb-3 block">Detected AI Transitional Markers</span>
                      <div className="flex flex-wrap gap-2">
                        {text_analysis.forensic_details.synthetic_markers.map((marker, i) => (
                          <span key={i} className="bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs px-2.5 py-1 rounded">
                            "{marker}"
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'fusion' && decision_fusion && (
                <div className="tab-pane-content flex justify-center items-center py-6">
                  <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700/50 text-center max-w-md">
                    <code className="text-emerald-400 text-lg block mb-4">F = w_img &times; S_img + w_txt &times; S_txt</code>
                    <div className="text-sm text-slate-300 mb-3 font-mono">
                      Calculated:<br/>
                      ({decision_fusion.image_weight} &times; {decision_fusion.image_score?.toFixed(3) || 0}) + ({decision_fusion.text_weight} &times; {decision_fusion.text_score?.toFixed(3) || 0}) = <span className="font-bold text-white">{decision_fusion.fusion_score.toFixed(3)}</span>
                    </div>
                    <div className="text-xs text-cyan-primary/70 mt-4 pt-4 border-t border-slate-700/50">
                      Method: {decision_fusion.fusion_method}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Footer: Share / (Export hidden in simple mode) */}
      <div className="results-action-footer flex gap-3 mt-4 pt-4 border-t border-slate-700/30">
        <button 
          type="button" 
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium transition-colors"
          onClick={handleCopyReport}
        >
          <Share2 size={16} />
          <span>{copied ? 'Copied to Clipboard!' : 'Share Simple Report'}</span>
        </button>

        {isAdvancedMode && (
          <button 
            type="button" 
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 py-2.5 rounded-lg font-medium transition-colors"
            onClick={handleDownloadJSON}
          >
            <Download size={16} />
            <span>Export JSON Audit Data</span>
          </button>
        )}
      </div>
    </div>
  );
}
