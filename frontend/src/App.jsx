import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import VerificationForm from './components/VerificationForm';
import ResultsDisplay from './components/ResultsDisplay';
import ModelInfoCard from './components/ModelInfoCard';
import Footer from './components/Footer';
import { checkHealth, analyzeImage, analyzeText, analyzeMultimodal } from './services/api';
import { ShieldCheck, Sparkles } from 'lucide-react';
import './App.css';

export default function App() {
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [globalError, setGlobalError] = useState('');

  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const { data, latencyMs } = await checkHealth();
      setHealth({ ...data, latencyMs });
    } catch (err) {
      console.error('Backend health check error:', err);
      setHealth({
        status: 'offline',
        app_name: 'CloneLens Backend',
        database_connected: false,
        models: {
          image_custom_cnn: { status: 'Unreachable' },
          text_nlp_llm: { status: 'Unreachable' },
        },
        latencyMs: 0,
      });
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Auto-refresh health every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = async ({ mode, file, text }) => {
    setAnalyzing(true);
    setGlobalError('');
    setAnalysisResult(null);

    try {
      let result;
      if (mode === 'image' || (mode === 'multimodal' && file && !text)) {
        result = await analyzeImage(file);
      } else if (mode === 'text' || (mode === 'multimodal' && text && !file)) {
        result = await analyzeText(text);
      } else if (mode === 'multimodal' && file && text) {
        result = await analyzeMultimodal(file, text);
      }

      setAnalysisResult(result);
      // Smooth scroll to results
      setTimeout(() => {
        window.scrollTo({
          top: 450,
          behavior: 'smooth',
        });
      }, 100);
    } catch (err) {
      console.error('Analysis error:', err);
      const message = err.response?.data?.detail || err.message || 'An error occurred during clone detection.';
      setGlobalError(message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="app-wrapper">
      <Header
        health={health}
        loadingHealth={loadingHealth}
        onRefreshHealth={fetchHealth}
      />

      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-pill">
            <Sparkles size={14} />
            <span>Multimodal Artificial Intelligence Defense</span>
          </div>
          <h2 className="hero-title">Verify Digital Identity Authenticity</h2>
          <p className="hero-desc">
            Detect deepfakes, synthetic portraits, and AI-generated text using our lightweight Custom PyTorch CNN and Decision Fusion Engine.
          </p>
        </section>

        {/* Global Error Banner if any */}
        {globalError && (
          <div className="error-alert max-w-xl mx-auto mb-6">
            <span>{globalError}</span>
          </div>
        )}

        {/* Verification Form */}
        <VerificationForm
          onAnalyze={handleAnalyze}
          loading={analyzing}
        />

        {/* Results Section */}
        {analysisResult && (
          <ResultsDisplay
            result={analysisResult}
            onReset={() => setAnalysisResult(null)}
          />
        )}

        {/* Architecture & Model Status Information */}
        <ModelInfoCard health={health} />
      </main>

      <Footer />
    </div>
  );
}
