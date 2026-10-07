import React from 'react';
import { 
  GitMerge, 
  Link2, 
  Sparkles, 
  CheckCircle2, 
  Layers,
  ArrowRight
} from 'lucide-react';

export default function CrossModalFusion({ crossModalReasoning = [], evidence = [] }) {
  if (!crossModalReasoning || crossModalReasoning.length === 0) return null;

  // Helper to map evidence ID to modality
  const getEvidenceDetails = (id) => {
    return evidence.find(e => e.id === id) || { modality: 'evidence', observation: id };
  };

  return (
    <div className="p-6 rounded-2xl glass-panel border border-brand-500/30 bg-surface-900/80 shadow-xl space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <GitMerge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              CROSS-MODAL EVIDENCE FUSION
            </h3>
            <p className="text-xs text-slate-400">
              How independent evidence sources challenge, corroborate, and validate each other
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
          Core Differentiator
        </span>
      </div>

      {/* Cross-Modal Synthesis Cards */}
      <div className="space-y-3.5">
        {crossModalReasoning.map((item, idx) => {
          return (
            <div 
              key={idx}
              className="p-4 rounded-xl bg-surface-850/80 border border-surface-700/80 hover:border-brand-400/50 transition-all space-y-3 group"
            >
              {/* Linked Evidence Source Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Link2 className="w-3 h-3 text-cyan-400" /> Correlated Sources:
                </span>
                {item.evidenceIds && item.evidenceIds.map((evId, sIdx) => {
                  const ev = getEvidenceDetails(evId);
                  return (
                    <span 
                      key={sIdx}
                      className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-surface-950 text-cyan-300 border border-surface-700"
                    >
                      {ev.modality || evId}
                    </span>
                  );
                })}
              </div>

              {/* Natural Language Fusion Reasoning */}
              <div className="p-3 rounded-lg bg-surface-900/90 border border-surface-800 text-xs text-slate-200 leading-relaxed font-medium">
                <p>"{item.reasoning}"</p>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mutual Corroboration Verified</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
