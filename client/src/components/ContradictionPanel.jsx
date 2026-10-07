import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function ContradictionPanel({ contradictions = [] }) {
  const hasContradictions = contradictions && contradictions.length > 0;

  return (
    <div className={`p-6 rounded-2xl glass-panel border transition-all shadow-xl ${
      hasContradictions 
        ? 'border-rose-500/60 bg-gradient-to-b from-rose-950/20 via-surface-900/90 to-surface-900/80 shadow-rose-950/30' 
        : 'border-emerald-500/40 bg-surface-900/70 shadow-emerald-950/20'
    }`}>
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg border ${
            hasContradictions 
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' 
              : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
          }`}>
            {hasContradictions ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              EVIDENCE CONFLICTS &amp; CONTRADICTION DETECTION
            </h3>
            <p className="text-xs text-slate-400">
              Cross-examining reported claims against physical telemetry and documentation
            </p>
          </div>
        </div>

        <div>
          {hasContradictions ? (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
              ⚠ CONFLICT DETECTED
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              ✓ NO CONFLICTS
            </span>
          )}
        </div>
      </div>

      {/* State A: Contradictions Detected */}
      {hasContradictions ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200 leading-relaxed font-semibold">
            <div className="flex items-center gap-2 text-rose-300 mb-1 font-mono uppercase tracking-wider text-[11px]">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Critical Finding: Discrepancy Between Modalities
            </div>
            The provided evidence sources contain conflicting factual assertions. FieldSense AI does not pretend uncertain evidence is certain.
          </div>

          <div className="space-y-3">
            {contradictions.map((item, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl bg-surface-850 border border-rose-900/50 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Conflicting Sources:</span>
                    {item.sources && item.sources.map((src, sIdx) => (
                      <span 
                        key={sIdx}
                        className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-surface-950 text-rose-300 border border-rose-900/80"
                      >
                        {src}
                      </span>
                    ))}
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    item.severity === 'high' ? 'bg-rose-950 text-rose-300 border border-rose-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
                  }`}>
                    {item.severity} Severity
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-medium bg-surface-900 p-3 rounded-lg border border-surface-800">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* State B: No Contradictions Detected */
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-emerald-300">
              No major contradictions detected.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              All independent sensory inputs and reference documentation consistently support the same diagnostic conclusion.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
