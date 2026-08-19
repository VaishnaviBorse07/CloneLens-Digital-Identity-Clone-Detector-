import React from 'react';
import { Network, ScanText, GitMerge, ChevronRight } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section className="py-14 mb-[var(--space-section)] relative">
      <div className="absolute inset-0 bg-slate-900/40 rounded-2xl border border-slate-700/30 backdrop-blur-md"></div>
      
      <div className="relative z-10 px-8 py-10">
        <div className="text-center mb-12">
          <span className="text-cyan-primary text-sm font-bold tracking-widest uppercase mb-3 block">Technology Stack</span>
          <h2 className="text-3xl font-extrabold text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>How CloneLens Works</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            A state-of-the-art forensic pipeline that analyzes both visual frequencies and linguistic patterns to expose deepfakes and AI-generated identities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Connector Line (Desktop Only) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent z-0"></div>

          {/* Step 1: Vision */}
          <div className="relative z-10 bg-slate-800/80 p-8 rounded-xl border border-slate-700/50 hover:border-cyan-primary/50 transition-colors shadow-lg">
            <div className="w-14 h-14 bg-cyan-900/30 border border-cyan-800 rounded-lg flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(58,160,201,0.15)]">
              <Network size={28} className="text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-heading)' }}>1. Spatial Frequency CNN</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Our custom PyTorch neural network scans facial imagery for high-frequency checkerboard artifacts and spectral anomalies characteristic of GANs and diffusion models.
            </p>
          </div>

          {/* Step 2: NLP */}
          <div className="relative z-10 bg-slate-800/80 p-8 rounded-xl border border-slate-700/50 hover:border-purple-primary/50 transition-colors shadow-lg">
            <div className="w-14 h-14 bg-purple-900/30 border border-purple-800 rounded-lg flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(139,111,209,0.15)]">
              <ScanText size={28} className="text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-heading)' }}>2. NLP Stylometrics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Advanced natural language processing engines analyze text for synthetic transitional markers, low clause variance, and unnatural vocabulary distributions.
            </p>
          </div>

          {/* Step 3: Fusion */}
          <div className="relative z-10 bg-slate-800/80 p-8 rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-colors shadow-lg">
            <div className="w-14 h-14 bg-emerald-900/30 border border-emerald-800 rounded-lg flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <GitMerge size={28} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-heading)' }}>3. Decision Fusion</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              A probabilistic fusion matrix weighs both visual and linguistic signals, interpolating confidence scores to render a final, highly accurate authenticity verdict.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
