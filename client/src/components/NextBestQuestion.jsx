import React from 'react';
import { Target, HelpCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function NextBestQuestion({ nextBestQuestion }) {
  if (!nextBestQuestion || !nextBestQuestion.question) return null;

  return (
    <div className="p-6 rounded-2xl glass-panel border border-brand-400/50 bg-gradient-to-br from-surface-900 via-surface-900 to-brand-950/40 shadow-2xl space-y-4 relative overflow-hidden">
      
      {/* Decorative target backdrop glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-surface-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-500/20 border border-brand-500/40 text-brand-300 shadow-md shadow-brand-500/20">
            <Target className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
              🎯 NEXT BEST QUESTION
            </h3>
            <p className="text-xs text-brand-300/80">
              The single highest-value piece of next evidence to isolate the root cause
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/40">
          Target Diagnostic
        </span>
      </div>

      {/* Target Question Display */}
      <div className="p-4 rounded-xl bg-surface-850/90 border border-brand-400/30 shadow-inner">
        <p className="text-sm font-bold text-white tracking-wide leading-relaxed">
          "{nextBestQuestion.question}"
        </p>
      </div>

      {/* Why This Matters Section */}
      <div className="p-3.5 rounded-xl bg-surface-950/60 border border-surface-800 space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Why this matters</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-normal pl-5">
          {nextBestQuestion.reason}
        </p>
      </div>

    </div>
  );
}
