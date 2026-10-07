import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Activity, 
  GitMerge, 
  Target, 
  FileText, 
  PlayCircle,
  AlertTriangle,
  Zap,
  CheckCircle2
} from 'lucide-react';
import MultimodalFlowDiagram from '../components/MultimodalFlowDiagram';

export default function LandingPage({ onLoadDemo }) {
  const navigate = useNavigate();

  const handleLaunchDemo = (key) => {
    if (onLoadDemo) onLoadDemo(key);
    navigate('/investigate');
  };

  return (
    <div className="space-y-20 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        
        {/* Glow pill badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/40 text-brand-300 text-xs font-mono font-medium shadow-lg shadow-brand-500/10 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Next-Generation Multimodal Investigation Assistant</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
            FIELDSENSE <span className="bg-gradient-to-r from-brand-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="text-xl sm:text-2xl font-bold text-slate-200 tracking-wide font-mono">
            "See it. Hear it. Understand it. Cross-check it."
          </p>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Turn fragmented field evidence into explainable, evidence-backed operational decisions. Because different modalities don't just add information — they challenge, corroborate, and validate each other.
          </p>
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/investigate"
            className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white shadow-xl shadow-brand-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Start Investigation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => handleLaunchDemo('vibration')}
            className="px-6 py-3 rounded-xl text-sm font-bold bg-surface-850 hover:bg-surface-800 text-slate-200 border border-surface-700 hover:border-brand-500/40 flex items-center gap-2 transition-all shadow-md"
          >
            <PlayCircle className="w-4 h-4 text-brand-400" />
            <span>Try 1-Click Demo</span>
          </button>
        </div>

        {/* Interactive Visual Flow Diagram */}
        <div className="pt-8">
          <MultimodalFlowDiagram />
        </div>

      </section>

      {/* The Real-World Problem Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
            THE OPERATIONAL BOTTLENECK
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Why Single-Modality Diagnostic Tools Fail
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Field technicians and maintenance engineers are overwhelmed by fragmented evidence: text tickets, quick smartphone photos, engine audio clips, equipment videos, and scanned PDF manuals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-panel border border-surface-750 bg-surface-900/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold font-mono">
              01
            </div>
            <h3 className="text-base font-bold text-white">Siloed Analysis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard AI systems analyze an image or transcribe an audio note in complete isolation, failing to correlate timestamps, physical locations, or rotational cycles.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-surface-750 bg-surface-900/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold font-mono">
              02
            </div>
            <h3 className="text-base font-bold text-white">Undetected Contradictions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Technician tickets frequently report subjective symptoms (e.g. "Overheating") that clash directly with empirical sensor photos (e.g. 41.8°C). Generic chatbots hallucinate confirmation instead of flagging the contradiction.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-surface-750 bg-surface-900/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold font-mono">
              03
            </div>
            <h3 className="text-base font-bold text-white">No Diagnostic Direction</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When evidence is inconclusive, typical assistants produce generic bullet points rather than formulating the single, high-impact next physical observation to resolve ambiguity.
            </p>
          </div>
        </div>
      </section>

      {/* Core Innovation & Differentiators */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="p-8 rounded-3xl glass-panel border border-brand-500/30 bg-gradient-to-b from-surface-900/90 to-surface-950/90 shadow-2xl relative overflow-hidden">
          
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-400" />
              THE FIELDSENSE AI ADVANTAGE
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Evidence Fusion &amp; Cross-Examination
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              FieldSense treats every uploaded item as an independent witness. Modalities are evaluated for factual observations, mutual corroboration, conflicting telemetry, and missing pieces before formulating any recommendation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="p-4 rounded-xl bg-surface-850/80 border border-surface-700/80 space-y-2">
              <div className="text-emerald-400 flex items-center gap-2 font-mono text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>EVIDENCE MATRIX</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tabulates facts across images, audio, video, docs, and text with definitive status and impact weights.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-850/80 border border-surface-700/80 space-y-2">
              <div className="text-rose-400 flex items-center gap-2 font-mono text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>CONFLICT DETECTION</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Actively isolates and flags factual disagreements between human reports and sensor instruments.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-850/80 border border-surface-700/80 space-y-2">
              <div className="text-cyan-400 flex items-center gap-2 font-mono text-xs font-bold">
                <Target className="w-4 h-4" />
                <span>NEXT BEST QUESTION</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pinpoints the exact next measurement or angle needed to isolate competing hypotheses.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-850/80 border border-surface-700/80 space-y-2">
              <div className="text-indigo-400 flex items-center gap-2 font-mono text-xs font-bold">
                <FileText className="w-4 h-4" />
                <span>AUDITABLE REPORTS</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Exports structured markdown investigation reports complete with safety warnings and evidence trails.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Hackathon Demo Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-2xl border border-surface-700 bg-surface-900/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold text-white">
              Ready to test in 30 seconds?
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Load our pre-configured industrial demo cases: evaluate multi-source corroboration in Demo 1 (Belt Vibration) or test contradictory symptom detection in Demo 2 (Thermal Conflict).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleLaunchDemo('vibration')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-400 text-white shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Launch Demo 1 (Corroboration)</span>
            </button>

            <button
              onClick={() => handleLaunchDemo('overheating')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Launch Demo 2 (Contradiction)</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
