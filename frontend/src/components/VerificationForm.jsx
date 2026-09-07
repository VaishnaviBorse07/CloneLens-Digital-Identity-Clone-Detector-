import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Sparkles,
  X,
  Zap,
  Loader2,
  Lock,
  Layers,
  Info,
  CheckCircle2,
} from 'lucide-react';

const AI_SAMPLE_TEXT =
  "Furthermore, in summary, it is crucial to remember that artificial intelligence represents a multifaceted tapestry of modern computational innovation, seamlessly blending algorithmic precision with high-dimensional data representation.";
const HUMAN_SAMPLE_TEXT =
  "Hey, just wanted to check in about the project timeline! I ran the test on my laptop yesterday and noticed the latency dropped significantly once we cleaned up the batch loader. Let me know what you think.";

const SAMPLE_AVATAR_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="%230d0f1a"/><circle cx="50" cy="42" r="22" fill="%2306b6d4" opacity="0.22"/><circle cx="50" cy="40" r="18" fill="%238b5cf6" opacity="0.55"/><path d="M22 88 C22 68, 78 68, 78 88 Z" fill="%23a78bfa" opacity="0.45"/><circle cx="43" cy="38" r="2.5" fill="%2322d3ee"/><circle cx="57" cy="38" r="2.5" fill="%2322d3ee"/><path d="M46 47 Q50 50 54 47" stroke="%23f0f4ff" stroke-width="1.5" fill="none"/></svg>`;

export default function VerificationForm({ onAnalyze, loading }) {
  const [mode, setMode]               = useState('image');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [inputText, setInputText]     = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver]   = useState(false);
  const fileInputRef = useRef(null);

  // Set a lightweight default sample on first mount
  useEffect(() => {
    const defaultFile = new File(['dummy'], 'sample.jpg', { type: 'image/jpeg' });
    setSelectedFile(defaultFile);
    setImagePreview(SAMPLE_AVATAR_SVG);
  }, []);

  const validateAndSetFile = (file) => {
    setErrorMessage('');
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      setErrorMessage('Please upload a valid JPEG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size exceeds the 10 MB limit.');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => validateAndSetFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleClearImage = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLoadAuthenticPreset = () => {
    setErrorMessage('');
    const f = new File(['authentic'], 'authentic_portrait.jpg', { type: 'image/jpeg' });
    setSelectedFile(f);
    setImagePreview(SAMPLE_AVATAR_SVG);
    setInputText(HUMAN_SAMPLE_TEXT);
  };

  const handleLoadClonePreset = () => {
    setErrorMessage('');
    const f = new File(['deepfake clone sample'], 'synthetic_clone.jpg', { type: 'image/jpeg' });
    setSelectedFile(f);
    setImagePreview(SAMPLE_AVATAR_SVG);
    setInputText(AI_SAMPLE_TEXT);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (mode === 'image' && !selectedFile) {
      setErrorMessage('Please select or drop a facial image for analysis.');
      return;
    }
    if (mode === 'text' && (!inputText.trim() || inputText.trim().length < 5)) {
      setErrorMessage('Please provide at least 5 characters of text for NLP analysis.');
      return;
    }
    if (mode === 'multimodal' && !selectedFile && !inputText.trim()) {
      setErrorMessage('Please provide an image, text, or both for multimodal analysis.');
      return;
    }
    onAnalyze({ mode, file: selectedFile, text: inputText.trim() });
  };

  const wordCount = inputText.split(/\s+/).filter(Boolean).length;

  return (
    <div className="glass-panel verification-input-card">
      {/* ── Card Header ── */}
      <div className="workspace-card-header">
        <div className="section-tag mb-0">
          <Sparkles size={15} style={{ color: 'var(--purple-bright)' }} />
          <span>Verification Input</span>
        </div>
        <span
          className="text-xs font-mono px-2 py-1 rounded"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
        >
          Multimodal · 3-Tier
        </span>
      </div>

      {/* ── Mode Selector Tabs ── */}
      <div className="input-mode-tabs" role="tablist" aria-label="Analysis mode">
        {[
          { key: 'image',      icon: <ImageIcon size={14} />, label: 'Image / Media' },
          { key: 'text',       icon: <FileText size={14} />,  label: 'Text' },
          { key: 'multimodal', icon: <Layers size={14} />,    label: 'Multimodal' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={mode === tab.key}
            className={`mode-tab-btn ${mode === tab.key ? 'mode-tab-active' : ''}`}
            onClick={() => { setMode(tab.key); setErrorMessage(''); }}
            id={`tab-${tab.key}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="verification-form-body">
        {/* Error */}
        {errorMessage && (
          <div className="form-error-alert" role="alert">
            <Info size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ── Image Dropzone ── */}
        {(mode === 'image' || mode === 'multimodal') && (
          <div className="input-field-group">
            <div
              className={`dropzone-box ${isDragOver ? 'dropzone-dragover' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload facial image"
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp,image/jpg"
                className="hidden-file-input"
                aria-hidden="true"
              />
              <div className="dropzone-icon-circle">
                <UploadCloud size={24} style={{ color: 'var(--cyan-primary)' }} />
              </div>
              <p className="dropzone-main-text">
                {isDragOver ? 'Release to upload' : 'Drag & drop an image here'}
              </p>
              <p className="dropzone-sub-link">or click to browse files</p>
              <span className="dropzone-formats">JPG · PNG · WEBP &nbsp;·&nbsp; Max 10 MB</span>
            </div>

            {/* File Preview */}
            {selectedFile && (
              <div className="selected-preview-card">
                <div className="preview-avatar-wrap">
                  {imagePreview
                    ? <img src={imagePreview} alt="Preview" className="preview-thumb-img" />
                    : <div className="preview-placeholder"><ImageIcon size={18} /></div>
                  }
                </div>
                <div className="preview-file-details">
                  <span className="preview-filename">{selectedFile.name || 'sample.jpg'}</span>
                  <span className="preview-filesize">
                    {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(0)} KB` : '< 1 KB'}
                  </span>
                </div>
                <button
                  type="button"
                  className="preview-remove-btn"
                  onClick={handleClearImage}
                  title="Remove image"
                  aria-label="Remove selected image"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Text Editor ── */}
        {(mode === 'text' || mode === 'multimodal') && (
          <div className="input-field-group">
            <div className="text-header-row">
              <label className="text-field-label">
                <FileText size={13} style={{ color: 'var(--purple-bright)' }} />
                <span>Text / Bio / Social Content</span>
              </label>
              <div className="sample-injector-row">
                <button
                  type="button"
                  className="btn-sample-chip"
                  onClick={() => setInputText(AI_SAMPLE_TEXT)}
                  title="Load AI-generated sample text"
                >
                  AI Sample
                </button>
                <button
                  type="button"
                  className="btn-sample-chip"
                  onClick={() => setInputText(HUMAN_SAMPLE_TEXT)}
                  title="Load human-authored sample text"
                >
                  Human Sample
                </button>
              </div>
            </div>

            <div className="custom-textarea-container">
              <textarea
                className="custom-cyber-textarea"
                placeholder="Paste identity bio, dialogue, email, or social post to analyze linguistic stylometry..."
                rows={mode === 'multimodal' ? 4 : 7}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                id="text-input-area"
                aria-label="Text content for analysis"
              />
              <div className="textarea-meta-bar">
                <span>{inputText.length} chars</span>
                <span>{wordCount} words</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Quick Presets ── */}
        <div className="quick-presets-bar">
          <span className="preset-label">Quick Test:</span>
          <button type="button" className="preset-btn" onClick={handleLoadAuthenticPreset} id="preset-authentic">
            <CheckCircle2 size={12} className="inline mr-1 text-emerald-400" />
            Authentic Sample
          </button>
          <button type="button" className="preset-btn" onClick={handleLoadClonePreset} id="preset-clone">
            <Zap size={12} className="inline mr-1 text-rose-400" />
            AI Clone Sample
          </button>
        </div>

        {/* ── Analyze Button ── */}
        <div className="submit-row">
          <button
            type="submit"
            className="btn-analyze-content"
            disabled={loading}
            id="analyze-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                <span>Running Deep Neural &amp; NLP Forensics...</span>
              </>
            ) : (
              <>
                <Zap size={17} />
                <span>Analyze Content</span>
              </>
            )}
          </button>
        </div>

        {/* Privacy Note */}
        <div className="privacy-footnote">
          <Lock size={12} style={{ color: 'var(--cyan-primary)' }} />
          <span>Your data is never stored or shared externally.</span>
        </div>
      </form>
    </div>
  );
}
