import React from 'react';
import { 
  Camera, 
  Volume2, 
  Video, 
  FileText, 
  AlignLeft, 
  Cpu, 
  GitMerge, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowDown,
  Sparkles
} from 'lucide-react';

export default function MultimodalFlowDiagram() {
  const modalities = [
    { label: 'IMAGE', icon: Camera, desc: 'Visual component inspection', color: 'from-sky-500 to-blue-600', ring: 'ring-sky-500/30' },
    { label: 'AUDIO', icon: Volume2, desc: 'Acoustic frequency analysis', color: 'from-indigo-500 to-purple-600', ring: 'ring-indigo-500/30' },
    { label: 'VIDEO', icon: Video, desc: 'Dynamic oscillation capture', color: 'from-violet-500 to-fuchsia-600', ring: 'ring-violet-500/30' },
    { label: 'DOCUMENT', icon: FileText, desc: 'OEM manuals & tolerances', color: 'from-emerald-500 to-teal-600', ring: 'ring-emerald-500/30' },
    { label: 'TEXT', icon: AlignLeft, desc: 'Technician shift logs', color: 'from-amber-500 to-orange-600', ring: 'ring-amber-500/30' },
  ];

  return (
    <div className="w-full p-6 rounded-2xl glass-panel border border-surface-700/80 bg-surface-900/60 shadow-2xl relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        
        {/* Step 1: Input Modalities */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              STAGE 01: INDEPENDENT SENSORY EVIDENCE INPUTS
            </span>
            <span className="text-[11px] font-mono text-brand-400">5 Distinct Telemetry Sources</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {modalities.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className={`p-3 rounded-xl bg-surface-850/80 border border-surface-700/70 hover:border-brand-400/50 transition-all text-center flex flex-col items-center justify-center group shadow-md hover:shadow-cyan-500/10`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-2 shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 tracking-wide">{item.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 text-center leading-tight line-clamp-1">{item.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Connector Arrow */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center">
            <div className="h-6 w-0.5 bg-gradient-to-b from-brand-400 to-brand-600 animate-pulse" />
            <ArrowDown className="w-4 h-4 text-brand-400 -mt-1" />
          </div>
        </div>

        {/* Step 2: Gemini Multimodal Reasoning Engine */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-brand-950/60 via-surface-850 to-brand-950/60 border border-brand-500/40 shadow-lg text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 text-xs font-mono mb-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            STAGE 02: GOOGLE GEMINI MULTIMODAL REASONING
          </div>
          <h4 className="text-base font-bold text-white tracking-wide">
            Observation &amp; Fact Extraction Pipeline
          </h4>
          <p className="text-xs text-slate-300 max-w-xl mx-auto mt-1">
            Separates empirical facts from technician assumptions, isolates sensory anomalies, and prepares evidence atoms for cross-modal cross-examination.
          </p>
        </div>

        {/* Connector Arrow */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center">
            <div className="h-6 w-0.5 bg-gradient-to-b from-brand-500 to-indigo-500 animate-pulse" />
            <ArrowDown className="w-4 h-4 text-indigo-400 -mt-1" />
          </div>
        </div>

        {/* Step 3: Dual Track - Evidence Fusion & Contradiction Detection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Evidence Fusion */}
          <div className="p-4 rounded-xl bg-surface-850/90 border border-emerald-500/30 shadow-md">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <GitMerge className="w-4 h-4" />
              <span className="text-xs font-bold font-mono uppercase tracking-wide">STAGE 03A: CROSS-MODAL FUSION</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Synthesizes overlapping data: does the 28 Hz acoustic hum correspond to the 3.8mm belt offset visible in the photograph and dynamic oscillation on video?
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-emerald-300/90 bg-emerald-950/50 px-2 py-1 rounded border border-emerald-800/40">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Independent Evidence Corroboration</span>
            </div>
          </div>

          {/* Contradiction Detection */}
          <div className="p-4 rounded-xl bg-surface-850/90 border border-amber-500/30 shadow-md">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-xs font-bold font-mono uppercase tracking-wide">STAGE 03B: CONTRADICTION DETECTOR</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Actively flags disagreements: does the shift report claim "overheating" while the instrument panel photo and OEM tolerance curve verify normal baseline?
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-amber-300/90 bg-amber-950/50 px-2 py-1 rounded border border-amber-800/40">
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Zero-Hallucination Conflict Flagging</span>
            </div>
          </div>

        </div>

        {/* Connector Arrow */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center">
            <div className="h-6 w-0.5 bg-gradient-to-b from-indigo-500 to-brand-400 animate-pulse" />
            <ArrowDown className="w-4 h-4 text-brand-400 -mt-1" />
          </div>
        </div>

        {/* Step 4: Explainable Decision & Next Best Question */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-surface-850 via-surface-800 to-surface-850 border border-brand-400/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <div className="flex items-center gap-2 text-brand-400 mb-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-brand-500/20 px-2 py-0.5 rounded border border-brand-500/30">
                FINAL OUTPUT
              </span>
              <span className="text-sm font-bold text-white">Explainable Decision &amp; Target Query</span>
            </div>
            <p className="text-xs text-slate-300">
              Confidence score, evidence matrix, safety warnings, and the <strong>single most useful next piece of evidence</strong> to request.
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="px-3.5 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/30 flex items-center gap-1.5">
              <span>Auditable Report</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
