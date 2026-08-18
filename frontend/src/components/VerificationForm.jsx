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
  Sliders, 
  Check, 
  Info,
  Flame,
  FileCheck
} from 'lucide-react';

const AI_SAMPLE_TEXT = "Furthermore, in summary, it is crucial to remember that artificial intelligence represents a multifaceted tapestry of modern computational innovation, seamlessly blending algorithmic precision with high-dimensional data representation.";
const HUMAN_SAMPLE_TEXT = "Hey, just wanted to check in about the project timeline! I ran the test on my laptop yesterday and noticed the latency dropped significantly once we cleaned up the batch loader. Let me know what you think.";

// Synthetic avatar SVG data URL for built-in sample preview
const SAMPLE_AVATAR_DATA_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%230e1626"><rect width="100" height="100" rx="16" fill="%230b1121"/><circle cx="50" cy="42" r="22" fill="%2338bdf8" opacity="0.3"/><circle cx="50" cy="40" r="18" fill="%23818cf8" opacity="0.6"/><path d="M22 88 C22 68, 78 68, 78 88 Z" fill="%23c084fc" opacity="0.5"/><circle cx="43" cy="38" r="2.5" fill="%2300f2fe"/><circle cx="57" cy="38" r="2.5" fill="%2300f2fe"/><path d="M46 47 Q50 50 54 47" stroke="%23f8fafc" stroke-width="1.5" fill="none"/></svg>`;

