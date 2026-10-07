import React from 'react';
import { ShieldCheck, AlertCircle, Info, Sparkles } from 'lucide-react';

export default function ConfidenceMeter({ score = 0, label = 'Medium', explanation = '' }) {
  // Normalize score between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));

  // SVG circular gauge geometry
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const getColorClasses = () => {
    if (normalizedScore >= 75) {
      return {
        text: 'text-emerald-400',
        stroke: 'stroke-emerald-400',
        bg: 'bg-emerald-950/40',
        border: 'border-emerald-800/50',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      };
    }
    if (normalizedScore >= 50) {
      return {
        text: 'text-amber-400',
        stroke: 'stroke-amber-400',
        bg: 'bg-amber-950/40',
        border: 'border-amber-800/50',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      };
    }
    return {
      text: 'text-rose-400',
      stroke: 'stroke-rose-400',
      bg: 'bg-rose-950/40',
      border: 'border-rose-800/50',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    };
  };

  const colors = getColorClasses();

  return (
    <div className={`p-5 rounded-2xl glass-panel border ${colors.border} bg-surface-900/80 shadow-xl flex flex-col sm:flex-row items-center gap-6`}>
      
      {/* Circular SVG Gauge */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <svg className="w-28 h-28 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            className="stroke-surface-800"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            className={`${colors.stroke} transition-all duration-1000 ease-out`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-2xl font-black font-mono tracking-tight ${colors.text}`}>
            {normalizedScore}%
          </span>
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">
            CONSISTENCY
          </span>
        </div>
      </div>

      {/* Confidence explanation and disclaimer */}
      <div className="space-y-2 flex-1 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider font-mono border ${colors.badge}`}>
            {label.toUpperCase()} CONFIDENCE
          </span>
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Cross-Modal Evidence Agreement
          </span>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          {explanation || 'Confidence calculated from mutual reinforcement across provided sensory modalities.'}
        </p>

        {/* Disclaimer Notice */}
        <div className="flex items-start gap-1.5 pt-1 text-[11px] text-slate-400 font-mono">
          <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
          <span>
            AI evidence-consistency metric based on cross-modal corroboration. Does not represent physical statistical certainty.
          </span>
        </div>
      </div>

    </div>
  );
}
