import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  CircleDot, 
  Cpu, 
  Layers, 
  GitMerge, 
  ShieldAlert, 
  Sparkles,
  FileSearch,
  Radar
} from 'lucide-react';

const STAGES = [
  { id: 1, label: 'Reading evidence...', desc: 'Ingesting sensory files and textual incident parameters', icon: FileSearch },
  { id: 2, label: 'Understanding modalities...', desc: 'Processing image, audio frequency, video frames, and manuals', icon: Layers },
  { id: 3, label: 'Extracting observations...', desc: 'Separating empirical facts from assumptions', icon: Cpu },
  { id: 4, label: 'Comparing evidence...', desc: 'Cross-modal correlation & alignment checks', icon: GitMerge },
  { id: 5, label: 'Checking contradictions...', desc: 'Cross-examining sensor readouts against technician claims', icon: ShieldAlert },
  { id: 6, label: 'Estimating confidence...', desc: 'Calculating mutual corroboration score across sources', icon: Sparkles },
  { id: 7, label: 'Generating recommendation...', desc: 'Synthesizing safe, explainable actions & next best question', icon: CheckCircle2 }
];

export default function LoadingPipeline({ isAnalyzing }) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1100);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  if (!isAnalyzing) return null;

  const currentStage = STAGES[currentStageIndex];
  const progressPercent = Math.round(((currentStageIndex + 1) / STAGES.length) * 100);

  return (
    <div className="p-6 rounded-2xl glass-panel border border-brand-500/40 bg-surface-950/90 shadow-2xl space-y-6 relative overflow-hidden">
      
      {/* Background ambient pulse */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-surface-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-400/40 text-brand-300">
            <Cpu className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              MULTIMODAL REASONING IN PROGRESS
            </h3>
            <p className="text-xs text-brand-400 font-mono">
              Stage {currentStageIndex + 1} of {STAGES.length}: {currentStage.label}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xl font-extrabold font-mono text-cyan-400">
            {progressPercent}%
          </span>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
            Analysis Pipeline
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-surface-850 h-2 rounded-full overflow-hidden border border-surface-750">
        <div 
          className="bg-gradient-to-r from-brand-500 via-cyan-400 to-indigo-500 h-full transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Detailed Stage Steps */}
      <div className="space-y-2.5">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const isUpcoming = idx > currentStageIndex;
          const Icon = stage.icon;

          return (
            <div
              key={stage.id}
              className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                isCurrent 
                  ? 'bg-brand-950/40 border-brand-500/60 shadow-md shadow-brand-500/10' 
                  : isDone 
                    ? 'bg-surface-900/60 border-surface-800 text-slate-400' 
                    : 'bg-surface-950/20 border-surface-850 text-slate-600 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-md ${
                  isCurrent 
                    ? 'bg-brand-500/20 text-brand-300' 
                    : isDone 
                      ? 'bg-emerald-950/50 text-emerald-400' 
                      : 'bg-surface-800 text-slate-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-xs font-semibold ${isCurrent ? 'text-white' : isDone ? 'text-slate-300' : 'text-slate-500'}`}>
                    {stage.label}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {stage.desc}
                  </p>
                </div>
              </div>

              <div>
                {isDone && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                {isCurrent && (
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </span>
                )}
                {isUpcoming && (
                  <CircleDot className="w-3.5 h-3.5 text-slate-700" />
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