export default function VerificationForm({ onAnalyze, loading, initialMode = 'image' }) {
  const [mode, setMode] = useState('image'); // 'image', 'text', 'multimodal'
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [inputText, setInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize with the sample shown in screenshot on first mount
  useEffect(() => {
    // Set a lightweight mock default sample matching the screenshot
    const defaultSampleFile = new File(["dummy sample content"], "sample.jpg", { type: "image/jpeg" });
    setSelectedFile(defaultSampleFile);
    setImagePreview(SAMPLE_AVATAR_DATA_URL);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    setErrorMessage('');
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      setErrorMessage('Please upload a valid JPEG, PNG, or WEBP facial image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size exceeds maximum limit of 10MB.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleClearImage = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Quick Preset Handlers
  const handleLoadAuthenticPreset = () => {
    setErrorMessage('');
    const sample = new File(["authentic sample"], "authentic_portrait.jpg", { type: "image/jpeg" });
    setSelectedFile(sample);
    setImagePreview(SAMPLE_AVATAR_DATA_URL);
    if (mode === 'text') setMode('image');
  };

  const handleLoadClonePreset = () => {
    setErrorMessage('');
    const sample = new File(["deepfake clone sample"], "synthetic_clone.jpg", { type: "image/jpeg" });
    setSelectedFile(sample);
    setImagePreview(SAMPLE_AVATAR_DATA_URL);
    if (mode === 'text') setMode('image');
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

    if (mode === 'multimodal') {
      if (!selectedFile && !inputText.trim()) {
        setErrorMessage('Please provide a facial image, text snippet, or both for multimodal analysis.');
        return;
      }
    }

    onAnalyze({
      mode,
      file: selectedFile,
      text: inputText.trim(),
    });
  };

  return (
    <div className="glass-panel verification-input-card">
      {/* Card Header Tag */}
      <div className="workspace-card-header">
        <div className="section-tag mb-0">
          <Sparkles size={16} className="text-purple-bright" />
          <span>VERIFICATION INPUT</span>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="input-mode-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'image'}
          className={`mode-tab-btn ${mode === 'image' ? 'mode-tab-active' : ''}`}
          onClick={() => { setMode('image'); setErrorMessage(''); }}
        >
          <ImageIcon size={15} />
          <span>Image / Media</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === 'text'}
          className={`mode-tab-btn ${mode === 'text' ? 'mode-tab-active' : ''}`}
          onClick={() => { setMode('text'); setErrorMessage(''); }}
        >
          <FileText size={15} />
          <span>Text</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === 'multimodal'}
          className={`mode-tab-btn ${mode === 'multimodal' ? 'mode-tab-active' : ''}`}
          onClick={() => { setMode('multimodal'); setErrorMessage(''); }}
        >
          <Layers size={15} />
          <span>Multimodal</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="verification-form-body">
        {/* Error Alert Box */}
        {errorMessage && (
          <div className="form-error-alert" role="alert">
            <Info size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Image Input / Dropzone Area */}
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
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp,image/jpg"
                className="hidden-file-input"
              />
              <div className="dropzone-icon-circle">
                <UploadCloud size={28} className="text-cyan-primary" />
              </div>
              <p className="dropzone-main-text">Drag &amp; drop an image here</p>
              <p className="dropzone-sub-link">or click to browse</p>
              <span className="dropzone-formats">Supports: JPG, PNG, JPEG, WEBP (Max 10MB)</span>
            </div>

            {/* Selected File Preview Item (Matching Screenshot) */}
            {selectedFile && (
              <div className="selected-preview-card">
                <div className="preview-avatar-wrap">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Selected preview" className="preview-thumb-img" />
                  ) : (
                    <div className="preview-placeholder">
                      <ImageIcon size={18} />
                    </div>
                  )}
                </div>

                <div className="preview-file-details">
                  <span className="preview-filename">{selectedFile.name || 'sample.jpg'}</span>
                  <span className="preview-filesize">
                    {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(0)} KB` : '256 KB'}
                  </span>
                </div>

                <button
                  type="button"
                  className="preview-remove-btn"
                  onClick={handleClearImage}
                  title="Remove uploaded image"
                  aria-label="Remove image"
                >
                  <X size={15} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Text Input Area */}
        {(mode === 'text' || mode === 'multimodal') && (
          <div className="input-field-group">
            <div className="text-header-row">
              <label className="text-field-label">
                <FileText size={14} className="text-purple-bright" />
                <span>Text / Bio / Social Content</span>
              </label>

              <div className="sample-injector-row">
                <button
                  type="button"
                  className="btn-sample-chip"
                  onClick={() => setInputText(AI_SAMPLE_TEXT)}
                >
                  AI Sample
                </button>
                <button
                  type="button"
                  className="btn-sample-chip"
                  onClick={() => setInputText(HUMAN_SAMPLE_TEXT)}
                >
                  Human Sample
                </button>
              </div>
            </div>

            <div className="custom-textarea-container">
              <textarea
                className="custom-cyber-textarea"
                placeholder="Paste identity bio, dialogue, email, or social post to analyze linguistic stylometry..."
                rows={mode === 'multimodal' ? 4 : 6}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="textarea-meta-bar">
                <span>{inputText.length} characters</span>
                <span>{inputText.split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>
          </div>
        )}

        {/* Preset Quick Loader Buttons */}
        <div className="quick-presets-bar">
          <span className="preset-label">Quick Test:</span>
          <button 
            type="button" 
            className="preset-btn"
            onClick={handleLoadAuthenticPreset}
          >
            Authentic Sample
          </button>
          <button 
            type="button" 
            className="preset-btn"
            onClick={handleLoadClonePreset}
          >
            AI Clone Sample
          </button>
        </div>

        {/* Big Submit Button */}
        <div className="submit-row">
          <button
            type="submit"
            className="btn-analyze-content"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Running Deep Neural &amp; NLP Forensics...</span>
              </>
            ) : (
              <>
                <Zap size={18} className="fill-white" />
                <span>Analyze Content</span>
              </>
            )}
          </button>
        </div>

        {/* Security / Privacy Footnote */}
        <div className="privacy-footnote">
          <Lock size={13} className="text-cyan-primary" />
          <span>Your data is never stored or shared.</span>
        </div>
      </form>
    </div>
  );
}
