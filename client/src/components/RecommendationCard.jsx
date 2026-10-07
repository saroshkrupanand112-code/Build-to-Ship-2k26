import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Wrench, 
  ShieldAlert, 
  Info,
  ArrowRight
} from 'lucide-react';

export default function RecommendationCard({ recommendations = [], safetyNote = '' }) {
  if (!recommendations || recommendations.length === 0) return null;

  const getPriorityBadge = (priority) => {
    switch ((priority || 'medium').toLowerCase()) {
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-950 text-red-300 border border-red-700/80">
            HIGH PRIORITY
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-950 text-amber-300 border border-amber-700/80">
            MEDIUM PRIORITY
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-surface-800 text-slate-300 border border-surface-700">
            LOW PRIORITY
          </span>
        );
    }
  };

  return (
    <div className="p-6 rounded-2xl glass-panel border border-surface-700/80 bg-surface-900/80 shadow-xl space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              AI-ASSISTED RECOMMENDED ACTIONS
            </h3>
            <p className="text-xs text-slate-400">
              Ranked corrective steps formulated from cross-modal synthesis
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-slate-400 border border-surface-750 px-2.5 py-1 rounded-full bg-surface-850">
          Technician Verification Required
        </span>
      </div>

      {/* Safety Notice Callout */}
      {safetyNote && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-600/40 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide font-mono">
              Operational Safety Protocol
            </h4>
            <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
              {safetyNote}
            </p>
          </div>
        </div>
      )}

      {/* Action Steps */}
      <div className="space-y-3">
        {recommendations.map((rec, idx) => (
          <div 
            key={idx}
            className="p-4 rounded-xl bg-surface-850 border border-surface-750/80 hover:border-brand-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
          >
            <div className="flex items-start gap-3 flex-1">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-surface-950 border border-surface-700 text-xs font-mono font-bold text-brand-400 group-hover:border-brand-500 transition-colors">
                {idx + 1}
              </span>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-100 leading-snug">
                  {rec.action}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <strong className="text-slate-300 font-mono">Rationale:</strong> {rec.reason}
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 self-end sm:self-center">
              {getPriorityBadge(rec.priority)}
            </div>
          </div>
        ))}
      </div>

      {/* Legal & Technician Disclaimer */}
      <div className="p-3 rounded-lg bg-surface-950/70 border border-surface-800 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
        <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        <span>
          AI-assisted recommendations do not substitute for on-site physical engineering inspections. All Lockout/Tagout (LOTO) protocols must be observed.
        </span>
      </div>

    </div>
  );
}
