import React from 'react';
import { 
  Camera, 
  Volume2, 
  Video, 
  FileText, 
  AlignLeft, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  MinusCircle, 
  Table,
  Sparkles
} from 'lucide-react';

export default function EvidenceMatrix({ evidence = [] }) {
  if (!evidence || evidence.length === 0) return null;

  const getModalityIcon = (mod) => {
    switch ((mod || '').toLowerCase()) {
      case 'image': return { icon: Camera, color: 'text-sky-400 bg-sky-950/60 border-sky-800' };
      case 'audio': return { icon: Volume2, color: 'text-indigo-400 bg-indigo-950/60 border-indigo-800' };
      case 'video': return { icon: Video, color: 'text-purple-400 bg-purple-950/60 border-purple-800' };
      case 'document': return { icon: FileText, color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' };
      case 'text': return { icon: AlignLeft, color: 'text-amber-400 bg-amber-950/60 border-amber-800' };
      default: return { icon: AlignLeft, color: 'text-slate-400 bg-surface-800 border-surface-700' };
    }
  };

  const getStatusBadge = (type) => {
    const t = (type || 'neutral').toLowerCase();
    switch (t) {
      case 'supporting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono uppercase tracking-wide bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ✓ SUPPORTS
          </span>
        );
      case 'contradicting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono uppercase tracking-wide bg-rose-950/80 text-rose-300 border border-rose-600/70 shadow-sm animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            ⚠ CONTRADICTS
          </span>
        );
      case 'missing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono uppercase tracking-wide bg-cyan-950/80 text-cyan-300 border border-cyan-600/60">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            ? MISSING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium font-mono uppercase tracking-wide bg-surface-800 text-slate-300 border border-surface-700">
            <MinusCircle className="w-3.5 h-3.5 text-slate-400" />
            ○ NEUTRAL / CONTEXT
          </span>
        );
    }
  };

  const getImpactBadge = (impact) => {
    const imp = (impact || 'medium').toLowerCase();
    switch (imp) {
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-red-950/60 text-red-300 border border-red-800">
            HIGH IMPACT
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider bg-amber-950/60 text-amber-300 border border-amber-800">
            MEDIUM IMPACT
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider bg-surface-800 text-slate-400 border border-surface-700">
            LOW IMPACT
          </span>
        );
    }
  };

  return (
    <div className="p-6 rounded-2xl glass-panel border border-surface-700/80 bg-surface-900/70 shadow-xl space-y-4">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-surface-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-400">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              EVIDENCE CORRELATION MATRIX
            </h3>
            <p className="text-xs text-slate-400">
              Breakdown of facts extracted across independent modalities
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-surface-800 text-brand-300 border border-surface-700">
          {evidence.length} Evidence Sources
        </span>
      </div>

      {/* Responsive Evidence Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-800 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-3">Modality</th>
              <th className="py-3 px-3">Observable Fact / Telemetry</th>
              <th className="py-3 px-3">Alignment Status</th>
              <th className="py-3 px-3">Impact</th>
              <th className="py-3 px-3">Diagnostic Rationale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800/60 text-xs">
            {evidence.map((item, idx) => {
              const { icon: ModIcon, color } = getModalityIcon(item.modality);
              return (
                <tr 
                  key={item.id || idx}
                  className="hover:bg-surface-850/60 transition-colors group"
                >
                  {/* Modality Badge */}
                  <td className="py-3.5 px-3 align-top whitespace-nowrap">
                    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border font-mono font-bold text-[11px] ${color}`}>
                      <ModIcon className="w-3.5 h-3.5" />
                      <span>{item.modality.toUpperCase()}</span>
                    </div>
                  </td>

                  {/* Observation */}
                  <td className="py-3.5 px-3 align-top">
                    <p className="font-semibold text-slate-100 leading-snug">
                      "{item.observation}"
                    </p>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-3 align-top whitespace-nowrap">
                    {getStatusBadge(item.type)}
                  </td>

                  {/* Impact Badge */}
                  <td className="py-3.5 px-3 align-top whitespace-nowrap">
                    {getImpactBadge(item.impact)}
                  </td>

                  {/* Diagnostic Reason */}
                  <td className="py-3.5 px-3 align-top text-slate-300 leading-relaxed font-normal">
                    {item.reason}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
