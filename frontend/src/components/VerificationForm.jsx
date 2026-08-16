import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Sparkles, X, ArrowRight, Loader2, RefreshCcw } from 'lucide-react';

const AI_SAMPLE_TEXT = "Furthermore, in summary, it is crucial to remember that artificial intelligence represents a multifaceted tapestry of modern computational innovation, seamlessly blending algorithmic precision with high-dimensional data representation.";
const HUMAN_SAMPLE_TEXT = "Hey, just wanted to check in about the project timeline! I ran the test on my laptop yesterday and noticed the latency dropped significantly once we cleaned up the batch loader. Let me know what you think.";

export default function VerificationForm({ onAnalyze, loading }) {
  const [mode, setMode] = useState('multimodal'); // 'multimodal', 'image', 'text'
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [inputText, setInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    setErrorMessage('');
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
        setErrorMessage('Please provide a facial image, text snippet, or both for analysis.');
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
    <div className="glass-panel verification-card">
      {/* Mode Selector Tabs */}
      <div className="tab-group">
        <button
          type="button"
          className={`tab-btn ${mode === 'multimodal' ? 'tab-btn-active' : ''}`}
          onClick={() => { setMode('multimodal'); setErrorMessage(''); }}
        >
          <Sparkles size={16} />
          <span>Multimodal Fusion (Image + Text)</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${mode === 'image' ? 'tab-btn-active' : ''}`}
          onClick={() => { setMode('image'); setErrorMessage(''); }}
        >
          <ImageIcon size={16} />
          <span>Facial Image Only</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${mode === 'text' ? 'tab-btn-active' : ''}`}
          onClick={() => { setMode('text'); setErrorMessage(''); }}
        >
          <FileText size={16} />
          <span>Text Analysis Only</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-body">
        {errorMessage && (
          <div className="error-alert">
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="inputs-grid">
          {/* Image Input Section */}
          {(mode === 'multimodal' || mode === 'image') && (
            <div className="input-block">
              <div className="input-header">
                <label className="input-label">
                  <ImageIcon size={16} className="text-cyan-primary" />
                  Facial Image Upload
                </label>
                {mode === 'multimodal' && <span className="text-muted text-xs">(Recommended for Fusion)</span>}
              </div>

              {!imagePreview ? (
                <div
                  className="dropzone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />
                  <UploadCloud size={36} className="text-cyan-primary mb-2" />
                  <p className="dropzone-text">Click or drag & drop facial image</p>
                  <p className="dropzone-sub">PNG, JPG, or WEBP (Max 10MB)</p>
                </div>
              ) : (
                <div className="image-preview-card">
                  <img src={imagePreview} alt="Preview" className="preview-img" />
                  <div className="preview-info">
                    <p className="preview-filename">{selectedFile?.name}</p>
                    <p className="preview-filesize">{(selectedFile?.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    className="clear-img-btn"
                    onClick={handleClearImage}
                    title="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Text Input Section */}
          {(mode === 'multimodal' || mode === 'text') && (
            <div className="input-block">
              <div className="input-header">
                <label className="input-label">
                  <FileText size={16} className="text-indigo-primary" />
                  Identity Text Snippet / Bio / Post
                </label>
                <div className="sample-buttons">
                  <button
                    type="button"
                    className="sample-pill"
                    onClick={() => setInputText(AI_SAMPLE_TEXT)}
                  >
                    AI Sample
                  </button>
                  <button
                    type="button"
                    className="sample-pill"
                    onClick={() => setInputText(HUMAN_SAMPLE_TEXT)}
                  >
                    Human Sample
                  </button>
                </div>
              </div>

              <div className="textarea-wrapper">
                <textarea
                  className="custom-textarea"
                  placeholder="Paste text, bio, social post, or communication here to analyze stylometric and linguistic characteristics..."
                  rows={5}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <div className="textarea-footer">
                  <span>{inputText.length} characters</span>
                  <span>~{inputText.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="form-submit-row">
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Running Deep Neural & NLP Forensics...</span>
              </>
            ) : (
              <>
                <span>Analyze Content</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
