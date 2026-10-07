import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Download, 
  Check, 
  X, 
  Printer, 
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';

export default function InvestigationReportModal({ isOpen, onClose, reportData, investigationTitle }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !reportData) return null;

  const {
    id = `FS-INV-${Math.floor(1000 + Math.random() * 9000)}`,
    summary = '',
    primaryIssue = {},
    confidence = {},
    evidence = [],
    crossModalReasoning = [],
    contradictions = [],
    missingEvidence = [],
    nextBestQuestion = {},
    recommendations = [],
    safetyNote = '',
    report = ''
  } = reportData;

  const fullReportMarkdown = report || `# FIELDSENSE AI MULTIMODAL INVESTIGATION REPORT
**Investigation ID:** ${id}
**Date:** ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
**Incident Title:** ${investigationTitle || primaryIssue?.title || 'Operational Incident'}

---

## 1. Executive Summary
${summary}

## 2. Primary Issue Diagnosed
**${primaryIssue?.title || 'Operational Variance'}**
${primaryIssue?.description || ''}

## 3. Evidence Consistency & Confidence
- **Confidence Rating:** ${confidence.score}% (${confidence.label})
- **Basis:** ${confidence.explanation}

## 4. Evidence Matrix (${evidence.length} Sources Analyzed)
${evidence.map(e => `- [${e.modality.toUpperCase()}] "${e.observation}" -> Status: ${e.type.toUpperCase()} (Impact: ${e.impact.toUpperCase()}) | Reason: ${e.reason}`).join('\n')}

## 5. Cross-Modal Fusion
${crossModalReasoning.map((c, i) => `### Correlation ${i + 1}\n- **Correlated Modalities:** ${c.evidenceIds?.join(', ')}\n- **Reasoning:** ${c.reasoning}`).join('\n\n')}

## 6. Contradiction Analysis
${contradictions.length > 0 
  ? contradictions.map(con => `⚠ **Conflict [${con.severity.toUpperCase()}]:** ${con.description}\nSources: ${con.sources?.join(', ')}`).join('\n\n')
  : '✓ No major contradictions detected across modalities.'}

## 7. Next Best Question (Targeted Diagnostic Inquiry)
> **Question:** ${nextBestQuestion?.question || 'N/A'}
> **Why it matters:** ${nextBestQuestion?.reason || 'N/A'}

## 8. Recommended Actions
${recommendations.map((r, i) => `${i + 1}. **[${r.priority.toUpperCase()}]** ${r.action}\n   *Rationale:* ${r.reason}`).join('\n\n')}

## 9. Safety Protocol
${safetyNote || 'Follow standard OSHA Lockout/Tagout (LOTO) procedures.'}

---
*Notice: AI-assisted investigation report. Requires licensed field technician verification before physical intervention.*`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullReportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fullReportMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FieldSense_Investigation_${id}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] glass-panel border border-brand-500/40 bg-surface-950 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-5 border-b border-surface-800 bg-surface-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/40">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide font-mono">
                INVESTIGATION REPORT
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                ID: {id} • Generated {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-800 hover:bg-surface-700 text-slate-200 border border-surface-700 flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-500 hover:bg-brand-400 text-white shadow-md shadow-brand-500/30 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-800 text-slate-400 hover:text-white transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Report Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-200 font-mono text-xs leading-relaxed">
          
          {/* Header Block */}
          <div className="p-4 rounded-xl bg-surface-900 border border-surface-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-800 pb-2">
              <span className="text-brand-300 font-bold text-sm">
                FIELDSENSE AI EVIDENCE AUDIT
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-800 text-cyan-400 text-[11px]">
                {confidence.label || 'High'} Confidence ({confidence.score || 85}%)
              </span>
            </div>
            <p className="text-slate-300 text-xs">
              <strong className="text-white">Incident:</strong> {investigationTitle || primaryIssue?.title}
            </p>
            <p className="text-slate-400 text-[11px]">
              <strong className="text-white">Primary Diagnosis:</strong> {primaryIssue?.description}
            </p>
          </div>

          {/* Formatted Report View */}
          <div className="p-5 rounded-xl bg-surface-900/60 border border-surface-800/80 whitespace-pre-wrap font-sans text-xs leading-relaxed space-y-4">
            <h4 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">
              --- REPORT SUMMARY &amp; AUDIT TRAIL ---
            </h4>
            <p className="text-slate-200">
              {summary}
            </p>

            <div className="pt-2">
              <h5 className="font-bold text-slate-100 font-mono text-[11px] mb-2 uppercase text-cyan-400">
                EVIDENCE BREAKDOWN ({evidence.length} Modalities)
              </h5>
              <div className="space-y-1.5 pl-2 border-l-2 border-brand-500/50">
                {evidence.map((ev, i) => (
                  <div key={i} className="text-[11px] text-slate-300">
                    <span className="font-bold text-white uppercase">[{ev.modality}]:</span> "{ev.observation}" — <span className="text-cyan-300">{ev.type}</span> ({ev.impact} impact)
                  </div>
                ))}
              </div>
            </div>

            {contradictions.length > 0 && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-200 text-xs">
                <span className="font-bold block mb-1">⚠ CONTRADICTION FLAGGED:</span>
                {contradictions[0].description}
              </div>
            )}

            <div className="p-3 rounded-lg bg-surface-850 border border-brand-400/30">
              <span className="font-bold text-cyan-300 font-mono block mb-1">🎯 TARGET INQUIRY:</span>
              <p className="text-white italic">"{nextBestQuestion?.question}"</p>
              <p className="text-slate-400 text-[11px] mt-1">{nextBestQuestion?.reason}</p>
            </div>

            <div>
              <h5 className="font-bold text-slate-100 font-mono text-[11px] mb-1 uppercase text-cyan-400">
                RECOMMENDED ACTIONS
              </h5>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 text-xs">
                {recommendations.map((r, i) => (
                  <li key={i}><strong className="text-white">[{r.priority.toUpperCase()}]</strong> {r.action}</li>
                ))}
              </ol>
            </div>

            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-[11px]">
              <strong className="block mb-0.5">MANDATORY SAFETY:</strong>
              {safetyNote}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-surface-800 bg-surface-900/90 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Powered by FieldSense AI Multimodal Evidence Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-surface-800 hover:bg-surface-700 text-white transition-colors"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
}
